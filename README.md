# 🤖 commit-gen

> AI-powered git commit message generator — powered by **Groq + LLaMA 3.3 70B**

```
             commit-gen
  AI-powered commit assistant
  ──────────────────────────────────────────────────────
  💡  Select a commit message:

 1   feat(auth): add JWT refresh token rotation logic
 2   fix(session): resolve token expiry edge case on logout
 3   refactor(middleware): simplify auth guard with token util
  0)  ✖  Cancel
  ──────────────────────────────────────────────────────
  Your choice (0-3): _
```

---

## ✨ Features

- 🧠 **AI-generated** conventional commit messages from your staged diff
- 🌐 **3 UI languages** — Azerbaijani, English, Turkish
- 📝 **3 commit message languages** — Azerbaijani, English, Turkish
- 🔑 **One-time API key setup** — saved locally, never asked again
- ⚡ **Lightning fast** — Groq inference is among the fastest available
- 🎨 **Beautiful CLI** — color-coded commit types, spinners, clean layout
- 🔒 **Your key, your data** — nothing is sent to any server except Groq

---

## 📦 Installation

```bash
npm install -g commit-gen
```

Or use without installing:

```bash
npx commit-gen
```

---

## 🚀 Quick Start

### Step 1 — Get a free Groq API key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (Google login supported — takes 30 seconds)
3. Navigate to **API Keys** → click **Create API Key**
4. Copy the key starting with `gsk_...`

> Groq is **completely free** for personal use. No credit card required.

### Step 2 — Stage your changes

```bash
git add .
# or stage specific files
git add src/auth.ts
```

### Step 3 — Run commit-gen

```bash
commit-gen
```

**First run only:** you'll be asked to:

1. Select your **UI language** (Azerbaijani / English / Turkish)
2. Select your **commit message language**
3. Enter your **Groq API key**

Everything is saved — subsequent runs go straight to generating.

---

## 🔄 Workflow

```
git add .  →  commit-gen  →  pick a message  →  committed ✔
```

That's it. No flags, no config files to edit manually, no friction.

---

## 🌐 Changing Language

### Option 1 — Delete config and re-run (easiest)

**Windows:**

```powershell
del %USERPROFILE%\.commit-gen\config.json
```

**macOS / Linux:**

```bash
rm ~/.commit-gen/config.json
```

Then run `commit-gen` — the setup wizard will appear again.

---

### Option 2 — Edit config directly

Open `~/.commit-gen/config.json`:

```json
{
  "apiKey": "gsk_...",
  "uiLang": "en",
  "commitLang": "en"
}
```

Change the values:

| Field        | Options            | Description                   |
| ------------ | ------------------ | ----------------------------- |
| `uiLang`     | `az` / `en` / `tr` | CLI interface language        |
| `commitLang` | `az` / `en` / `tr` | Generated commit msg language |

Save the file — takes effect immediately on next run.

---

## 📁 Config File Location

| OS      | Path                                     |
| ------- | ---------------------------------------- |
| Windows | `C:\Users\<you>\.commit-gen\config.json` |
| macOS   | `/Users/<you>/.commit-gen/config.json`   |
| Linux   | `/home/<you>/.commit-gen/config.json`    |

---

## 🔑 Changing or Resetting API Key

If your API key becomes invalid or you want to use a new one:

**Option 1 — Let commit-gen handle it**

If the key is invalid, commit-gen will detect it and ask:

```
🔑  Do you want to reset your API key? (y/n):
```

Press `y` → key is cleared → re-run to enter a new one.

**Option 2 — Manual reset**

Edit `~/.commit-gen/config.json` and replace the `apiKey` value:

```json
{
  "apiKey": "gsk_your_new_key_here",
  "uiLang": "en",
  "commitLang": "en"
}
```

---

## 🎨 Commit Types — Color Guide

| Color      | Types                          |
| ---------- | ------------------------------ |
| 🟢 Green   | `feat` — new features          |
| 🔴 Red     | `fix` — bug fixes              |
| 🟣 Magenta | `refactor` — code cleanup      |
| 🔵 Blue    | `docs` — documentation         |
| 🟡 Yellow  | `style` — formatting           |
| 🩵 Cyan    | `perf` — performance           |
| ⚪ Gray    | `chore`, `test`, `ci`, `build` |

---

## ❓ FAQ

**Q: Do I need a paid Groq account?**
A: No. Groq's free tier is more than enough for daily commit generation.

**Q: Is my code sent anywhere?**
A: Only to Groq's API for inference. Your API key stays in your local config file. Nothing goes to any other server.

**Q: It says "no staged changes"?**
A: Run `git add .` first. commit-gen reads `git diff --cached` — only staged files are analyzed.

**Q: The API key is invalid but I just created it?**
A: Wait 10–15 seconds after creating a new key on Groq's console — it takes a moment to activate. Then try again.

**Q: Can I use it with monorepos?**
A: Yes. Run `commit-gen` from any subdirectory — it uses the current working directory's git context.

**Q: How do I uninstall?**

```bash
npm uninstall -g commit-gen
rm -rf ~/.commit-gen   # removes saved config & API key
```

---

## 🛠 Requirements

- Node.js **18+**
- Git installed and in PATH
- A free [Groq API key](https://console.groq.com)

---

## 📄 License

MIT © commit-gen
