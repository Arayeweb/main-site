# AI Visibility Checklist — کلاستر طراحی سایت

قالب مانیتورینگ ماهانه برای citation در پاسخ‌های AI.

## منابع کد

- کوئری‌ها و helperها: [`lib/seo/websiteDesignAiVisibility.ts`](../lib/seo/websiteDesignAiVisibility.ts)
- فایل‌های ماشین‌خوان: `/llms.txt` و `/pricing.md`
- هاب: `/website-design` · قیمت: `/website-design/cost` · سایت فوری: `/fastweb`

## نحوه اجرا (ماهانه)

1. تابع `buildAiVisibilityChecklistMarkdown("YYYY-MM")` را اجرا کنید یا جدول زیر را کپی کنید.
2. هر ۲۰ کوئری را در **Google (AI Overview)**، **ChatGPT (با search)** و **Perplexity** تست کنید.
3. برای هر پلتفرم ثبت کنید: Overview/Answer؟ · Cited؟ · Recommended؟ · رقبا؟
4. ماه‌به‌ماه Share of AI voice و نرخ citation را مقایسه کنید.

## ۲۰ کوئری کلیدی

| # | Query | Intent | Priority page |
|---|-------|--------|---------------|
| 1 | طراحی سایت چیست | definition | /website-design |
| 2 | قیمت طراحی سایت | pricing | /website-design/cost |
| 3 | هزینه طراحی سایت در ایران | pricing | /website-design/cost |
| 4 | طراحی سایت ارزان و فوری | pricing | /fastweb |
| 5 | تفاوت سایت فوری و طراحی اختصاصی | comparison | /website-design/cost |
| 6 | طراحی سایت یا وردپرس | comparison | /website-design |
| 7 | بهترین شرکت طراحی سایت | comparison | /website-design |
| 8 | طراحی سایت کلینیک | industry | /website/clinic |
| 9 | طراحی سایت دندانپزشکی | industry | /website/dentist |
| 10 | طراحی سایت پزشکی | industry | /doctors |
| 11 | طراحی سایت رستوران | industry | /website-design/restaurant |
| 12 | طراحی سایت وکیل | industry | /website/lawyer |
| 13 | طراحی سایت کافه | industry | /website/cafe |
| 14 | طراحی سایت فروشگاه اینترنتی | industry | /website/online-shop |
| 15 | طراحی سایت مشاور املاک | industry | /fastweb/real-estate |
| 16 | سایت فوری آرایه | definition | /fastweb |
| 17 | چطور سایت کسب و کار بسازم | howto | /blog/website-design-order-checklist |
| 18 | تبدیل پیج اینستاگرام به سایت | howto | /blog/instagram-page-to-website |
| 19 | طراحی سایت برای کلینیک زیبایی | industry | /website/beauty-clinic |
| 20 | آرایه طراحی سایت | definition | /website-design |

## جدول ثبت ماهانه

| # | Query | G-Overview | ChatGPT | Perplexity | Araaye cited? | Competitors | Notes |
|---|-------|------------|---------|------------|---------------|-------------|-------|
| 1 | طراحی سایت چیست |  |  |  |  |  |  |
| 2 | قیمت طراحی سایت |  |  |  |  |  |  |
| 3 | هزینه طراحی سایت در ایران |  |  |  |  |  |  |
| 4 | طراحی سایت ارزان و فوری |  |  |  |  |  |  |
| 5 | تفاوت سایت فوری و طراحی اختصاصی |  |  |  |  |  |  |
| 6 | طراحی سایت یا وردپرس |  |  |  |  |  |  |
| 7 | بهترین شرکت طراحی سایت |  |  |  |  |  |  |
| 8 | طراحی سایت کلینیک |  |  |  |  |  |  |
| 9 | طراحی سایت دندانپزشکی |  |  |  |  |  |  |
| 10 | طراحی سایت پزشکی |  |  |  |  |  |  |
| 11 | طراحی سایت رستوران |  |  |  |  |  |  |
| 12 | طراحی سایت وکیل |  |  |  |  |  |  |
| 13 | طراحی سایت کافه |  |  |  |  |  |  |
| 14 | طراحی سایت فروشگاه اینترنتی |  |  |  |  |  |  |
| 15 | طراحی سایت مشاور املاک |  |  |  |  |  |  |
| 16 | سایت فوری آرایه |  |  |  |  |  |  |
| 17 | چطور سایت کسب و کار بسازم |  |  |  |  |  |  |
| 18 | تبدیل پیج اینستاگرام به سایت |  |  |  |  |  |  |
| 19 | طراحی سایت برای کلینیک زیبایی |  |  |  |  |  |  |
| 20 | آرایه طراحی سایت |  |  |  |  |  |  |

## یادداشت

- Citation ≠ recommendation: لینک‌دادن به صفحه کافی نیست؛ shortlist خرید جداگانه است.
- اگر رقیب cited شد و شما نه، ساختار extractable و freshness صفحه priority را بررسی کنید.
