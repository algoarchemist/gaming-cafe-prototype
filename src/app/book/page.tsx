import type { Metadata } from 'next';
import Link from 'next/link';
import BookingForm from '@/components/BookingForm';

export const metadata: Metadata = {
  title: 'Book Your Slot — Gen Z Gaming Cafe | Gaming Café in Ramapuram, Chennai',
  description: 'Reserve your PS5, PS4, PC, or Sim Wheel session at Gen Z Gaming Cafe, Ramapuram, Chennai. Real-time availability and instant booking.',
};

export default function BookPage() {
  return (
    <main className="min-h-screen bg-background relative">
      {/* Background accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="bg-orb w-[500px] h-[500px] top-[-200px] right-[-100px]"
          style={{ background: 'var(--neon-pink)', opacity: 0.08 }}
        />
        <div
          className="bg-orb w-[400px] h-[400px] bottom-[-100px] left-[-100px]"
          style={{ background: 'var(--neon-blue)', opacity: 0.06 }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 py-6 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl">🎮</span>
            <span className="font-heading font-bold text-lg neon-text-blue group-hover:scale-105 transition-transform">
              Gen Z
            </span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-neon-blue transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Booking Section */}
      <div className="relative z-10 px-4 pb-20">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold gradient-text mb-3">
            Book Your Slot
          </h1>
          <p className="text-gray-400">
            Pick your station, choose your time, and lock in your session.
          </p>
        </div>

        <BookingForm />
      </div>
    </main>
  );
}
