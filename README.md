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
   - از روی [`.env.local.example`](.env.local.example) یک فایل `.env.local` بسازید و مقادیر را از
     داشبورد Supabase (**Settings → API**) پر کنید: `SUPABASE_URL` و `SUPABASE_SERVICE_ROLE_KEY`.

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
| `POST /api/leads` | دریافت و ذخیرهٔ لید |

## پنل مدیریت

فاز اول: داشبورد Supabase → **Table Editor** روی جدول `leads` (مرتب بر اساس `created_at`، فیلتر بر اساس `source`/`page`).

## نکتهٔ دسترسی (ایران)

سرور Next.js باید به `*.supabase.co` دسترسی داشته باشد. روی میزبانی داخل ایران ممکن است نیاز به خروجی باز/پراکسی باشد؛ داشبورد Supabase هم ممکن است از داخل ایران VPN بخواهد.

## معماری

- اعتبارسنجی تماس سمت سرور در [`lib/validateContact.ts`](lib/validateContact.ts) (پورت از `public/assets/js/chatbot.js`).
- درج با کلید `service_role` در [`lib/supabase.ts`](lib/supabase.ts) — جدول `leads` با RLS فعال و بدون policy عمومی، پس فقط سرور می‌نویسد.
- ضد اسپم: فیلد honeypot به‌نام `company` + rate-limit ساده per-IP در [`app/api/leads/route.ts`](app/api/leads/route.ts).
- اتصال فرانت: `submitLead()` در `form.js` و هندلر ثبت تماس در `chatbot.js` به `POST /api/leads`.
# main-site
