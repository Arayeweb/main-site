# CMS بلاگ آرایه — راهنمای ادمین

## مسیرها

| مسیر | توضیح |
|------|--------|
| `/admin/manager/blog` | فهرست مقالات |
| `/admin/manager/blog/new` | ایجاد مقاله |
| `/admin/manager/blog/[id]` | ویرایشگر |
| `/admin/manager/blog/media` | کتابخانه رسانه |

## پیش‌نیاز

1. اجرای migration: `supabase/migrations/20260719_cms_blog_core.sql`
2. ایجاد bucket `blog-uploads` در Supabase Storage (public read)
3. تنظیم `CMS_PREVIEW_SECRET` و `CMS_CRON_SECRET` در env

## Workflow

`DRAFT` → `IN_REVIEW` → `APPROVED` → `PUBLISHED` یا `SCHEDULED`

## Cron انتشار

```
GET /api/cron/blog-publish?secret=$CMS_CRON_SECRET
```

## Migration محتوای قدیمی

```bash
npx tsx scripts/migrate-blog-to-cms.ts --dry-run
npx tsx scripts/migrate-blog-to-cms.ts
```

## API

همه endpointها زیر `/api/admin/blog/*` با کوکی ادمین `ary_admin`.
