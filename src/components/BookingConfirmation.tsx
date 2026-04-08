'use client';

import { motion } from 'framer-motion';

interface BookingConfirmationProps {
  booking: {
    id: string;
    name: string;
    phone: string;
    station_type: string;
    unit_number: number;
    date: string;
    start_time: string;
    end_time: string;
    duration: number;
    num_persons: number;
    total_price: number;
  };
  onNewBooking: () => void;
}

const stationLabels: Record<string, string> = {
  ps5: 'PlayStation 5',
  ps4: 'PlayStation 4',
  pc: 'Gaming PC',
  sim: 'Sim Wheel Setup',
};

const stationEmojis: Record<string, string> = {
  ps5: '🎮',
  ps4: '🕹️',
  pc: '🖥️',
  sim: '🏎️',
};

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BookingConfirmation({ booking, onNewBooking }: BookingConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="max-w-lg mx-auto"
    >
      <div className="glass-card p-8 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-blue via-neon-pink to-neon-purple" />

        {/* Success header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-6xl mb-4"
          >
            ✅
          </motion.div>
          <h2 className="font-heading text-2xl font-bold gradient-text mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-gray-400 text-sm">Your battle station is reserved</p>
        </div>

        {/* Booking ID */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Booking ID</p>
          <p className="font-heading font-bold text-neon-blue text-sm tracking-widest">
            {booking.id.split('-')[0].toUpperCase()}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-card-border">
            <span className="text-gray-400 text-sm">Player</span>
            <span className="text-white font-medium">{booking.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-card-border">
            <span className="text-gray-400 text-sm">Phone</span>
            <span className="text-white">{booking.phone}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-card-border">
            <span className="text-gray-400 text-sm">Station</span>
            <span className="text-white">
              {stationEmojis[booking.station_type]} {stationLabels[booking.station_type]} #{booking.unit_number}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-card-border">
            <span className="text-gray-400 text-sm">Date</span>
            <span className="text-white">{formatDate(booking.date)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-card-border">
            <span className="text-gray-400 text-sm">Time</span>
            <span className="text-white">
              {formatTime12h(booking.start_time)} — {formatTime12h(booking.end_time)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-card-border">
            <span className="text-gray-400 text-sm">Duration</span>
            <span className="text-white">
              {booking.duration >= 1
                ? `${booking.duration} hour${booking.duration > 1 ? 's' : ''}`
                : '30 minutes'}
            </span>
          </div>
          {booking.num_persons > 1 && (
            <div className="flex justify-between items-center py-2 border-b border-card-border">
              <span className="text-gray-400 text-sm">Players</span>
              <span className="text-white">
                👥 {booking.num_persons} players
              </span>
            </div>
          )}
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-300 font-semibold">Total</span>
            <span className="font-heading font-bold text-2xl neon-text-green">
              ₹{booking.total_price}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <button
            onClick={onNewBooking}
            className="neon-btn-blue w-full !text-sm"
          >
            Book Another Session
          </button>
          <a
            href="/"
            className="block text-center text-gray-500 hover:text-neon-blue transition-colors text-sm"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </motion.div>
  );
}
