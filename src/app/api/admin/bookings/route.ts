import { NextRequest, NextResponse } from 'next/server';
import { getAllBookings, getBookingsByDate, getBookingStats } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');
  const statsOnly = searchParams.get('stats');

  if (statsOnly === 'true') {
    const stats = getBookingStats();
    return NextResponse.json(stats);
  }

  const bookings = date ? getBookingsByDate(date) : getAllBookings();
  const stats = getBookingStats();

  return NextResponse.json({ bookings, stats });
}
