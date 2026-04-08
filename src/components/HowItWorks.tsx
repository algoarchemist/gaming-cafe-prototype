'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    icon: '🎮',
    title: 'Choose Your Station',
    description: 'Pick from PS5, PS4, PC, or Sim Wheel — whatever matches your play style.',
    color: 'neon-blue',
  },
  {
    number: '02',
    icon: '📅',
    title: 'Pick Your Slot',
    description: 'Select your date, time, and duration. See real-time availability and pricing.',
    color: 'neon-pink',
  },
  {
    number: '03',
    icon: '🏆',
    title: 'Show Up & Play',
    description: 'Arrive at Gen Z Gaming Cafe, grab a snack, and start your gaming session. GG!',
    color: 'neon-green',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-container relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.02] to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title gradient-text">How It Works</h2>
        <p className="section-subtitle">
          Booking your gaming session is as easy as 1-2-3.
        </p>
      </motion.div>

      <div className="relative max-w-4xl mx-auto">
        {/* Connection line */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-blue/20 via-neon-pink/20 to-neon-green/20 hidden lg:block -translate-y-1/2" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative text-center"
            >
              <div className="glass-card p-8 relative z-10 group hover:border-card-border transition-all duration-300">
                {/* Step number */}
                <div className={`font-heading text-5xl font-bold mb-4 opacity-10 neon-text-${step.color.replace('neon-', '')}`}>
                  {step.number}
                </div>

                {/* Icon */}
                <motion.div
                  className="text-5xl mb-4"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {step.icon}
                </motion.div>

                <h3 className="font-heading font-bold text-xl mb-3 text-white">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>

              {/* Arrow between steps (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20 text-gray-600">
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
