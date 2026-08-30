import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getBookingById, getBillByBookingId, markBillEmailSent } from '@/lib/db';
import { sendBookingConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const booking = await getBookingById(params.id);
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  if (booking.status !== 'confirmed') {
    return NextResponse.json({ error: 'Booking must be confirmed before resending the invoice email' }, { status: 409 });
  }
  const bill = await getBillByBookingId(booking.id);
  if (!bill) {
    return NextResponse.json({ error: 'No bill found for this booking' }, { status: 404 });
  }
  if (!booking.email) {
    return NextResponse.json({ error: 'No email address on file for this booking' }, { status: 400 });
  }

  try {
    const result = await sendBookingConfirmationEmail(booking, bill);
    await markBillEmailSent(bill.id);
    return NextResponse.json({ ok: true, previewUrl: result.previewUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to send email' },
      { status: 502 }
    );
  }
}
