import { createClient, type Client, type InValue } from '@libsql/client';
import path from 'path';
import fs from 'fs';

// In production set TURSO_DATABASE_URL (+ TURSO_AUTH_TOKEN) to a hosted Turso
// database — Vercel's filesystem is ephemeral, so a local file won't persist.
// Without those vars we fall back to a local file, which keeps `npm run dev`
// working exactly as before with zero setup.
function createDbClient(): Client {
  const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;
  if (TURSO_DATABASE_URL) {
    return createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });
  }

  const DB_DIR = path.join(process.cwd(), 'data');
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  return createClient({ url: `file:${path.join(DB_DIR, 'bookings.db')}` });
}

const db = createDbClient();

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

let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    await db.execute(`
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
        await db.execute(migration);
      } catch {
        // Column already exists — ignore
      }
    }
    await db.execute(`UPDATE bookings SET updated_at = created_at WHERE updated_at IS NULL`);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_bookings_lookup
      ON bookings(date, station_type, unit_number)
    `);

    // Bills table — one bill per booking, generated when a booking is accepted
    await db.execute(`
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
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        token TEXT PRIMARY KEY,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        expires_at TEXT NOT NULL
      )
    `);
  })();

  return schemaReady;
}

async function query(sql: string, args: InValue[] = []) {
  await ensureSchema();
  return db.execute({ sql, args });
}

export async function getBookingsForDateAndStation(date: string, stationType: string): Promise<Booking[]> {
  const result = await query(
    `SELECT * FROM bookings WHERE date = ? AND station_type = ? AND status IN (${ACTIVE_STATUSES.map(() => '?').join(',')})`,
    [date, stationType, ...ACTIVE_STATUSES]
  );
  return result.rows as unknown as Booking[];
}

export async function createBooking(booking: Omit<Booking, 'created_at' | 'updated_at' | 'status'>): Promise<Booking> {
  await query(
    `INSERT INTO bookings (id, name, phone, email, station_type, unit_number, date, start_time, end_time, duration, num_persons, total_price, status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
    [
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
      booking.total_price,
    ]
  );
  return (await getBookingById(booking.id))!;
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const result = await query('SELECT * FROM bookings WHERE id = ?', [id]);
  return (result.rows[0] as unknown as Booking) || null;
}

export async function getAllBookings(): Promise<Booking[]> {
  const result = await query('SELECT * FROM bookings ORDER BY date DESC, start_time DESC');
  return result.rows as unknown as Booking[];
}

export async function getBookingsByDate(date: string): Promise<Booking[]> {
  const result = await query('SELECT * FROM bookings WHERE date = ? ORDER BY start_time ASC', [date]);
  return result.rows as unknown as Booking[];
}

export async function getBookingsByStatus(status: BookingStatus): Promise<Booking[]> {
  const result = await query('SELECT * FROM bookings WHERE status = ? ORDER BY date ASC, start_time ASC', [status]);
  return result.rows as unknown as Booking[];
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null> {
  await query(`UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?`, [status, id]);
  return getBookingById(id);
}

export async function getBookingStats(): Promise<{
  totalBookings: number;
  totalRevenue: number;
  todayBookings: number;
  todayRevenue: number;
  pendingCount: number;
}> {
  const today = new Date().toISOString().split('T')[0];
  const totalResult = await query(
    `SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue FROM bookings WHERE status != 'rejected' AND status != 'cancelled'`
  );
  const todayResult = await query(
    `SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue FROM bookings WHERE date = ? AND status != 'rejected' AND status != 'cancelled'`,
    [today]
  );
  const pendingResult = await query(`SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'`);

  const totalRow = totalResult.rows[0];
  const todayRow = todayResult.rows[0];
  const pendingRow = pendingResult.rows[0];

  return {
    totalBookings: Number(totalRow.count),
    totalRevenue: Number(totalRow.revenue),
    todayBookings: Number(todayRow.count),
    todayRevenue: Number(todayRow.revenue),
    pendingCount: Number(pendingRow.count),
  };
}

// --- Bills ---

export async function createBill(bill: { id: string; bookingId: string; subtotal: number; tax?: number }): Promise<Bill> {
  const tax = bill.tax ?? 0;
  const total = bill.subtotal + tax;
  const insertResult = await query(
    `INSERT INTO bills (id, booking_id, invoice_number, subtotal, tax, total)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [bill.id, bill.bookingId, 'PENDING', bill.subtotal, tax, total]
  );
  // invoice_number is finalized right after insert using the autoincrement seq
  const invoiceNumber = `GZ-INV-${String(insertResult.lastInsertRowid).padStart(5, '0')}`;
  await query(`UPDATE bills SET invoice_number = ? WHERE seq = ?`, [invoiceNumber, insertResult.lastInsertRowid ?? null]);
  return (await getBillByBookingId(bill.bookingId))!;
}

export async function getBillByBookingId(bookingId: string): Promise<Bill | null> {
  const result = await query('SELECT * FROM bills WHERE booking_id = ?', [bookingId]);
  return (result.rows[0] as unknown as Bill) || null;
}

export async function markBillEmailSent(billId: string): Promise<void> {
  await query(`UPDATE bills SET email_sent_at = datetime('now') WHERE id = ?`, [billId]);
}

// --- Admin sessions ---

export async function createAdminSession(token: string, expiresAt: string): Promise<void> {
  await query(`INSERT INTO admin_sessions (token, expires_at) VALUES (?, ?)`, [token, expiresAt]);
}

export async function isValidAdminSession(token: string): Promise<boolean> {
  const result = await query(
    `SELECT token FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')`,
    [token]
  );
  return result.rows.length > 0;
}

export async function deleteAdminSession(token: string): Promise<void> {
  await query(`DELETE FROM admin_sessions WHERE token = ?`, [token]);
}

export default db;
