#!/usr/bin/env node
import 'dotenv/config';
import { execSync } from 'child_process';
import Groq from 'groq-sdk';
import chalk from 'chalk';
import ora from 'ora';
import * as readline from 'readline';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// ─── Config ──────────────────────────────────────────────────────────────────
const CONFIG_DIR = path.join(os.homedir(), '.commit-gen');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function readConfig(): { apiKey?: string } {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return {};
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveConfig(data: { apiKey: string }) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function getDiff(): string {
  try {
    return execSync('git diff --cached', { cwd: process.cwd() }).toString();
  } catch {
    console.log(chalk.red('\n✖ Git reposu bulunamadı.\n'));
    process.exit(1);
  }
}

// ─── AI ──────────────────────────────────────────────────────────────────────
async function generateMessages(diff: string, apiKey: string): Promise<string[]> {
  const groq = new Groq({ apiKey });

  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `Sen bir git commit mesajı üreticisin.
Conventional commits formatında (feat, fix, chore, docs, style, refactor, test) commit mesajları yaz.
Kullanıcıya 3 farklı seçenek sun.
Her seçeneği yeni satırda yaz.
Sadece commit mesajlarını yaz, başka hiçbir şey yazma.
Numara veya tire koyma başa, sadece mesajı yaz.`,
      },
      {
        role: 'user',
        content: `Bu git diff için 3 farklı commit mesajı öner:\n\n${diff}`,
      },
    ],
  });

  const raw = res?.choices[0]?.message.content ?? '';
  const lines = raw
    .split('\n')
    .map((l: any) => l.trim())
    .filter((l: any) => l.length > 0)
    .slice(0, 3);

  return lines;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(chalk.bold.blue('\n🤖 commit-gen\n'));

  // 1. API key kontrolü
  const config = readConfig();
  let apiKey = config.apiKey ?? process.env.GROQ_API_KEY ?? '';

  if (!apiKey) {
    console.log(chalk.yellow('⚠️  Groq API key bulunamadı.'));
    console.log(chalk.gray('   Ücretsiz almak için → https://console.groq.com\n'));
    apiKey = await ask(chalk.cyan('API Key gir: '));

    if (!apiKey) {
      console.log(chalk.red('\n✖ API key olmadan çalışmaz.\n'));
      process.exit(1);
    }

    saveConfig({ apiKey });
    console.log(chalk.green('\n✔ API key kaydedildi. Bir daha sormayacağım.\n'));
  }

  // 2. Diff kontrolü
  const diff = getDiff();

  if (!diff) {
    console.log(chalk.yellow('\n⚠️  Staged değişiklik yok.'));
    console.log(chalk.gray('   Önce: git add .\n'));
    process.exit(0);
  }

  // 3. AI'a gönder
  const spinner = ora('Commit mesajları üretiliyor...').start();
  let messages: string[] = [];

  try {
    messages = await generateMessages(diff, apiKey);
    spinner.stop();
  } catch (err: any) {
    spinner.stop();

    // Yanlış API key
    if (err?.status === 401) {
      console.log(chalk.red('\n✖ API key geçersiz. Sıfırlanıyor...\n'));
      saveConfig({ apiKey: '' });
      console.log(chalk.gray('Tekrar çalıştır, yeni key girebilirsin.\n'));
      process.exit(1);
    }

    console.log(chalk.red('\n✖ Hata:'), err?.message ?? err);
    process.exit(1);
  }

  if (!messages.length) {
    console.log(chalk.red('\n✖ Mesaj üretilemedi, tekrar dene.\n'));
    process.exit(1);
  }

  // 4. Seçenekleri göster
  console.log(chalk.bold('\n📝 Commit mesajı seç:\n'));
  messages.forEach((msg, i) => {
    console.log(`  ${chalk.bold.cyan(`${i + 1})`)} ${chalk.white(msg)}`);
  });
  console.log(`  ${chalk.bold.gray('0)')} ${chalk.gray('İptal')}\n`);

  const answer = await ask(chalk.cyan('Seçim (0-3): '));
  const choice = parseInt(answer);

  if (!choice || choice < 1 || choice > messages.length) {
    console.log(chalk.gray('\nİptal edildi.\n'));
    process.exit(0);
  }

  const selected = messages[choice - 1];

  // 5. Commit at
  try {
    execSync(`git commit -m "${selected?.replace(/"/g, '\\"')}"`, {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
    console.log(chalk.bold.green('\n🚀 Commit atıldı!\n'));
  } catch {
    console.log(chalk.red('\n✖ Commit atılamadı.\n'));
  }
}

main();
