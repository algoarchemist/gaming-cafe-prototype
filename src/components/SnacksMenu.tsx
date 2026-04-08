'use client';

import { motion } from 'framer-motion';

const beverages = [
  { name: 'Monster Energy', emoji: '⚡', note: 'MRP' },
  { name: 'Red Bull', emoji: '🐂', note: 'MRP' },
  { name: 'Coca-Cola', emoji: '🥤', note: 'MRP' },
  { name: 'Pepsi', emoji: '🥤', note: 'MRP' },
  { name: 'Sprite', emoji: '🍋', note: 'MRP' },
];

const snacks = [
  { name: "Lay's Classic", emoji: '🥔', note: 'MRP' },
  { name: 'Assorted Chips', emoji: '🍿', note: 'MRP' },
  { name: 'Kurkure', emoji: '🌶️', note: 'MRP' },
  { name: 'Biscuits', emoji: '🍪', note: 'MRP' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

export default function SnacksMenu() {
  return (
    <section id="snacks" className="section-container relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title gradient-text">Fuel Up</h2>
        <p className="section-subtitle">
          Snacks &amp; beverages available at the counter during your session. All at MRP — no inflated prices.
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Beverages */}
        <div>
          <h3 className="font-heading text-lg font-semibold neon-text-blue mb-4 flex items-center gap-2">
            <span>🥤</span> Beverages
          </h3>
          <motion.div
            className="grid grid-cols-1 gap-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {beverages.map((item) => (
              <motion.div
                key={item.name}
                variants={itemVariants}
                className="glass-card-hover px-4 py-3 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-white font-medium">{item.name}</span>
                </div>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                  {item.note}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Snacks */}
        <div>
          <h3 className="font-heading text-lg font-semibold neon-text-pink mb-4 flex items-center gap-2">
            <span>🍿</span> Snacks
          </h3>
          <motion.div
            className="grid grid-cols-1 gap-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {snacks.map((item) => (
              <motion.div
                key={item.name}
                variants={itemVariants}
                className="glass-card-hover px-4 py-3 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-white font-medium">{item.name}</span>
                </div>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                  {item.note}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <motion.p
        className="text-center text-gray-500 text-sm mt-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        💡 Available at the counter during your session
      </motion.p>
    </section>
  );
}
