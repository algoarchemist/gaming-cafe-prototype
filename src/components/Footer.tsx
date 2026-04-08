import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-card-border py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎮</span>
          <span className="font-heading font-bold text-lg neon-text-blue">Gen Z Gaming Cafe</span>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500">
          <a href="#stations" className="hover:text-neon-blue transition-colors">Stations</a>
          <a href="#how-it-works" className="hover:text-neon-blue transition-colors">How It Works</a>
          <a href="#snacks" className="hover:text-neon-blue transition-colors">Snacks</a>
          <a href="#location" className="hover:text-neon-blue transition-colors">Location</a>
          <Link href="/book" className="hover:text-neon-pink transition-colors font-semibold">Book Now</Link>
        </div>

        <p className="text-gray-600 text-xs">
          © 2026 Gen Z Gaming Cafe. Ramapuram, Chennai.
        </p>
      </div>
    </footer>
  );
}
