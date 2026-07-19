# گردش کار انتشار بلاگ

## نقش‌ها

فقط `admin` می‌تواند ایجاد، ویرایش، تأیید و انتشار کند. `sales` فقط خواندن دارد.

## مراحل

1. **پیش‌نویس** — autosave هر ۲.۵ ثانیه
2. **ارسال بررسی** — `IN_REVIEW`
3. **تأیید** — `APPROVED` (نیاز به `cms.approve`)
4. **انتشار** — validation SEO بحرانی + revision snapshot
5. **زمان‌بندی** — `SCHEDULED` + cron

## Preview

توکن HMAC ۱۵ دقیقه‌ای → `/blog/preview/[token]` با `noindex`.

## Revalidation

پس از انتشار: `/blog/[slug]`, `/blog`, sitemap.

## Audit

همه عملیات publish/archive/approve در `cms_audit_logs`.
