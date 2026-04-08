export const STATION_CONFIG = {
  ps5: {
    label: 'PS5',
    units: 2,
    maxPlayers: 4, // 4 controllers per console
    minDurationMinutes: 60,
    durationIncrementMinutes: 30,
    maxDurationMinutes: 780, // 13 hours max (10AM-11PM)
    icon: '🎮',
    description: 'Next-gen gaming, 4K, DualSense controllers',
  },
  ps4: {
    label: 'PS4',
    units: 2,
    maxPlayers: 4, // 4 controllers per console
    minDurationMinutes: 60,
    durationIncrementMinutes: 30,
    maxDurationMinutes: 780,
    icon: '🕹️',
    description: 'Classic titles, great library',
  },
  pc: {
    label: 'PC',
    units: 15,
    maxPlayers: 1,
    minDurationMinutes: 60,
    durationIncrementMinutes: 30,
    maxDurationMinutes: 780,
    icon: '🖥️',
    description: 'Keyboard & mouse, wide game selection',
  },
  sim: {
    label: 'Sim Wheel',
    units: 1,
    maxPlayers: 1,
    minDurationMinutes: 30,
    durationIncrementMinutes: 30,
    maxDurationMinutes: 60,
    icon: '🏎️',
    description: 'Racing sim experience',
  },
} as const;

export type StationType = keyof typeof STATION_CONFIG;

/**
 * Pricing rules (per person):
 * - PS5: ₹100 first hour, ₹80/hr subsequent — × numPersons (up to 4 controllers)
 * - PS4: ₹80 first hour, ₹60/hr subsequent — × numPersons (up to 4 controllers)
 * - PC:  ₹80 first hour, ₹60/hr subsequent (single player)
 * - Sim: ₹100 for 30 min, ₹200 for 1 hour (single player)
 */
export function calculatePrice(stationType: StationType, durationMinutes: number, numPersons: number = 1): number {
  if (stationType === 'sim') {
    if (durationMinutes === 30) return 100;
    if (durationMinutes === 60) return 200;
    return 0;
  }

  const firstHourRate = stationType === 'ps5' ? 100 : 80;
  const subsequentHourRate = stationType === 'ps5' ? 80 : 60;

  let perPersonPrice: number;
  if (durationMinutes <= 60) {
    perPersonPrice = firstHourRate;
  } else {
    const remainingMinutes = durationMinutes - 60;
    const remainingHours = remainingMinutes / 60;
    perPersonPrice = Math.round(firstHourRate + subsequentHourRate * remainingHours);
  }

  // For PS5/PS4, price is per person per controller
  const effectivePersons = (stationType === 'ps5' || stationType === 'ps4') ? numPersons : 1;
  return perPersonPrice * effectivePersons;
}

/**
 * Get valid duration options for a station type
 */
export function getDurationOptions(stationType: StationType): { value: number; label: string }[] {
  const config = STATION_CONFIG[stationType];
  const options: { value: number; label: string }[] = [];

  if (stationType === 'sim') {
    options.push({ value: 30, label: '30 minutes' });
    options.push({ value: 60, label: '1 hour' });
    return options;
  }

  for (
    let mins = config.minDurationMinutes;
    mins <= config.maxDurationMinutes;
    mins += config.durationIncrementMinutes
  ) {
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    let label = '';
    if (hours > 0 && remainMins > 0) {
      label = `${hours}h ${remainMins}m`;
    } else if (hours > 0) {
      label = `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      label = `${remainMins} minutes`;
    }
    options.push({ value: mins, label });
  }

  return options;
}

/**
 * Operating hours: 10:00 AM to 11:00 PM
 */
export const OPENING_HOUR = 10; // 10:00 AM
export const CLOSING_HOUR = 23; // 11:00 PM

/**
 * Generate time slots (every 30 min from 10:00 to last valid start time)
 */
export function getTimeSlots(durationMinutes: number): { value: string; label: string }[] {
  const slots: { value: string; label: string }[] = [];
  const closingMinutes = CLOSING_HOUR * 60; // 23:00 = 1380 min

  for (let totalMins = OPENING_HOUR * 60; totalMins < closingMinutes; totalMins += 30) {
    // Ensure session ends by closing time
    if (totalMins + durationMinutes > closingMinutes) break;

    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const value = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    // Format for display (12-hour)
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const label = `${displayHour}:${String(mins).padStart(2, '0')} ${ampm}`;

    slots.push({ value, label });
  }

  return slots;
}
