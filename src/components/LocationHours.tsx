'use client';

import { motion } from 'framer-motion';

export default function LocationHours() {
  return (
    <section id="location" className="section-container relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title gradient-text">Find Us</h2>
        <p className="section-subtitle">
          Located near SRM University, Ramapuram — your neighbourhood gaming hub.
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Map */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card overflow-hidden h-[350px] lg:h-auto"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.0!2d80.17!3d13.03!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDAyJzAwLjAiTiA4MMKwMTAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '350px' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Gen Z Gaming Cafe Location"
          />
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Address */}
          <div className="glass-card p-6">
            <h3 className="font-heading text-lg font-semibold neon-text-blue mb-3 flex items-center gap-2">
              📍 Address
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Gen Z Gaming Cafe<br />
              Arasamaram Junction, Valluvar Salai<br />
              Near SRM University, Gokulam Colony<br />
              Ramapuram, Chennai, Tamil Nadu 600089
            </p>
          </div>

          {/* Operating Hours */}
          <div className="glass-card p-6">
            <h3 className="font-heading text-lg font-semibold neon-text-green mb-3 flex items-center gap-2">
              🕐 Operating Hours
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-gray-300">
                <span>Monday – Sunday</span>
                <span className="font-heading font-semibold text-neon-green">10:00 AM – 11:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-gray-400 text-sm">
                <span>Open all 7 days</span>
                <span className="text-neon-pink">No holidays!</span>
              </div>
            </div>
          </div>

          {/* Walk-in note */}
          <div className="glass-card p-6 border-neon-pink/20">
            <h3 className="font-heading text-lg font-semibold neon-text-pink mb-3 flex items-center gap-2">
              💡 Walk-ins Welcome
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Walk-ins are welcome, but slots may be full during peak hours. 
              <span className="text-neon-blue font-semibold"> Book ahead </span> 
              to guarantee your spot!
            </p>
          </div>

          {/* Contact */}
          <div className="glass-card p-6">
            <h3 className="font-heading text-lg font-semibold neon-text-purple mb-3 flex items-center gap-2">
              📞 Contact
            </h3>
            <p className="text-gray-300">
              Follow us on Instagram for updates and offers!
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
