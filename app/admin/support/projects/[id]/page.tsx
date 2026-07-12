'use client';

import { use } from 'react';
import { ProjectDetailPage } from '@/components/admin/pages/ProjectDetailPage';

export default function SupportProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProjectDetailPage id={id} backHref="/admin/support/projects" panelLabel="پشتیبانی" />;
}
