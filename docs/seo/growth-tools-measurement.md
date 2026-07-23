# رشد ابزارهای رایگان — معیارهای ۶ تا ۸ هفته

پس از انتشار موج ۱ (`/review-link`, `/local-seo-check`, `/seo-roi-calculator`) این معیارها را هفتگی در GTM / Search Console / ادمین لیدها چک کنید.

## رویدادها

| Event | معنی |
|-------|------|
| `growth_tool_view` | مشاهده ابزار |
| `growth_tool_start` | شروع تعامل |
| `growth_tool_complete` | دریافت خروجی |
| `growth_tool_lead_submit` | ثبت شماره برای گزارش کامل |

ابعاد مهم: `tool`, `industry`, `page`.

## آستانه‌های تصمیم

- **ادامه صنف فعلی:** completion rate > 25٪ و حداقل ۱۰ لید واجدشرایط در ۸ هفته
- **افزودن صنف جدید:** همان صنف در Search Console impression پایدار + CTR قابل قبول
- **افزودن شهر × صنف:** فقط بعد از اثبات تقاضا روی صفحات صنفی؛ از روز اول نسازید
- **کاهش اولویت ابزار:** اگر ترافیک بالا ولی qualified-lead نزدیک صفر بود، CTA و پیام را اصلاح کنید نه اینکه فوراً صفحات شهر بسازید

## مسیر فروش

1. ابزار رایگان → نتیجه فوری
2. گزارش کامل / مشاوره (اختیاری با شماره)
3. `/free-seo-audit` یا `/googlesabt` یا `/seo/[industry]`

منبع لید در API: `free-tool-review_link` | `free-tool-local_seo_check` | `free-tool-seo_roi`

- `channel`: `free_tool`
- `goal`: `free_tool_report`
- `plan`: نام ابزار (`review_link` / `local_seo_check` / `seo_roi`)
- `intent`: صنف صفحه
- conversion event: `generate_lead` + `growth_tool_lead_submit`
- page attribution: `pageFromPath` مسیرهایی مثل `review-link/doctor` را نگه می‌دارد
- امتیاز: منابع `free-tool-*` مثل audit رایگان +۳۵ می‌گیرند
