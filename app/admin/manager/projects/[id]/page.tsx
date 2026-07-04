'use client';

import { use } from 'react';
import { ProjectDetailPage } from '@/components/admin/pages/ProjectDetailPage';

export default function ManagerProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProjectDetailPage id={id} backHref="/admin/manager/projects" panelLabel="مدیریت" />;
}
