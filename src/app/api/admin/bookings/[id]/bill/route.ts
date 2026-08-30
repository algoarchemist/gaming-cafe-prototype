import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getBookingById, getBillByBookingId } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const booking = await getBookingById(params.id);
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  const bill = await getBillByBookingId(booking.id);
  if (!bill) {
    return NextResponse.json({ error: 'No bill generated for this booking yet' }, { status: 404 });
  }

  return NextResponse.json({ booking, bill });
}
