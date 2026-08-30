import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '@/lib/auth';
import { getBookingById, updateBookingStatus, createBill, getBillByBookingId, markBillEmailSent } from '@/lib/db';
import { sendBookingConfirmationEmail, sendBookingRejectionEmail } from '@/lib/email';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action } = await request.json();
  if (action !== 'accept' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be "accept" or "reject"' }, { status: 400 });
  }

  const booking = await getBookingById(params.id);
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  if (booking.status !== 'pending') {
    return NextResponse.json({ error: `Booking is already ${booking.status}` }, { status: 409 });
  }

  if (action === 'reject') {
    const updated = await updateBookingStatus(booking.id, 'rejected');
    let emailError: string | null = null;
    let previewUrl: string | null = null;
    if (booking.email) {
      try {
        const result = await sendBookingRejectionEmail(updated!);
        previewUrl = result.previewUrl;
      } catch (err) {
        emailError = err instanceof Error ? err.message : 'Failed to send email';
      }
    } else {
      emailError = 'No email address on file for this booking';
    }
    return NextResponse.json({ booking: updated, emailError, previewUrl });
  }

  // action === 'accept'
  const updated = (await updateBookingStatus(booking.id, 'confirmed'))!;
  let bill = await getBillByBookingId(updated.id);
  if (!bill) {
    bill = await createBill({ id: uuidv4(), bookingId: updated.id, subtotal: updated.total_price, tax: 0 });
  }

  let emailError: string | null = null;
  let previewUrl: string | null = null;
  if (updated.email) {
    try {
      const result = await sendBookingConfirmationEmail(updated, bill);
      previewUrl = result.previewUrl;
      await markBillEmailSent(bill.id);
      bill = await getBillByBookingId(updated.id);
    } catch (err) {
      emailError = err instanceof Error ? err.message : 'Failed to send email';
    }
  } else {
    emailError = 'No email address on file for this booking';
  }

  return NextResponse.json({ booking: updated, bill, emailError, previewUrl });
}
