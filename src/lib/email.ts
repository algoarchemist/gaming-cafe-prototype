import nodemailer from 'nodemailer';
import type { Booking, Bill } from './db';

const stationLabels: Record<string, string> = {
  ps5: 'PlayStation 5',
  ps4: 'PlayStation 4',
  pc: 'Gaming PC',
  sim: 'Sim Wheel Setup',
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

let cachedTransporter: Promise<nodemailer.Transporter> | null = null;
let usingEthereal = false;

/**
 * Real SMTP creds (SMTP_HOST/PORT/USER/PASS) are used when set. Otherwise we
 * fall back to Ethereal — Nodemailer's disposable test SMTP service — so the
 * accept/reject/bill flow works out of the box with zero signup. Ethereal
 * never delivers to a real inbox; it captures the message behind a preview
 * URL instead. Add real SMTP_* vars to .env.local to send real emails.
 */
async function getTransporter(): Promise<nodemailer.Transporter> {
  if (cachedTransporter) return cachedTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    cachedTransporter = Promise.resolve(
      nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      })
    );
    return cachedTransporter;
  }

  usingEthereal = true;
  cachedTransporter = nodemailer.createTestAccount().then((testAccount) =>
    nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    })
  );
  return cachedTransporter;
}

function fromAddress(): string {
  return process.env.SMTP_FROM || `Gen Z Gaming Cafe <${process.env.SMTP_USER || 'noreply@genzgaming.cafe'}>`;
}

/** Returns an Ethereal preview URL when running against the test transporter, otherwise null. */
export interface SendResult {
  previewUrl: string | null;
}

export async function sendBookingConfirmationEmail(booking: Booking, bill: Bill): Promise<SendResult> {
  const transporter = await getTransporter();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #0891b2;">Booking Confirmed! 🎮</h2>
      <p>Hi ${booking.name}, your battle station at <strong>Gen Z Gaming Cafe</strong> is confirmed.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 6px 0; color: #666;">Booking ID</td><td style="padding: 6px 0; text-align: right;">${booking.id.split('-')[0].toUpperCase()}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Station</td><td style="padding: 6px 0; text-align: right;">${stationLabels[booking.station_type] || booking.station_type} #${booking.unit_number}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Date</td><td style="padding: 6px 0; text-align: right;">${formatDate(booking.date)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Time</td><td style="padding: 6px 0; text-align: right;">${formatTime12h(booking.start_time)} – ${formatTime12h(booking.end_time)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Players</td><td style="padding: 6px 0; text-align: right;">${booking.num_persons}</td></tr>
      </table>
      <h3 style="border-top: 1px solid #eee; padding-top: 12px;">Invoice ${bill.invoice_number}</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #666;">Subtotal</td><td style="padding: 4px 0; text-align: right;">₹${bill.subtotal}</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Tax</td><td style="padding: 4px 0; text-align: right;">₹${bill.tax}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #eee;">Total</td><td style="padding: 8px 0; text-align: right; font-weight: bold; border-top: 1px solid #eee;">₹${bill.total}</td></tr>
      </table>
      <p style="margin-top: 24px; color: #666; font-size: 13px;">See you at Gen Z Gaming Cafe, Ramapuram, Chennai. Please arrive 5 minutes before your slot.</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: fromAddress(),
    to: booking.email,
    subject: `Booking Confirmed — ${bill.invoice_number} — Gen Z Gaming Cafe`,
    html,
  });

  return { previewUrl: usingEthereal ? nodemailer.getTestMessageUrl(info) || null : null };
}

export async function sendBookingRejectionEmail(booking: Booking): Promise<SendResult> {
  const transporter = await getTransporter();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #dc2626;">Booking Not Available</h2>
      <p>Hi ${booking.name}, unfortunately we're unable to confirm your requested slot:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 6px 0; color: #666;">Station</td><td style="padding: 6px 0; text-align: right;">${stationLabels[booking.station_type] || booking.station_type}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Date</td><td style="padding: 6px 0; text-align: right;">${formatDate(booking.date)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Time</td><td style="padding: 6px 0; text-align: right;">${formatTime12h(booking.start_time)} – ${formatTime12h(booking.end_time)}</td></tr>
      </table>
      <p>Please visit our site to book another available slot. Sorry for the inconvenience!</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: fromAddress(),
    to: booking.email,
    subject: `Booking Update — Gen Z Gaming Cafe`,
    html,
  });

  return { previewUrl: usingEthereal ? nodemailer.getTestMessageUrl(info) || null : null };
}
