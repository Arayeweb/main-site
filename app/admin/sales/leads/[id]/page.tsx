import { LeadDetailPage } from '@/components/admin/pages/LeadDetailPage';

export default async function SalesLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LeadDetailPage id={id} />;
}
