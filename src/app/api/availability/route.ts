import { NextRequest, NextResponse } from 'next/server';
import { getAvailableUnits } from '@/lib/availability';
import { STATION_CONFIG, StationType } from '@/lib/pricing';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');
  const station = searchParams.get('station') as StationType | null;
  const start = searchParams.get('start');
  const duration = searchParams.get('duration');

  if (!date || !station || !start || !duration) {
    return NextResponse.json(
      { error: 'Missing required parameters: date, station, start, duration' },
      { status: 400 }
    );
  }

  if (!STATION_CONFIG[station]) {
    return NextResponse.json(
      { error: 'Invalid station type' },
      { status: 400 }
    );
  }

  const durationMinutes = parseInt(duration);
  if (isNaN(durationMinutes) || durationMinutes <= 0) {
    return NextResponse.json(
      { error: 'Invalid duration' },
      { status: 400 }
    );
  }

  const available = await getAvailableUnits(date, station, start, durationMinutes);
  const total = STATION_CONFIG[station].units;

  return NextResponse.json({ available, total });
}
