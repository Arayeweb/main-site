'use client';

import { ProjectsListPage } from '@/components/admin/pages/ProjectsListPage';

export default function ManagerProjectsPage() {
  return <ProjectsListPage panelLabel="مدیریت" detailBasePath="/admin/manager/projects" />;
}
