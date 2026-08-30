'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BookingConfirmation from './BookingConfirmation';

const STATION_OPTIONS = [
  { value: 'ps5', label: 'PS5', icon: '🎮', color: 'neon-blue', units: 2, maxPlayers: 4 },
  { value: 'ps4', label: 'PS4', icon: '🕹️', color: 'neon-pink', units: 2, maxPlayers: 4 },
  { value: 'pc', label: 'PC', icon: '🖥️', color: 'neon-green', units: 15, maxPlayers: 1 },
  { value: 'sim', label: 'Sim Wheel', icon: '🏎️', color: 'neon-purple', units: 1, maxPlayers: 1 },
];

interface DurationOption {
  value: number;
  label: string;
}

interface TimeSlot {
  value: string;
  label: string;
}

function getTodayStr(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function calculatePriceClient(stationType: string, durationMinutes: number, numPersons: number = 1): number {
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
  const effectivePersons = (stationType === 'ps5' || stationType === 'ps4') ? numPersons : 1;
  return perPersonPrice * effectivePersons;
}

function getDurationOptionsClient(stationType: string): DurationOption[] {
  if (stationType === 'sim') {
    return [
      { value: 30, label: '30 minutes' },
      { value: 60, label: '1 hour' },
    ];
  }
  const options: DurationOption[] = [];
  for (let mins = 60; mins <= 780; mins += 30) {
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    let label = '';
    if (hours > 0 && remainMins > 0) label = `${hours}h ${remainMins}m`;
    else if (hours > 0) label = `${hours} hour${hours > 1 ? 's' : ''}`;
    else label = `${remainMins} minutes`;
    options.push({ value: mins, label });
  }
  return options;
}

function getTimeSlotsClient(durationMinutes: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const closingMinutes = 23 * 60;
  for (let totalMins = 10 * 60; totalMins < closingMinutes; totalMins += 30) {
    if (totalMins + durationMinutes > closingMinutes) break;
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const value = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const label = `${displayHour}:${String(mins).padStart(2, '0')} ${ampm}`;
    slots.push({ value, label });
  }
  return slots;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function BookingForm() {
  const [date, setDate] = useState(getTodayStr());
  const [station, setStation] = useState('ps5');
  const [duration, setDuration] = useState(60);
  const [startTime, setStartTime] = useState('');
  const [numPersons, setNumPersons] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [availability, setAvailability] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  interface ConfirmedBooking {
    id: string;
    name: string;
    phone: string;
    email: string;
    station_type: string;
    unit_number: number;
    date: string;
    start_time: string;
    end_time: string;
    duration: number;
    num_persons: number;
    total_price: number;
    status: string;
  }
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);

  const durationOptions = getDurationOptionsClient(station);
  const timeSlots = getTimeSlotsClient(duration);

  // Reset duration and persons when station changes
  useEffect(() => {
    const opts = getDurationOptionsClient(station);
    if (!opts.find((o) => o.value === duration)) {
      setDuration(opts[0]?.value || 60);
    }
    const stationInfo = STATION_OPTIONS.find((s) => s.value === station);
    if (stationInfo && numPersons > stationInfo.maxPlayers) {
      setNumPersons(1);
    }
  }, [station, duration, numPersons]);

  // Reset start time when duration changes (some slots may no longer be valid)
  useEffect(() => {
    const slots = getTimeSlotsClient(duration);
    if (startTime && !slots.find((s) => s.value === startTime)) {
      setStartTime(slots[0]?.value || '');
    } else if (!startTime && slots.length > 0) {
      setStartTime(slots[0].value);
    }
  }, [duration, startTime]);

  // Fetch availability
  const fetchAvailability = useCallback(async () => {
    if (!date || !station || !startTime || !duration) {
      setAvailability(null);
      return;
    }
    try {
      const res = await fetch(
        `/api/availability?date=${date}&station=${station}&start=${startTime}&duration=${duration}`
      );
      const data = await res.json();
      setAvailability(data.available);
    } catch {
      setAvailability(null);
    }
  }, [date, station, startTime, duration]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Calculate derived values
  const selectedStationInfo = STATION_OPTIONS.find((s) => s.value === station);
  const showPersonsSelector = selectedStationInfo && selectedStationInfo.maxPlayers > 1;
  const price = calculatePriceClient(station, duration, numPersons);
  const endTimeStr = startTime
    ? minutesToTime(
        parseInt(startTime.split(':')[0]) * 60 +
          parseInt(startTime.split(':')[1]) +
          duration
      )
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (availability !== null && availability <= 0) {
      setError('No slots available for this time. Please choose another slot.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          station_type: station,
          date,
          start_time: startTime,
          duration,
          num_persons: numPersons,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create booking');
        setLoading(false);
        return;
      }

      setConfirmedBooking(data);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleNewBooking = () => {
    setConfirmedBooking(null);
    setName('');
    setPhone('');
    setEmail('');
    setNumPersons(1);
    setError('');
    fetchAvailability();
  };

  if (confirmedBooking) {
    return <BookingConfirmation booking={confirmedBooking} onNewBooking={handleNewBooking} />;
  }



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
        {/* Station Selection */}
        <div>
          <label className="block font-heading text-sm font-semibold text-gray-300 mb-3 tracking-wider uppercase">
            Choose Your Station
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStation(opt.value)}
                className={`glass-card p-4 text-center transition-all duration-300 cursor-pointer
                  ${
                    station === opt.value
                      ? `border-${opt.color} shadow-${opt.color} bg-white/[0.06]`
                      : 'hover:bg-white/[0.04]'
                  }`}
              >
                <div className="text-3xl mb-2">{opt.icon}</div>
                <div className={`font-heading font-bold text-sm ${station === opt.value ? `text-${opt.color}` : 'text-gray-300'}`}>
                  {opt.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">×{opt.units}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block font-heading text-sm font-semibold text-gray-300 mb-3 tracking-wider uppercase">
            📅 Select Date
          </label>
          <input
            type="date"
            value={date}
            min={getTodayStr()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full"
            required
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block font-heading text-sm font-semibold text-gray-300 mb-3 tracking-wider uppercase">
            ⏱️ Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full"
          >
            {durationOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} — ₹{calculatePriceClient(station, opt.value, numPersons)}
              </option>
            ))}
          </select>
        </div>

        {/* Number of Persons (PS5/PS4 only) */}
        {showPersonsSelector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="block font-heading text-sm font-semibold text-gray-300 mb-3 tracking-wider uppercase">
              👥 Number of Players
            </label>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: selectedStationInfo!.maxPlayers }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNumPersons(n)}
                  className={`glass-card py-3 text-center transition-all duration-300 cursor-pointer
                    ${numPersons === n
                      ? 'border-neon-blue shadow-neon-blue bg-white/[0.06]'
                      : 'hover:bg-white/[0.04]'
                    }`}
                >
                  <div className={`font-heading font-bold text-lg ${numPersons === n ? 'text-neon-blue' : 'text-gray-300'}`}>
                    {n}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {n === 1 ? 'player' : 'players'}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Each {selectedStationInfo?.label} has 4 controllers — price is ₹{calculatePriceClient(station, duration, 1)}/person
            </p>
          </motion.div>
        )}

        {/* Start Time */}
        <div>
          <label className="block font-heading text-sm font-semibold text-gray-300 mb-3 tracking-wider uppercase">
            🕐 Start Time
          </label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full"
          >
            {timeSlots.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
        </div>

        {/* Session Summary Card */}
        <AnimatePresence mode="wait">
          {startTime && (
            <motion.div
              key={`${station}-${duration}-${startTime}-${numPersons}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-6 space-y-3"
            >
              <h3 className="font-heading text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">
                Session Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Station</p>
                  <p className="text-white font-medium">
                    {selectedStationInfo?.icon} {selectedStationInfo?.label}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-white font-medium">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="text-white font-medium">
                    {formatTime12h(startTime)} — {formatTime12h(endTimeStr)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Availability</p>
                  <p className={`font-semibold ${availability !== null && availability > 0 ? 'text-neon-green' : 'text-red-400'}`}>
                    {availability !== null
                      ? availability > 0
                        ? `${availability} slot${availability !== 1 ? 's' : ''} open`
                        : 'No slots available'
                      : 'Checking...'}
                  </p>
                </div>
                {showPersonsSelector && (
                  <div>
                    <p className="text-xs text-gray-500">Players</p>
                    <p className="text-white font-medium">
                      👥 {numPersons} {numPersons === 1 ? 'player' : 'players'}
                    </p>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="pt-4 border-t border-card-border flex items-center justify-between">
                <span className="text-gray-300 font-medium">Total Price</span>
                <span className="font-heading text-3xl font-bold neon-text-green">₹{price}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Personal Info */}
        <div className="space-y-4">
          <div>
            <label className="block font-heading text-sm font-semibold text-gray-300 mb-3 tracking-wider uppercase">
              👤 Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label className="block font-heading text-sm font-semibold text-gray-300 mb-3 tracking-wider uppercase">
              📱 Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              maxLength={15}
              required
            />
          </div>
          <div>
            <label className="block font-heading text-sm font-semibold text-gray-300 mb-3 tracking-wider uppercase">
              ✉️ Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              We&apos;ll email your invoice once the cafe confirms your slot.
            </p>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm"
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || (availability !== null && availability <= 0)}
          className={`neon-btn-pink w-full !text-base ${
            loading || (availability !== null && availability <= 0)
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Booking...
            </span>
          ) : (
            '🎯 Confirm Booking'
          )}
        </button>
      </form>
    </motion.div>
  );
}
