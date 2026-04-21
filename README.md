# 🤖 @azadev/commit-gen

> **Groq + LLaMA 3.3 70B** süni intellekt ilə işləyən git commit mesajı generatoru

```
             commit-gen
  AI dəstəkli commit yaradıcı
  ──────────────────────────────────────────────────────
  💡  Commit mesajını seç:

 1   feat(auth): add JWT refresh token rotation logic
 2   fix(session): resolve token expiry edge case on logout
 3   refactor(middleware): simplify auth guard with token util

  0)  ✖  Ləğv edildi
  ──────────────────────────────────────────────────────
  Seçim et (0-3): _
```

---

## ✨ Xüsusiyyətlər

- 🧠 **AI ilə avtomatik** — stage edilmiş dəyişikliklərdən commit mesajı yaradır
- 🌐 **3 interfeys dili** — Azərbaycanca, İngiliscə, Türkcə
- 📝 **3 commit mesajı dili** — Azərbaycanca, İngiliscə, Türkcə
- 🔑 **Bir dəfəlik quraşdırma** — API açarı lokalda saxlanır, bir daha soruşulmur
- ⚡ **Çox sürətli** — Groq inferansı mövcud olan ən sürətli həllərdən biridir
- 🎨 **Gözəl CLI** — rəngli commit tipləri, spinner animasiyası, təmiz dizayn
- 🔒 **Məlumatların təhlükəsizliyi** — heç bir server istifadə edilmir, yalnız Groq API

---

## 📦 Quraşdırma

### Quraşdırma olmadan istifadə

```bash
npx @azadev/commit-gen
```

### Qlobal quraşdırma — gündəlik istifadə üçün daha qısa komanda

```bash
npm install -g @azadev/commit-gen
# sonra istənilən git layihəsindən:
commit-gen
```

---

## 🚀 Sürətli Başlanğıc

### Addım 1 — Pulsuz Groq API açarı al

1. [console.groq.com](https://console.groq.com) saytına daxil ol
2. Qeydiyyatdan keç — Google hesabı ilə də qeydiyyatdan keçə bilərsiniz
3. **API Keys** bölməsinə keç → **Create API Key** düyməsinə bas
4. `gsk_...` ilə başlayan açarı kopyala

> Groq şəxsi istifadə üçün **tamamilə pulsuzdur**. Ödəniş kartı tələb olunmur.

### Addım 2 — Dəyişiklikləri stage et

```bash
git add .
# və ya konkret fayl yolunu da yaza bilərsən:
git add src/auth.ts
```

### Addım 3 — commit-gen

```bash
npx @azadev/commit-gen
# və ya qlobal quraşdırma ilə:
commit-gen
```

**Yalnız ilk işlətmədə** aşağıdakıları soruşacaq:

1. **İnterfeys dili** seç — Azərbaycanca / İngiliscə / Türkcə
2. **Commit mesajı dili** seç
3. **Groq API açarını** daxil et

Hamısını yadda saxlayır və növbəti işlətmələrində birbaşa tanıyır.

---

## 🔄 İş axını

```
git add .  →  commit-gen  →  mesajı seç  →  commit atıldı ✔
```

Heç bir konfiqurasiya faylına ehtiyyac yoxdur.

---

## ⚙️ Faydalı Komandalar

| Komanda                  | Nə edir                                              |
| ------------------------ | ---------------------------------------------------- |
| `commit-gen`             | Normal işlətmə — commit mesajı yarat                 |
| `commit-gen --config`    | Config faylının yerini və məzmununu göstər           |
| `commit-gen --reset`     | Hər şeyi sıfırla — dil + API açarı yenidən soruşulur |
| `commit-gen --reset-key` | Yalnız API açarını sil                               |

```bash
# Config faylın harada olduğunu görmək istəyirsənsə:
commit-gen --config

# Çıxış nümunəsi:
#  📁  commit-gen config
#
#  Mövcud konfiqurasiya:
#  ──────────────────────────────────
#  uiLang     : az
#  commitLang : en
#  apiKey     : gsk_••••••••••••••••
#  ──────────────────────────────────
```

---

## 🌐 Dili Dəyişmək

### Variant 1 — Konfiqurasiyanı sil və yenidən başlat

**Windows:**

```powershell
del %USERPROFILE%\.commit-gen\config.json
```

**macOS / Linux:**

```bash
rm ~/.commit-gen/config.json
```

Sonra `commit-gen` işlət — quraşdırma sehirbazı yenidən çıxacaq.

---

### Variant 2 — Config faylını birbaşa düzəlt

`~/.commit-gen/config.json` faylını aç:

```json
{
  "apiKey": "gsk_...",
  "uiLang": "az",
  "commitLang": "en"
}
```

Dəyərləri dəyiş:

| Sahə         | Seçimlər           | Açıqlama                     |
| ------------ | ------------------ | ---------------------------- |
| `uiLang`     | `az` / `en` / `tr` | CLI interfeys dili           |
| `commitLang` | `az` / `en` / `tr` | Yaradılan commit mesajı dili |

Faylı saxla — növbəti işlətmədən etibarən qüvvəyə minir.

---

## 📁 Config Faylının Yeri

| Əməliyyat sistemi | Yer                                     |
| ----------------- | --------------------------------------- |
| Windows           | `C:\Users\<ad>\.commit-gen\config.json` |
| macOS             | `/Users/<ad>/.commit-gen/config.json`   |
| Linux             | `/home/<ad>/.commit-gen/config.json`    |

---

## 🔑 API Açarını Sıfırlamaq

Açarın etibarsız olduğu halda və ya yenisini istifadə etmək istədikdə:

**Variant 1 — commit-gen özü idarə etsin**

Açar etibarsız olduqda commit-gen aşkar edib soruşacaq:

```
🔑  API açarını sıfırlamaq istəyirsiniz? (b/x):
```

`b` bas → açar silinir → yenisini daxil etmək üçün yenidən işlət.

**Variant 2 — Əl ilə sıfırla**

`~/.commit-gen/config.json` faylında `apiKey` dəyərini dəyiş:

```json
{
  "apiKey": "gsk_yeni_acarını_bura_daxil_et",
  "uiLang": "az",
  "commitLang": "en"
}
```

---

## 🎨 Commit Tipləri — Rəng Bələdçisi

| Rəng         | Tiplər                         |
| ------------ | ------------------------------ |
| 🟢 Yaşıl     | `feat` — yeni funksionallıq    |
| 🔴 Qırmızı   | `fix` — xəta düzəltmə          |
| 🟣 Bənövşəyi | `refactor` — kod təmizliyi     |
| 🔵 Mavi      | `docs` — sənədləşmə            |
| 🟡 Sarı      | `style` — formatlama           |
| 🩵 Cyan      | `perf` — performans            |
| ⚪ Boz       | `chore`, `test`, `ci`, `build` |

---

## ❓ Tez-tez Verilən Suallar

**S: Ödənişli Groq hesabı lazımdırmı?**
C: Xeyr. Groq-un pulsuz planı gündəlik commit generasiyası üçün kifayətdir.

**S: Kodum hara göndərilir?**
C: Yalnız Groq API-a — inferans üçün. API açarın lokal config faylında saxlanır. Başqa heç bir serverə heç nə göndərilmir.

**S: "Stage edilmiş dəyişiklik yoxdur" deyir?**
C: Əvvəl `git add .` işlət. commit-gen yalnız `git diff --cached` — yəni stage edilmiş faylları oxuyur.

**S: API açarını yenicə yaratdım amma etibarsız deyir?**
C: Groq konsolunda yeni açar yaratdıqdan sonra 10–15 saniyə gözlə — aktivləşməsi vaxt aparır. Sonra yenidən cəhd et.

**S: Monorepo ilə işləyirmi?**
C: Bəli. İstənilən alt qovluqdan `commit-gen` işlət — cari işçi qovluğun git kontekstini istifadə edir.

**S: Necə silinir?**

```bash
npm uninstall -g @azadev/commit-gen
rm -rf ~/.commit-gen   # saxlanmış config və API açarını silir
```

---

## 🛠 Tələblər

- Node.js **18+**
- Git quraşdırılmış və PATH-də olmalıdır
- Pulsuz [Groq API açarı](https://console.groq.com)

---

## 📦 @azadev Paketləri

Bu paket **Azad Mirheydərzadə (azadev)** tərəfindən yazılmışdır. Digər npm paketlərim:

| [`@azadev/react-toastdev`](https://www.npmjs.com/package/@azadev/react-toastdev) | React üçün səsli toast bildiriş kitabxanası |

---

## 📄 Lisenziya

MIT © [Azad Mirheydərzadə](https://github.com/azadev3)
