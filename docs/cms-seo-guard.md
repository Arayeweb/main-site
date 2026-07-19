# SEO Guard — CMS بلاگ

## سطوح

| سطح | رفتار |
|------|--------|
| **بحرانی** | مسدودکننده انتشار |
| **هشدار** | توصیه — انتشار مجاز |
| **فرصت** | پیشنهاد بهبود |

## بررسی‌ها

### بحرانی
- عنوان، slug، نویسنده، بدنه کوتاه
- canonical نامعتبر
- تاریخ انتشار برای published

### هشدار
- متا/خلاصه خالی
- H1 در بدنه
- پرش سطح heading
- بدون لینک داخلی
- noindex روی published

## Cannibalization

`lib/cms/seo/cannibalization.ts` — مقایسه با مقالات CMS و لندینگ‌های `/doctors`, `/ai`, `/seo`, `/prompts`

## لینک داخلی

`lib/cms/seo/internalLinks.ts` — پیشنهاد بر اساس کلمات کلیدی در متن

## API

`GET /api/admin/blog/seo/analyze?article_id=`

پاسخ: `issues`, `readiness`, `cannibalization`, `internal_links`

## پیش‌نمایش

- نتیجه گوگل (دسکتاپ)
- کارت شبکه اجتماعی
- وضعیت publish readiness
