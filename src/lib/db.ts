import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'bookings.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent reads
db.pragma('journal_mode = WAL');

// Create bookings table
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    station_type TEXT NOT NULL,
    unit_number INTEGER NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    duration REAL NOT NULL,
    num_persons INTEGER NOT NULL DEFAULT 1,
    total_price INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Migration: add num_persons column if missing (for existing DBs)
try {
  db.exec(`ALTER TABLE bookings ADD COLUMN num_persons INTEGER NOT NULL DEFAULT 1`);
} catch {
  // Column already exists — ignore
}

// Create index for quick availability lookups
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_bookings_lookup
  ON bookings(date, station_type, unit_number)
`);

export interface Booking {
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

export function getBookingsForDateAndStation(date: string, stationType: string): Booking[] {
  const stmt = db.prepare(
    'SELECT * FROM bookings WHERE date = ? AND station_type = ?'
  );
  return stmt.all(date, stationType) as Booking[];
}

export function createBooking(booking: Omit<Booking, 'created_at'>): Booking {
  const stmt = db.prepare(`
    INSERT INTO bookings (id, name, phone, station_type, unit_number, date, start_time, end_time, duration, num_persons, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    booking.id,
    booking.name,
    booking.phone,
    booking.station_type,
    booking.unit_number,
    booking.date,
    booking.start_time,
    booking.end_time,
    booking.duration,
    booking.num_persons,
    booking.total_price
  );
  return getBookingById(booking.id)!;
}

export function getBookingById(id: string): Booking | null {
  const stmt = db.prepare('SELECT * FROM bookings WHERE id = ?');
  return (stmt.get(id) as Booking) || null;
}

export function getAllBookings(): Booking[] {
  const stmt = db.prepare('SELECT * FROM bookings ORDER BY date DESC, start_time DESC');
  return stmt.all() as Booking[];
}

export function getBookingsByDate(date: string): Booking[] {
  const stmt = db.prepare('SELECT * FROM bookings WHERE date = ? ORDER BY start_time ASC');
  return stmt.all(date) as Booking[];
}

export function getBookingStats(): { totalBookings: number; totalRevenue: number; todayBookings: number; todayRevenue: number } {
  const today = new Date().toISOString().split('T')[0];
  const totalRow = db.prepare('SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue FROM bookings').get() as any;
  const todayRow = db.prepare('SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue FROM bookings WHERE date = ?').get(today) as any;
  return {
    totalBookings: totalRow.count,
    totalRevenue: totalRow.revenue,
    todayBookings: todayRow.count,
    todayRevenue: todayRow.revenue,
  };
}

export default db;
