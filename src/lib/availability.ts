import { getBookingsForDateAndStation, Booking } from './db';
import { STATION_CONFIG, StationType } from './pricing';

/**
 * Convert "HH:MM" to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convert minutes since midnight to "HH:MM"
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Check if two time ranges overlap
 */
function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

/**
 * Get the number of available units for a given station + date + time window
 */
export async function getAvailableUnits(
  date: string,
  stationType: StationType,
  startTime: string,
  durationMinutes: number
): Promise<number> {
  const config = STATION_CONFIG[stationType];
  const endTime = minutesToTime(timeToMinutes(startTime) + durationMinutes);
  const bookings = await getBookingsForDateAndStation(date, stationType);

  const occupiedUnits = new Set<number>();

  for (const booking of bookings) {
    if (timesOverlap(startTime, endTime, booking.start_time, booking.end_time)) {
      occupiedUnits.add(booking.unit_number);
    }
  }

  return config.units - occupiedUnits.size;
}

/**
 * Assign the lowest available unit number for a booking
 * Returns -1 if no units are available
 */
export async function assignUnit(
  date: string,
  stationType: StationType,
  startTime: string,
  endTime: string
): Promise<number> {
  const config = STATION_CONFIG[stationType];
  const bookings = await getBookingsForDateAndStation(date, stationType);

  for (let unit = 1; unit <= config.units; unit++) {
    const hasConflict = bookings.some(
      (booking: Booking) =>
        booking.unit_number === unit &&
        timesOverlap(startTime, endTime, booking.start_time, booking.end_time)
    );
    if (!hasConflict) {
      return unit;
    }
  }

  return -1; // No available units
}
