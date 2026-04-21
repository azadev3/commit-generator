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

const CONFIG_DIR = path.join(os.homedir(), '.commit-gen');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = 'az' | 'en' | 'tr';

interface Config {
  apiKey?: string;
  uiLang?: Lang;
  commitLang?: Lang;
}

// ─── i18n ─────────────────────────────────────────────────────────────────────

const T: Record<Lang, Record<string, string>> = {
  az: {
    banner: '🤖  @azadev/commit-gen  —  AI destekli commit asistani',
    selectUiLang: 'İnterfeys dilini sec:',
    selectCommitLang: 'Commit mesajlarinin dilini sec:',
    langSaved: '✔  Dil parametrleri saxlanildi.',
    noApiKey: '⚠   Groq API acari tapilmadi.',
    apiKeyLink: '    Pulsuz API acari almaq ucun → https://console.groq.com',
    enterApiKey: 'API Acari daxil et: ',
    apiKeyEmpty: '✖  API acari olmasa islemir :( .',
    apiKeySaved: '✔  API acari saxlanildi. Bir daha sorusulmayacaq.',
    apiKeyInvalid: '✖  API acari yanlisdir.',
    apiKeyReset: '   Yeniden basladılır... Yeni acar daxil etmek ucun programi yeniden baslat.',
    noStaged: '⚠   Stage edilmis deyisiklik yoxdur.',
    stagedHint: '    Evvelce: git add .',
    noGit: '✖  Git deposu tapilmadi.',
    generating: '⚡  AI commit mesajlari hazirlayir...',
    noMessages: '✖  Mesaj yaradila bilmedi. Yeniden yoxla.',
    selectCommit: '💡  Commit mesajini sec:',
    cancel: '✖  Ləğv edildi',
    selectPrompt: 'Secim et (0-3): ',
    committed: '🚀  Commit ugurla atildi!',
    commitFailed: '✖  Commit atila bilmedi.',
    error: '✖  Xeta: ',
    langAz: 'Azerbaycanca',
    langEn: 'Ingilisce',
    langTr: 'Turkce',
    resetKey: '🔑  API acari sifirlamaq isteyirsiniz? (b/x): ',
    resetYes: 'b',
    resetDone: '✔  API acari silindi. Yeniden baslatilir...',
    resetNo: '   Sifirlama ləğv edildi.',
  },
  en: {
    banner: '🤖  @azadev/commit-gen  —  AI-powered commit assistant',
    selectUiLang: 'Select interface language:',
    selectCommitLang: 'Select commit message language:',
    langSaved: '✔  Language preferences saved.',
    noApiKey: '⚠   Groq API key not found.',
    apiKeyLink: '    Get yours free → https://console.groq.com',
    enterApiKey: 'Enter API Key: ',
    apiKeyEmpty: '✖  Cannot run without an API key.',
    apiKeySaved: "✔  API key saved. You won't be asked again.",
    apiKeyInvalid: '✖  API key is invalid.',
    apiKeyReset: '   Resetting... Re-run to enter a new key.',
    noStaged: '⚠   No staged changes found.',
    stagedHint: '    Run first: git add .',
    noGit: '✖  No git repository found.',
    generating: '⚡  AI is crafting your commit messages...',
    noMessages: '✖  Could not generate messages. Try again.',
    selectCommit: '💡  Select a commit message:',
    cancel: '✖  Cancelled',
    selectPrompt: 'Your choice (0-3): ',
    committed: '🚀  Commit pushed successfully!',
    commitFailed: '✖  Failed to commit.',
    error: '✖  Error: ',
    langAz: 'Azerbaijani',
    langEn: 'English',
    langTr: 'Turkish',
    resetKey: '🔑  Do you want to reset your API key? (y/n): ',
    resetYes: 'y',
    resetDone: '✔  API key removed. Re-run to enter a new one.',
    resetNo: '   Reset cancelled.',
  },
  tr: {
    banner: '🤖  @azadev/commit-gen  —  AI destekli commit asistanı',
    selectUiLang: 'Arayüz dilini seç:',
    selectCommitLang: 'Commit mesajı dilini seç:',
    langSaved: '✔  Dil tercihleri kaydedildi.',
    noApiKey: '⚠   Groq API anahtarı bulunamadı.',
    apiKeyLink: '    Ücretsiz almak için → https://console.groq.com',
    enterApiKey: 'API Anahtarı gir: ',
    apiKeyEmpty: '✖  API anahtarı olmadan çalışmaz.',
    apiKeySaved: '✔  API anahtarı kaydedildi. Bir daha sorulmayacak.',
    apiKeyInvalid: '✖  API anahtarı geçersiz.',
    apiKeyReset: '   Sıfırlanıyor... Yeni anahtar girmek için tekrar çalıştır.',
    noStaged: '⚠   Stage edilmiş değişiklik yok.',
    stagedHint: '    Önce: git add .',
    noGit: '✖  Git deposu bulunamadı.',
    generating: '⚡  AI commit mesajlarınızı hazırlıyor...',
    noMessages: '✖  Mesaj üretilemedi. Tekrar dene.',
    selectCommit: '💡  Commit mesajı seç:',
    cancel: '✖  İptal edildi',
    selectPrompt: 'Seçim (0-3): ',
    committed: '🚀  Commit başarıyla atıldı!',
    commitFailed: '✖  Commit atılamadı.',
    error: '✖  Hata: ',
    langAz: 'Azerbaycanca',
    langEn: 'İngilizce',
    langTr: 'Türkçe',
    resetKey: '🔑  API anahtarını sıfırlamak ister misin? (e/h): ',
    resetYes: 'e',
    resetDone: '✔  API anahtarı silindi. Yeni girmek için tekrar çalıştır.',
    resetNo: '   Sıfırlama iptal edildi.',
  },
};

let uiLang: Lang = 'az';
const t = (key: string) => T[uiLang][key] ?? key;

// ─── Config ───────────────────────────────────────────────────────────────────

function readConfig(): Config {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return {};
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveConfig(data: Config) {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  const existing = readConfig();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({ ...existing, ...data }, null, 2));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve =>
    rl.question(question, ans => {
      rl.close();
      resolve(ans.trim());
    }),
  );
}

function divider() {
  console.log(chalk.gray('  ' + '─'.repeat(52)));
}

function getDiff(): string {
  try {
    return execSync('git diff --cached', { cwd: process.cwd() }).toString();
  } catch {
    console.log('\n' + chalk.bgRed.white.bold(` ${t('noGit')} `) + '\n');
    process.exit(1);
  }
}

// ─── Language selector ────────────────────────────────────────────────────────

async function selectLang(promptKey: string, current?: Lang): Promise<Lang> {
  const opts: { label: string; value: Lang }[] = [
    { label: 'Azerbaycanca / Azerbaijani', value: 'az' },
    { label: 'English / Ingilisce', value: 'en' },
    { label: 'Türkçe / Turkce', value: 'tr' },
  ];

  console.log('\n' + chalk.bold.cyan(`  ${t(promptKey)}\n`));
  opts.forEach((o, i) => {
    const active = o.value === current;
    console.log(
      active
        ? chalk.bgCyan.black.bold(`  ▶  ${i + 1}) ${o.label}  `)
        : chalk.gray(`     ${i + 1}) ${o.label}`),
    );
  });
  console.log();

  const ans = await ask(chalk.cyan('  → '));
  const idx = parseInt(ans) - 1;
  return opts[idx]?.value ?? current ?? 'az';
}

// ─── API key validation ───────────────────────────────────────────────────────

async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const groq = new Groq({ apiKey });
    await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'hi' }],
    });
    return true;
  } catch (err: any) {
    if (err?.status === 401 || err?.status === 403) return false;
    return true;
  }
}

// ─── AI ───────────────────────────────────────────────────────────────────────

const COMMIT_LANG_PROMPTS: Record<Lang, string> = {
  az: 'Commit mesajlarini Azerbaycan dilinde yaz.',
  en: 'Write commit messages in English.',
  tr: 'Commit mesajlarını Türkçe yaz.',
};

async function generateMessages(diff: string, apiKey: string, commitLang: Lang): Promise<string[]> {
  const groq = new Groq({ apiKey });

  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an expert git commit message generator with deep knowledge of software engineering conventions.
${COMMIT_LANG_PROMPTS[commitLang]}
Rules:
- Use Conventional Commits format: type(scope): description
- Types: feat, fix, refactor, chore, docs, style, test, perf, ci, build
- Be specific and concise — describe WHAT changed and WHY if obvious from diff
- Each message must be meaningfully different (vary type, scope, and angle)
- Never add numbering, bullets, or extra commentary
- Output exactly 3 commit messages, one per line, nothing else`,
      },
      {
        role: 'user',
        content: `Generate 3 distinct, high-quality commit messages for this diff:\n\n${diff.slice(0, 6000)}`,
      },
    ],
  });

  const raw = res?.choices[0]?.message.content ?? '';
  return raw
    .split('\n')
    .map((l: string) => l.replace(/^[\d\-\.\)\*\s]+/, '').trim())
    .filter((l: string) => l.length > 10)
    .slice(0, 3);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  // ── --config ───────────────────────────────────────────────────────────────
  if (args.includes('--config')) {
    console.log('\n' + chalk.bgBlue.white.bold('  📁  @azadev/commit-gen config  '));
    console.log('\n' + chalk.bold('  Fayl yeri:'));
    console.log(chalk.cyan(`  ${CONFIG_FILE}\n`));
    if (fs.existsSync(CONFIG_FILE)) {
      const parsed: Config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      console.log(chalk.bold('  Mövcud konfiqurasiya:'));
      console.log(chalk.gray('  ──────────────────────────────────'));
      console.log(chalk.white('  uiLang     : ') + chalk.cyan(parsed.uiLang ?? '—'));
      console.log(chalk.white('  commitLang : ') + chalk.cyan(parsed.commitLang ?? '—'));
      console.log(
        chalk.white('  apiKey     : ') +
          chalk.green(parsed.apiKey ? parsed.apiKey.slice(0, 8) + '••••••••••••••••' : '—'),
      );
      console.log(chalk.gray('  ──────────────────────────────────'));
    } else {
      console.log(chalk.yellow('  ⚠  Config faylı hələ yaradılmayıb. azadev-commit-gen işlət.\n'));
    }
    console.log(chalk.gray('\n  Dili dəyişmək üçün  →  azadev-commit-gen --reset'));
    console.log(chalk.gray('  API açarı sıfırla   →  azadev-commit-gen --reset-key\n'));
    process.exit(0);
  }

  // ── --reset ────────────────────────────────────────────────────────────────
  if (args.includes('--reset')) {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
      console.log(
        '\n' + chalk.green('  ✔  Config sıfırlandı. Dil və API açarı yenidən sorulacaq.\n'),
      );
    } else {
      console.log('\n' + chalk.yellow('  ⚠  Config faylı tapılmadı, artıq təmizdir.\n'));
    }
    process.exit(0);
  }

  // ── --reset-key ────────────────────────────────────────────────────────────
  if (args.includes('--reset-key')) {
    saveConfig({ apiKey: '' });
    console.log(
      '\n' + chalk.green('  ✔  API açarı silindi. Növbəti işlətmədə yeni açar soruşulacaq.\n'),
    );
    process.exit(0);
  }

  // Banner
  console.log(
    '\n' + chalk.bgBlue.white.bold(`  ${' '.repeat(6)} @azadev/commit-gen ${' '.repeat(6)}  `),
  );
  console.log(chalk.blue.dim('  AI-powered commit assistant\n'));
  divider();

  // ── 1. Load config ──────────────────────────────────────────────────────────
  const config = readConfig();

  // ── 2. UI Language ──────────────────────────────────────────────────────────
  if (!config.uiLang) {
    uiLang = await selectLang('selectUiLang');
    saveConfig({ uiLang });
    console.log('\n' + chalk.green(`  ${t('langSaved')}`) + '\n');
    divider();
  } else {
    uiLang = config.uiLang;
  }

  // ── 3. Commit language ──────────────────────────────────────────────────────
  let commitLang: Lang = config.commitLang ?? 'en';
  if (!config.commitLang) {
    commitLang = await selectLang('selectCommitLang', 'en');
    saveConfig({ commitLang });
    console.log('\n' + chalk.green(`  ${t('langSaved')}`) + '\n');
    divider();
  }

  // ── 4. API Key ──────────────────────────────────────────────────────────────
  let apiKey = config.apiKey ?? process.env.GROQ_API_KEY ?? '';

  if (!apiKey) {
    console.log('\n' + chalk.yellow.bold(`  ${t('noApiKey')}`));
    console.log(chalk.gray(t('apiKeyLink')) + '\n');

    apiKey = await ask(chalk.cyan(`  ${t('enterApiKey')}`));
    if (!apiKey) {
      console.log('\n' + chalk.red(`  ${t('apiKeyEmpty')}`) + '\n');
      process.exit(1);
    }

    const spinner = ora({ text: chalk.dim('  Validating API key...'), color: 'cyan' }).start();
    const valid = await validateApiKey(apiKey);
    spinner.stop();

    if (!valid) {
      console.log('\n' + chalk.red(`  ${t('apiKeyInvalid')}`) + '\n');
      process.exit(1);
    }

    saveConfig({ apiKey });
    console.log('\n' + chalk.green(`  ${t('apiKeySaved')}`) + '\n');
    divider();
  }

  // ── 5. Git diff ─────────────────────────────────────────────────────────────
  const diff = getDiff();

  if (!diff) {
    console.log('\n' + chalk.yellow.bold(`  ${t('noStaged')}`));
    console.log(chalk.gray(`  ${t('stagedHint')}`) + '\n');
    process.exit(0);
  }

  // ── 6. Generate ─────────────────────────────────────────────────────────────
  console.log();
  const spinner = ora({
    text: chalk.cyan(` ${t('generating')}`),
    color: 'cyan',
    spinner: 'dots',
  }).start();

  let messages: string[] = [];

  try {
    messages = await generateMessages(diff, apiKey, commitLang);
    spinner.succeed(chalk.green(' Done!'));
  } catch (err: any) {
    spinner.fail();

    if (err?.status === 401 || err?.status === 403) {
      console.log('\n' + chalk.red(`  ${t('apiKeyInvalid')}`));
      const ans = await ask(chalk.yellow(`\n  ${t('resetKey')}`));
      if (ans.toLowerCase() === t('resetYes')) {
        saveConfig({ apiKey: '' });
        console.log('\n' + chalk.green(`  ${t('resetDone')}`) + '\n');
      } else {
        console.log(chalk.gray(`\n  ${t('resetNo')}\n`));
      }
      process.exit(1);
    }

    console.log('\n' + chalk.red(`  ${t('error')}`) + chalk.white(err?.message ?? err) + '\n');
    process.exit(1);
  }

  if (!messages.length) {
    console.log('\n' + chalk.red(`  ${t('noMessages')}`) + '\n');
    process.exit(1);
  }

  // ── 7. Display options ──────────────────────────────────────────────────────
  console.log('\n');
  divider();
  console.log(chalk.bold.cyan(`  ${t('selectCommit')}\n`));

  messages.forEach((msg, i) => {
    const [type, ...rest] = msg.split(':');
    const typeColor = type?.includes('feat')
      ? chalk.green
      : type?.includes('fix')
        ? chalk.red
        : type?.includes('refactor')
          ? chalk.magenta
          : type?.includes('chore')
            ? chalk.gray
            : type?.includes('docs')
              ? chalk.blue
              : type?.includes('style')
                ? chalk.yellow
                : type?.includes('perf')
                  ? chalk.cyan
                  : chalk.white;

    console.log(
      chalk.bgCyan.black.bold(` ${i + 1} `) +
        '  ' +
        typeColor.bold(type + ':') +
        chalk.white(rest.join(':')),
    );
    console.log();
  });

  console.log(chalk.gray('  0)  ' + t('cancel')));
  divider();
  console.log();

  const answer = await ask(chalk.cyan(`  ${t('selectPrompt')}`));
  const choice = parseInt(answer);

  if (!choice || choice < 1 || choice > messages.length) {
    console.log('\n' + chalk.gray(`  ${t('cancel')}`) + '\n');
    process.exit(0);
  }

  const selected = messages[choice - 1]!;

  // ── 8. Commit ───────────────────────────────────────────────────────────────
  console.log();
  try {
    execSync(`git commit -m "${selected.replace(/"/g, '\\"')}"`, {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
    console.log('\n' + chalk.bgGreen.black.bold(` ${t('committed')} `) + '\n');
  } catch {
    console.log('\n' + chalk.red(`  ${t('commitFailed')}`) + '\n');
  }
}

main();
