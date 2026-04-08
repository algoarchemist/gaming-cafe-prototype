'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0">
        <motion.div
          className="bg-orb w-[600px] h-[600px] top-[-200px] left-[-200px]"
          style={{ background: 'var(--neon-blue)' }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="bg-orb w-[500px] h-[500px] top-[40%] right-[-150px]"
          style={{ background: 'var(--neon-pink)' }}
          animate={{
            x: [0, -40, 0],
            y: [0, 50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="bg-orb w-[400px] h-[400px] bottom-[-100px] left-[30%]"
          style={{ background: 'var(--neon-purple)' }}
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="bg-orb w-[300px] h-[300px] top-[20%] left-[50%]"
          style={{ background: 'var(--neon-green)', opacity: 0.08 }}
          animate={{
            x: [0, -30, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Google Reviews badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8"
        >
          <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
          <span className="text-sm text-gray-300">4.8 on Google Reviews</span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
        >
          <span className="gradient-text">Book Your</span>
          <br />
          <span className="neon-text-blue">Battle Station</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10"
        >
          Premium gaming lounge in Ramapuram, Chennai. PS5, PS4, PC &amp; Sim Racing — 
          your ultimate gaming experience starts here.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/book" className="neon-btn-pink">
            🎯 Book Now
          </Link>
          <a href="#stations" className="neon-btn-blue">
            Explore Stations
          </a>
        </motion.div>

        {/* Station ticker / marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="glass-card py-3 overflow-hidden"
        >
          <div className="marquee-container">
            <div className="marquee-content">
              <span className="inline-flex items-center gap-8 text-sm text-gray-400">
                <span>🎮 <span className="text-neon-blue">PS5</span> — 2 Stations Available</span>
                <span className="text-gray-600">|</span>
                <span>🕹️ <span className="text-neon-pink">PS4</span> — 2 Stations Available</span>
                <span className="text-gray-600">|</span>
                <span>🖥️ <span className="text-neon-green">PC</span> — 15 Stations Available</span>
                <span className="text-gray-600">|</span>
                <span>🏎️ <span className="text-neon-purple">Sim Wheel</span> — 1 Station Available</span>
                <span className="text-gray-600">|</span>
                <span>🎮 <span className="text-neon-blue">PS5</span> — 2 Stations Available</span>
                <span className="text-gray-600">|</span>
                <span>🕹️ <span className="text-neon-pink">PS4</span> — 2 Stations Available</span>
                <span className="text-gray-600">|</span>
                <span>🖥️ <span className="text-neon-green">PC</span> — 15 Stations Available</span>
                <span className="text-gray-600">|</span>
                <span>🏎️ <span className="text-neon-purple">Sim Wheel</span> — 1 Station Available</span>
                <span className="text-gray-600 mr-8">|</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-neon-blue"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
