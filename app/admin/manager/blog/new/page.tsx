'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createCmsArticle } from '@/lib/cmsAdminApi';
import { AdminLoadingState } from '@/hooks/useAdminFetch';

export default function NewBlogArticlePage() {
  const router = useRouter();

  useEffect(() => {
    createCmsArticle({ title: 'پیش‌نویس جدید' }).then((res) => {
      if (res.ok) router.replace(`/admin/manager/blog/${res.data.article.id}`);
      else router.replace('/admin/manager/blog');
    });
  }, [router]);

  return <AdminLoadingState />;
}
