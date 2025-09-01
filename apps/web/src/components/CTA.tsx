'use client';
import { motion } from 'framer-motion';

export function CTA() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.25),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(124,58,237,0.25),transparent_35%)]" />
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-5xl mx-auto px-6 py-10 rounded-2xl border border-white/10 bg-white/5 text-center"
      >
        <h3 className="text-2xl sm:text-3xl font-bold">Ready to build the future of learning?</h3>
        <p className="mt-3 text-white/70 max-w-2xl mx-auto">
          Get early access to beta features, priority support, and custom AI curriculum tooling.
        </p>
        <a
          href="#contact"
          className="inline-block mt-6 px-6 py-3 rounded-md bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-semibold shadow-lg shadow-fuchsia-500/25"
        >
          Request access
        </a>
      </motion.div>
    </section>
  );
}
