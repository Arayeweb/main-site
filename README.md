# سایت آرایه — بک‌اند لیدها (Next.js + Supabase)

سایت استاتیک (`public/`) بدون تغییر سرو می‌شود؛ یک بک‌اند نازک Next.js لیدهای فرم و چت‌بات را می‌گیرد و در Supabase ذخیره می‌کند.

## راه‌اندازی

1. **نصب وابستگی‌ها**
   ```bash
   npm install
   ```

2. **ساخت پروژهٔ Supabase** و اجرای اسکیما
   - یک پروژه در [supabase.com](https://supabase.com) بسازید.
   - محتوای [`supabase/schema.sql`](supabase/schema.sql) را در **SQL Editor** اجرا کنید.

3. **متغیرهای محیطی**
   - از روی [`.env.example`](.env.example) یک فایل `.env.local` بسازید و این مقادیر را پر کنید:
     - `SUPABASE_URL` و `SUPABASE_SERVICE_ROLE_KEY` از داشبورد Supabase (**Settings → API**).
     - `ADMIN_PASSWORD` — رمز ورود به پنل مدیریت `/admin`.
     - `ADMIN_SESSION_SECRET` — کلید امضای نشست ادمین؛ یک رشتهٔ تصادفی ≥۳۲ کاراکتری (`openssl rand -hex 32`).
     - `NEXT_PUBLIC_SITE_URL` — آدرس سایت (مثلاً `http://localhost:3000`).
     - (اختیاری) `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET` — برای ربات تلگرام.
     - (اختیاری) `OPENROUTER_API_KEY` و `OPENROUTER_MODEL` — برای هوش مصنوعی مکالمه‌ای ربات تلگرام.

4. **اجرا**
   ```bash
   npm run dev      # توسعه روی http://localhost:3000
   npm run build && npm start   # production
   ```

## مسیرها

| مسیر | محتوا |
|------|-------|
| `/` | `public/index.html` |
| `/clinic` `/doctors` `/restaurant` | صفحات مربوطه |
| `/support` | `public/support.html` — پنل پشتیبانی مشتری |
| `/admin` | `public/admin.html` — پنل مدیریت (نیازمند رمز) |
| `POST /api/leads` | دریافت و ذخیرهٔ لید |
| `POST /api/support/project-status` | پیگیری وضعیت پروژه با `projectCode` + `password` |
| `POST /api/support/tickets` | ثبت تیکت پشتیبانی |
| `POST/GET/DELETE /api/admin/login` | ورود/بررسی نشست/خروج ادمین |
| `GET/POST/PATCH /api/admin/projects` | لیست/ساخت/ویرایش پروژه‌ها (محافظت‌شده) |
| `POST /api/telegram/webhook` | webhook ربات تلگرام AI (چت با مدل‌ها) |
| `POST /api/telegram` | webhook قدیمی مشاور فروش (`lib/telegramBot.ts`) |
| `GET/PATCH /api/admin/tickets` | لیست/تغییر وضعیت تیکت‌ها (محافظت‌شده) |

## ربات تلگرام

دو ربات جدا با یک `TELEGRAM_BOT_TOKEN` (فقط یکی را فعال کنید):

| ربات | webhook | کد |
|------|---------|-----|
| **AI چت** (مدل‌ها، سهمیه رایگان) | `https://araaye.com/api/telegram/webhook` | `lib/telegram/handler.ts` |
| مشاور فروش (لید) | `https://araaye.com/api/telegram` | `lib/telegramBot.ts` |

**مهم:** `NEXT_PUBLIC_SITE_URL` و webhook باید بدون `www` باشند (`https://araaye.com`). دامنهٔ `www` به apex ریدایرکت می‌شود و تلگرام redirect را دنبال نمی‌کند.

برای راه‌اندازی webhook ربات AI:

```bash
node scripts/telegram-set-webhook.mjs
# یا دستی:
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://araaye.com/api/telegram/webhook","secret_token":"YOUR_TELEGRAM_WEBHOOK_SECRET","allowed_updates":["message","callback_query"]}'
```

بررسی: `curl https://araaye.com/api/telegram/health` و `getWebhookInfo` در Bot API.

## پنل پشتیبانی

صفحهٔ `/support` دو کار دارد:

- **پیگیری وضعیت پروژه**: مشتری با `project_code` و **رمز پروژه** وضعیت، درصد پیشرفت، تاریخ تخمینی تحویل و آخرین یادداشت تیم را می‌بیند.
- **ثبت تیکت**: مشتری تیکت می‌سازد و یک `ticket_code` یکتا دریافت می‌کند.

جدول‌های مربوطه در [`supabase/schema.sql`](supabase/schema.sql) تعریف شده‌اند:

- `support_projects` — پروژه‌ها با `project_code`، `access_password` (هش scrypt)، `status`، `progress_percent` و `estimated_delivery_at`.
- `support_tickets` — تیکت‌ها با `ticket_code`، `category`، `priority` و `status`.

## پنل مدیریت (`/admin`)

پنل مدیریت برای تیم آرایه؛ ورود با `ADMIN_PASSWORD` و نشست کوکی httpOnly امضاشده با HMAC.

- **پروژه‌ها**: ساخت پروژهٔ جدید (با تعیین رمز ورود مشتری)، ویرایش وضعیت/درصد پیشرفت/تاریخ تحویل/یادداشت و تغییر رمز.
- **تیکت‌ها**: مشاهدهٔ تیکت‌ها با فیلتر وضعیت و تغییر وضعیت/اولویت.

جریان کار: در پنل یک پروژه بسازید، یک **رمز** برایش تعیین کنید و `project_code` + رمز را به مشتری بدهید.
مشتری با همین دو مقدار در `/support` وضعیت را پیگیری می‌کند. رمزها به‌صورت هش (scrypt) ذخیره می‌شوند و
هرگز به کلاینت برنمی‌گردند. تمام روت‌های `/api/admin/*` با کوکی نشست محافظت می‌شوند.

## پنل مدیریت لیدها

فاز اول: داشبورد Supabase → **Table Editor** روی جدول `leads` (مرتب بر اساس `created_at`، فیلتر بر اساس `source`/`page`).

## نکتهٔ دسترسی (ایران)

سرور Next.js باید به `*.supabase.co` دسترسی داشته باشد. روی میزبانی داخل ایران ممکن است نیاز به خروجی باز/پراکسی باشد؛ داشبورد Supabase هم ممکن است از داخل ایران VPN بخواهد.

## معماری

- اعتبارسنجی تماس سمت سرور در [`lib/validateContact.ts`](lib/validateContact.ts) (پورت از `public/assets/js/chatbot.js`).
- درج با کلید `service_role` در [`lib/supabase.ts`](lib/supabase.ts) — جدول `leads` با RLS فعال و بدون policy عمومی، پس فقط سرور می‌نویسد.
- ضد اسپم: فیلد honeypot به‌نام `company` + rate-limit ساده per-IP در [`app/api/leads/route.ts`](app/api/leads/route.ts).
- اتصال فرانت: `submitLead()` در `form.js` و هندلر ثبت تماس در `chatbot.js` به `POST /api/leads`.
# main-site
