'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card px-6 py-3">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="text-2xl">🎮</span>
          <span className="font-heading font-bold text-xl neon-text-blue group-hover:scale-105 transition-transform">
            Gen Z
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#stations" className="text-gray-300 hover:text-neon-blue transition-colors text-sm font-medium">
            Stations
          </a>
          <a href="#how-it-works" className="text-gray-300 hover:text-neon-blue transition-colors text-sm font-medium">
            How It Works
          </a>
          <a href="#snacks" className="text-gray-300 hover:text-neon-blue transition-colors text-sm font-medium">
            Snacks
          </a>
          <a href="#location" className="text-gray-300 hover:text-neon-blue transition-colors text-sm font-medium">
            Location
          </a>
        </div>

        <Link href="/book" className="neon-btn-blue !px-5 !py-2 !text-sm">
          Book Now
        </Link>
      </div>
    </motion.nav>
  );
}
