import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createBooking } from '@/lib/db';
import { assignUnit } from '@/lib/availability';
import { minutesToTime } from '@/lib/availability';
import { calculatePrice, STATION_CONFIG, StationType, OPENING_HOUR, CLOSING_HOUR } from '@/lib/pricing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, station_type, date, start_time, duration, num_persons: rawPersons } = body;

    // Validate required fields
    if (!name || !phone || !station_type || !date || !start_time || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields: name, phone, station_type, date, start_time, duration' },
        { status: 400 }
      );
    }

    const stationType = station_type as StationType;
    if (!STATION_CONFIG[stationType]) {
      return NextResponse.json(
        { error: 'Invalid station type' },
        { status: 400 }
      );
    }

    const numPersons = parseInt(rawPersons) || 1;
    const maxPlayers = STATION_CONFIG[stationType].maxPlayers;
    if (numPersons < 1 || numPersons > maxPlayers) {
      return NextResponse.json(
        { error: `Number of persons must be between 1 and ${maxPlayers} for ${STATION_CONFIG[stationType].label}` },
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

    // Validate time boundaries
    const [startH, startM] = start_time.split(':').map(Number);
    const startTotalMins = startH * 60 + startM;
    const endTotalMins = startTotalMins + durationMinutes;

    if (startTotalMins < OPENING_HOUR * 60 || endTotalMins > CLOSING_HOUR * 60) {
      return NextResponse.json(
        { error: 'Booking must be within operating hours (10:00 AM - 11:00 PM)' },
        { status: 400 }
      );
    }

    // Validate :00 or :30 boundary
    if (startM !== 0 && startM !== 30) {
      return NextResponse.json(
        { error: 'Start time must be on :00 or :30 boundary' },
        { status: 400 }
      );
    }

    // Calculate end time
    const endTime = minutesToTime(endTotalMins);

    // Assign unit
    const unitNumber = assignUnit(date, stationType, start_time, endTime);
    if (unitNumber === -1) {
      return NextResponse.json(
        { error: 'No available units for the selected time slot' },
        { status: 409 }
      );
    }

    // Calculate price (per person for PS5/PS4)
    const totalPrice = calculatePrice(stationType, durationMinutes, numPersons);

    // Create booking
    const booking = createBooking({
      id: uuidv4(),
      name,
      phone,
      station_type: stationType,
      unit_number: unitNumber,
      date,
      start_time,
      end_time: endTime,
      duration: durationMinutes / 60,
      num_persons: numPersons,
      total_price: totalPrice,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
