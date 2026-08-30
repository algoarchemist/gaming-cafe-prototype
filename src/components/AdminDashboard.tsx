'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Booking {
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
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  created_at: string;
}

interface Stats {
  totalBookings: number;
  totalRevenue: number;
  todayBookings: number;
  todayRevenue: number;
  pendingCount: number;
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

const statusBadge: Record<Booking['status'], string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-neon-green/10 text-neon-green border-neon-green/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
  cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
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
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'today' | 'all'>('pending');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; previewUrl?: string | null } | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const dateParam = activeTab === 'today' ? getTodayStr() : dateFilter || '';
      const url = dateParam
        ? `/api/admin/bookings?date=${dateParam}`
        : '/api/admin/bookings';
      const res = await fetch(url);
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setBookings(data.bookings || []);
      setStats(data.stats || null);
    } catch {
      setBookings([]);
    }
    setLoading(false);
  }, [activeTab, dateFilter, router]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  const visibleBookings =
    activeTab === 'pending' ? bookings.filter((b) => b.status === 'pending') : bookings;

  const handleAction = async (id: string, action: 'accept' | 'reject') => {
    setActioningId(id);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice({ text: data.error || 'Action failed' });
      } else if (data.emailError) {
        setNotice({
          text:
            action === 'accept'
              ? `Booking confirmed, but the email couldn't be sent: ${data.emailError}`
              : `Booking rejected, but the email couldn't be sent: ${data.emailError}`,
        });
      } else {
        setNotice({
          text: action === 'accept' ? '✅ Booking confirmed and invoice emailed to customer' : 'Booking rejected and customer notified',
          previewUrl: data.previewUrl,
        });
      }
      await fetchBookings();
    } catch {
      setNotice({ text: 'Something went wrong. Please try again.' });
    }
    setActioningId(null);
  };

  const handleResend = async (id: string) => {
    setActioningId(id);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/bookings/${id}/resend`, { method: 'POST' });
      const data = await res.json();
      setNotice(
        res.ok
          ? { text: '📧 Invoice email resent', previewUrl: data.previewUrl }
          : { text: data.error || 'Failed to resend email' }
      );
    } catch {
      setNotice({ text: 'Something went wrong. Please try again.' });
    }
    setActioningId(null);
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

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
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-400 transition-colors"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Notice banner */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-white/5 border border-card-border rounded-xl p-4 text-sm text-gray-200 flex items-center justify-between"
            >
              <span>
                {notice.text}
                {notice.previewUrl && (
                  <>
                    {' — '}
                    <a
                      href={notice.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neon-blue underline hover:text-white"
                    >
                      view test email (Ethereal)
                    </a>
                  </>
                )}
              </span>
              <button onClick={() => setNotice(null)} className="text-gray-500 hover:text-white ml-4 shrink-0">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
          >
            <div className="glass-card p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pending</p>
              <p className="font-heading text-3xl font-bold text-yellow-400">{stats.pendingCount}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Today&apos;s Bookings</p>
              <p className="font-heading text-3xl font-bold neon-text-blue">{stats.todayBookings}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Today&apos;s Revenue</p>
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
              onClick={() => { setActiveTab('pending'); setDateFilter(''); }}
              className={`px-4 py-2 rounded-xl text-sm font-heading font-semibold transition-all ${
                activeTab === 'pending'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              ⏳ Pending
            </button>
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
          ) : visibleBookings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-400 font-medium">No bookings found</p>
              <p className="text-gray-600 text-sm mt-1">
                {activeTab === 'pending'
                  ? 'No pending requests right now'
                  : activeTab === 'today'
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
                    <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">Booking</th>
                    <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">Station</th>
                    <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="text-right px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {visibleBookings.map((booking, index) => (
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
                            <p className="text-gray-600 text-xs">{booking.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`font-heading font-semibold text-sm ${stationColors[booking.station_type]}`}>
                            {stationEmojis[booking.station_type]} {stationLabels[booking.station_type]} #{booking.unit_number}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-300">{formatDate(booking.date)}</td>
                        <td className="px-4 py-4 text-sm text-gray-300">
                          {formatTime12h(booking.start_time)} — {formatTime12h(booking.end_time)}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusBadge[booking.status]}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-heading font-bold text-neon-green">₹{booking.total_price}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  disabled={actioningId === booking.id}
                                  onClick={() => handleAction(booking.id, 'accept')}
                                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20 transition-colors disabled:opacity-50"
                                >
                                  ✓ Accept
                                </button>
                                <button
                                  disabled={actioningId === booking.id}
                                  onClick={() => handleAction(booking.id, 'reject')}
                                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                >
                                  ✕ Reject
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <>
                                <Link
                                  href={`/admin/bill/${booking.id}`}
                                  target="_blank"
                                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 border border-card-border hover:bg-white/10 transition-colors"
                                >
                                  🧾 Bill
                                </Link>
                                <button
                                  disabled={actioningId === booking.id}
                                  onClick={() => handleResend(booking.id)}
                                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 border border-card-border hover:bg-white/10 transition-colors disabled:opacity-50"
                                >
                                  📧 Resend
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Footer summary */}
          {visibleBookings.length > 0 && (
            <div className="px-4 py-3 border-t border-card-border flex items-center justify-between bg-white/[0.01]">
              <span className="text-xs text-gray-500">
                {visibleBookings.length} booking{visibleBookings.length !== 1 ? 's' : ''}
                {activeTab === 'pending' ? ' pending' : activeTab === 'today' ? ' today' : dateFilter ? ` on ${formatDate(dateFilter)}` : ' total'}
              </span>
              <span className="font-heading font-bold text-sm neon-text-green">
                Total: ₹{visibleBookings.reduce((sum, b) => sum + b.total_price, 0)}
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
