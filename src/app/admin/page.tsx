import type { Metadata } from 'next';
import AdminDashboard from '@/components/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard — Gen Z Gaming Cafe',
  description: 'View and manage all bookings at Gen Z Gaming Cafe.',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
