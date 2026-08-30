import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';
import { isAdminAuthenticated } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Admin Dashboard — Gen Z Gaming Cafe',
  description: 'View and manage all bookings at Gen Z Gaming Cafe.',
};

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }
  return <AdminDashboard />;
}
