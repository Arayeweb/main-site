import { redirect } from 'next/navigation';

// TODO: Check real session here — if authenticated, go to select-panel; else go to login
export default function AdminRootPage() {
  redirect('/admin/gate');
}
