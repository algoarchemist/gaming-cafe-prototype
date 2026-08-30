import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { isAdminAuthenticated } from '@/lib/auth';
import { getBookingById, getBillByBookingId } from '@/lib/db';
import PrintButton from '@/components/PrintButton';

const stationLabels: Record<string, string> = {
  ps5: 'PlayStation 5',
  ps4: 'PlayStation 4',
  pc: 'Gaming PC',
  sim: 'Sim Wheel Setup',
};

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function BillPage({ params }: { params: { id: string } }) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const booking = await getBookingById(params.id);
  if (!booking) notFound();
  const bill = await getBillByBookingId(booking.id);
  if (!bill) notFound();

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-lg mx-auto glass-card p-8">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-neon-blue transition-colors">
            ← Back to Dashboard
          </Link>
          <PrintButton />
        </div>

        <div className="text-center mb-6">
          <h1 className="font-heading text-xl font-bold neon-text-blue">Gen Z Gaming Cafe</h1>
          <p className="text-gray-500 text-xs">Ramapuram, Chennai</p>
          <p className="text-gray-400 text-sm mt-3 font-heading tracking-wider">{bill.invoice_number}</p>
        </div>

        <div className="space-y-2 border-t border-b border-card-border py-4 mb-4 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Customer</span><span className="text-white">{booking.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="text-white">{booking.phone}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-white">{booking.email || '—'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Station</span><span className="text-white">{stationLabels[booking.station_type] || booking.station_type} #{booking.unit_number}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="text-white">{formatDate(booking.date)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="text-white">{formatTime12h(booking.start_time)} – {formatTime12h(booking.end_time)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Players</span><span className="text-white">{booking.num_persons}</span></div>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="text-white">₹{bill.subtotal}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Tax</span><span className="text-white">₹{bill.tax}</span></div>
          <div className="flex justify-between pt-2 border-t border-card-border font-heading font-bold text-lg">
            <span>Total</span><span className="neon-text-green">₹{bill.total}</span>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          {bill.email_sent_at ? `Emailed to customer on ${new Date(bill.email_sent_at).toLocaleString('en-IN')}` : 'Not yet emailed to customer'}
        </p>
      </div>
    </div>
  );
}
