import { NextRequest, NextResponse } from 'next/server';
import { getBookingById } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const booking = getBookingById(params.id);

  if (!booking) {
    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(booking);
}
