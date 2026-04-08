'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Booking {
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
  created_at: string;
}

interface Stats {
  totalBookings: number;
  totalRevenue: number;
  todayBookings: number;
  todayRevenue: number;
}

const stationLabels: Record<string, string> = {
  ps5: 'PS5',
  ps4: 'PS4',
  pc: 'PC',
  sim: 'Sim Wheel',
};

const stationEmojis: Record<string, string> = {
  ps5: '🎮',
  ps4: '🕹️',
  pc: '🖥️',
  sim: '🏎️',
};

const stationColors: Record<string, string> = {
  ps5: 'text-neon-blue',
  ps4: 'text-neon-pink',
  pc: 'text-neon-green',
  sim: 'text-neon-purple',
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
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'today'>('today');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const dateParam = activeTab === 'today' ? getTodayStr() : dateFilter || '';
      const url = dateParam
        ? `/api/admin/bookings?date=${dateParam}`
        : '/api/admin/bookings';
      const res = await fetch(url);
      const data = await res.json();
      setBookings(data.bookings || []);
      setStats(data.stats || null);
    } catch {
      setBookings([]);
    }
    setLoading(false);
  }, [activeTab, dateFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="bg-orb w-[500px] h-[500px] top-[-200px] left-[-100px]"
          style={{ background: 'var(--neon-purple)', opacity: 0.06 }}
        />
        <div
          className="bg-orb w-[400px] h-[400px] bottom-[-100px] right-[-100px]"
          style={{ background: 'var(--neon-blue)', opacity: 0.05 }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 py-6 px-4 border-b border-card-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl">🎮</span>
              <span className="font-heading font-bold text-lg neon-text-blue group-hover:scale-105 transition-transform">
                Gen Z
              </span>
            </Link>
            <span className="text-gray-600">|</span>
            <span className="font-heading text-sm text-gray-400 tracking-wider uppercase">
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchBookings}
              className="text-sm text-gray-400 hover:text-neon-blue transition-colors flex items-center gap-1"
            >
              🔄 Refresh
            </button>
            <Link href="/" className="text-sm text-gray-500 hover:text-neon-blue transition-colors">
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="glass-card p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Today's Bookings</p>
              <p className="font-heading text-3xl font-bold neon-text-blue">{stats.todayBookings}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Today's Revenue</p>
              <p className="font-heading text-3xl font-bold neon-text-green">₹{stats.todayRevenue}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Bookings</p>
              <p className="font-heading text-3xl font-bold neon-text-pink">{stats.totalBookings}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Revenue</p>
              <p className="font-heading text-3xl font-bold neon-text-purple">₹{stats.totalRevenue}</p>
            </div>
          </motion.div>
        )}

        {/* Tabs & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('today'); setDateFilter(''); }}
              className={`px-4 py-2 rounded-xl text-sm font-heading font-semibold transition-all ${
                activeTab === 'today'
                  ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                  : 'text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              📅 Today
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-sm font-heading font-semibold transition-all ${
                activeTab === 'all' && !dateFilter
                  ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/30'
                  : 'text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              📋 All Bookings
            </button>
          </div>

          {activeTab === 'all' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Filter by date:</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="!w-auto !py-2 !px-3 text-sm"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="text-xs text-gray-500 hover:text-neon-pink transition-colors"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bookings Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <span className="animate-spin inline-block text-2xl mb-2">⏳</span>
              <p>Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-400 font-medium">No bookings found</p>
              <p className="text-gray-600 text-sm mt-1">
                {activeTab === 'today'
                  ? 'No bookings for today yet'
                  : dateFilter
                  ? `No bookings for ${formatDate(dateFilter)}`
                  : 'No bookings in the system yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-card-border">
                    <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">
                      Station
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">
                      Players
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {bookings.map((booking, index) => (
                      <motion.tr
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-card-border hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-4">
                          <span className="font-heading text-xs text-neon-blue tracking-wider">
                            {booking.id.split('-')[0].toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-white font-medium text-sm">{booking.name}</p>
                            <p className="text-gray-500 text-xs">{booking.phone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`font-heading font-semibold text-sm ${stationColors[booking.station_type]}`}>
                            {stationEmojis[booking.station_type]} {stationLabels[booking.station_type]} #{booking.unit_number}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-300">
                          {formatDate(booking.date)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-300">
                          {formatTime12h(booking.start_time)} — {formatTime12h(booking.end_time)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-300">
                          {booking.duration >= 1
                            ? `${booking.duration}h`
                            : '30m'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-300">
                          {booking.num_persons > 1 ? (
                            <span className="bg-neon-blue/10 text-neon-blue px-2 py-0.5 rounded-full text-xs font-semibold">
                              👥 {booking.num_persons}
                            </span>
                          ) : (
                            <span className="text-gray-500">1</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-heading font-bold text-neon-green">
                            ₹{booking.total_price}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Footer summary */}
          {bookings.length > 0 && (
            <div className="px-4 py-3 border-t border-card-border flex items-center justify-between bg-white/[0.01]">
              <span className="text-xs text-gray-500">
                {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                {activeTab === 'today' ? ' today' : dateFilter ? ` on ${formatDate(dateFilter)}` : ' total'}
              </span>
              <span className="font-heading font-bold text-sm neon-text-green">
                Total: ₹{bookings.reduce((sum, b) => sum + b.total_price, 0)}
              </span>
            </div>
          )}
        </motion.div>

        {/* Auto-refresh notice */}
        <p className="text-center text-gray-600 text-xs mt-4">
          🔄 Auto-refreshes every 30 seconds
        </p>
      </div>
    </div>
  );
}
