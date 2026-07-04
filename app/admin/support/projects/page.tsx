'use client';

import { ProjectsListPage } from '@/components/admin/pages/ProjectsListPage';

export default function SupportProjectsPage() {
  return <ProjectsListPage panelLabel="پشتیبانی" detailBasePath="/admin/manager/projects" showCreate={false} />;
}
