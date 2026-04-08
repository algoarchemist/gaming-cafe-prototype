'use client';

import { motion } from 'framer-motion';

const stations = [
  {
    type: 'ps5',
    name: 'PlayStation 5',
    count: 2,
    icon: '🎮',
    color: 'neon-blue',
    specs: [
      '4K Ultra HD Gaming',
      'DualSense Haptic Controllers',
      '120fps Support',
      'Latest AAA Titles',
    ],
    price: '₹100/hr',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'hover:border-neon-blue/40',
    shadowColor: 'hover:shadow-neon-blue',
  },
  {
    type: 'ps4',
    name: 'PlayStation 4',
    count: 2,
    icon: '🕹️',
    color: 'neon-pink',
    specs: [
      'Massive Game Library',
      'DualShock 4 Controllers',
      '1080p Gaming',
      'Classic & Modern Titles',
    ],
    price: '₹80/hr',
    gradient: 'from-pink-500/20 to-rose-500/20',
    borderColor: 'hover:border-neon-pink/40',
    shadowColor: 'hover:shadow-neon-pink',
  },
  {
    type: 'pc',
    name: 'Gaming PC',
    count: 15,
    icon: '🖥️',
    color: 'neon-green',
    specs: [
      'High-End GPUs',
      'Mechanical Keyboards',
      'Gaming Mouse & Headset',
      'Steam & Epic Library',
    ],
    price: '₹80/hr',
    gradient: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'hover:border-neon-green/40',
    shadowColor: 'hover:shadow-neon-green',
  },
  {
    type: 'sim',
    name: 'Sim Wheel Setup',
    count: 1,
    icon: '🏎️',
    color: 'neon-purple',
    specs: [
      'Force Feedback Wheel',
      'Pedal Set & Shifter',
      'Racing Seat',
      'Assetto Corsa & More',
    ],
    price: '₹100/30min',
    gradient: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'hover:border-neon-purple/40',
    shadowColor: 'hover:shadow-neon-purple',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function StationShowcase() {
  return (
    <section id="stations" className="section-container relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title gradient-text">Our Battle Stations</h2>
        <p className="section-subtitle">
          Choose your weapon. From next-gen consoles to high-end PCs and immersive sim racing.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {stations.map((station) => (
          <motion.div
            key={station.type}
            variants={cardVariants}
            className={`glass-card-hover p-6 ${station.borderColor} ${station.shadowColor}`}
          >
            {/* Gradient background accent */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${station.gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl`}
            />

            <div className="relative z-10">
              <div className="text-5xl mb-4">{station.icon}</div>
              <h3 className={`font-heading font-bold text-xl mb-1 neon-text-${station.color.replace('neon-', '')}`}>
                {station.name}
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-500">×{station.count} available</span>
                <span className="text-gray-700">•</span>
                <span className={`text-sm font-semibold text-${station.color}`}>{station.price}</span>
              </div>

              <ul className="space-y-2">
                {station.specs.map((spec, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <span className={`text-${station.color} text-xs`}>▸</span>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
