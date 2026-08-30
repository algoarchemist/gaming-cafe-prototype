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

// Migrations for existing DBs — each ALTER is wrapped since SQLite has no
// "ADD COLUMN IF NOT EXISTS" and re-running would otherwise throw.
const migrations = [
  `ALTER TABLE bookings ADD COLUMN num_persons INTEGER NOT NULL DEFAULT 1`,
  `ALTER TABLE bookings ADD COLUMN email TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE bookings ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'`,
  // SQLite forbids a non-constant default (e.g. datetime('now')) on ADD COLUMN,
  // so add it nullable and backfill separately.
  `ALTER TABLE bookings ADD COLUMN updated_at TEXT`,
];
for (const migration of migrations) {
  try {
    db.exec(migration);
  } catch {
    // Column already exists — ignore
  }
}
db.exec(`UPDATE bookings SET updated_at = created_at WHERE updated_at IS NULL`);

// Create index for quick availability lookups
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_bookings_lookup
  ON bookings(date, station_type, unit_number)
`);

// Bills table — one bill per booking, generated when a booking is accepted
db.exec(`
  CREATE TABLE IF NOT EXISTS bills (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT UNIQUE NOT NULL,
    booking_id TEXT NOT NULL UNIQUE,
    invoice_number TEXT NOT NULL UNIQUE,
    subtotal INTEGER NOT NULL,
    tax INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL,
    generated_at TEXT NOT NULL DEFAULT (datetime('now')),
    email_sent_at TEXT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
  )
`);

// Admin sessions table — simple server-side session store for the dashboard login
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_sessions (
    token TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
  )
`);

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

export interface Booking {
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
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: string;
  booking_id: string;
  invoice_number: string;
  subtotal: number;
  tax: number;
  total: number;
  generated_at: string;
  email_sent_at: string | null;
}

// Bookings that no longer hold their slot — a rejected/cancelled booking
// frees up the unit for others.
const ACTIVE_STATUSES = ['pending', 'confirmed'];

export function getBookingsForDateAndStation(date: string, stationType: string): Booking[] {
  const stmt = db.prepare(
    `SELECT * FROM bookings WHERE date = ? AND station_type = ? AND status IN (${ACTIVE_STATUSES.map(() => '?').join(',')})`
  );
  return stmt.all(date, stationType, ...ACTIVE_STATUSES) as Booking[];
}

export function createBooking(booking: Omit<Booking, 'created_at' | 'updated_at' | 'status'>): Booking {
  const stmt = db.prepare(`
    INSERT INTO bookings (id, name, phone, email, station_type, unit_number, date, start_time, end_time, duration, num_persons, total_price, status, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
  `);
  stmt.run(
    booking.id,
    booking.name,
    booking.phone,
    booking.email,
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

export function getBookingsByStatus(status: BookingStatus): Booking[] {
  const stmt = db.prepare('SELECT * FROM bookings WHERE status = ? ORDER BY date ASC, start_time ASC');
  return stmt.all(status) as Booking[];
}

export function updateBookingStatus(id: string, status: BookingStatus): Booking | null {
  const stmt = db.prepare(`UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?`);
  stmt.run(status, id);
  return getBookingById(id);
}

export function getBookingStats(): {
  totalBookings: number;
  totalRevenue: number;
  todayBookings: number;
  todayRevenue: number;
  pendingCount: number;
} {
  const today = new Date().toISOString().split('T')[0];
  const totalRow = db
    .prepare(`SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue FROM bookings WHERE status != 'rejected' AND status != 'cancelled'`)
    .get() as any;
  const todayRow = db
    .prepare(`SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue FROM bookings WHERE date = ? AND status != 'rejected' AND status != 'cancelled'`)
    .get(today) as any;
  const pendingRow = db.prepare(`SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'`).get() as any;
  return {
    totalBookings: totalRow.count,
    totalRevenue: totalRow.revenue,
    todayBookings: todayRow.count,
    todayRevenue: todayRow.revenue,
    pendingCount: pendingRow.count,
  };
}

// --- Bills ---

export function createBill(bill: { id: string; bookingId: string; subtotal: number; tax?: number }): Bill {
  const tax = bill.tax ?? 0;
  const total = bill.subtotal + tax;
  const stmt = db.prepare(`
    INSERT INTO bills (id, booking_id, invoice_number, subtotal, tax, total)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  // invoice_number is finalized right after insert using the autoincrement seq
  const info = stmt.run(bill.id, bill.bookingId, 'PENDING', bill.subtotal, tax, total);
  const invoiceNumber = `GZ-INV-${String(info.lastInsertRowid).padStart(5, '0')}`;
  db.prepare(`UPDATE bills SET invoice_number = ? WHERE seq = ?`).run(invoiceNumber, info.lastInsertRowid);
  return getBillByBookingId(bill.bookingId)!;
}

export function getBillByBookingId(bookingId: string): Bill | null {
  const stmt = db.prepare('SELECT * FROM bills WHERE booking_id = ?');
  return (stmt.get(bookingId) as Bill) || null;
}

export function markBillEmailSent(billId: string): void {
  db.prepare(`UPDATE bills SET email_sent_at = datetime('now') WHERE id = ?`).run(billId);
}

// --- Admin sessions ---

export function createAdminSession(token: string, expiresAt: string): void {
  db.prepare(`INSERT INTO admin_sessions (token, expires_at) VALUES (?, ?)`).run(token, expiresAt);
}

export function isValidAdminSession(token: string): boolean {
  const row = db
    .prepare(`SELECT token FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')`)
    .get(token);
  return !!row;
}

export function deleteAdminSession(token: string): void {
  db.prepare(`DELETE FROM admin_sessions WHERE token = ?`).run(token);
}

export default db;
