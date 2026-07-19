# دسترسی‌های CMS

## نقش admin

همه capabilityها از جمله:
- `cms.ai_use` — استفاده از دستیار AI
- `cms.ai_settings` — تغییر تنظیمات AI/بودجه

## نقش sales

فقط `cms.read` — مشاهده فهرست، بدون ویرایش یا AI

## اجرای سمت سرور

همه APIهای `/api/admin/blog/*` با `requireCmsCap` یا `requireCmsSession` محافظت می‌شوند.

UI مخفی کردن دکمه کافی نیست — سرور همیشه چک می‌کند.

## AI

- AI endpointها `cms.ai_use` می‌خواهند
- AI نمی‌تواند publish/archive/approve کند
- تنظیمات فقط با `cms.ai_settings`
