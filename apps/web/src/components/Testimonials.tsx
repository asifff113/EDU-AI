'use client';
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote:
      'Edu AI helped our team ship a data course 3x faster with gorgeous visuals and realtime feedback.',
    author: 'Ava Martinez',
    role: 'Curriculum Lead, NeoLearn',
  },
  {
    quote: 'The immersive UI and performance are unmatched. Our learners are truly engaged.',
    author: 'Liam Chen',
    role: 'Head of Product, Orbit Academy',
  },
  {
    quote: 'Setup was a breeze and the results are stunning. Edu AI feels like the future.',
    author: 'Sofia Ibrahim',
    role: 'Founder, Horizon Bootcamp',
  },
];

export function Testimonials() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-20">
      <h2 className="text-center text-3xl sm:text-4xl font-bold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
        Loved by educators
      </h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.blockquote
            key={t.author}
            initial={{ y: 10, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-20% 0px -20% 0px' }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]"
          >
            <p className="text-white/90">“{t.quote}”</p>
            <footer className="mt-4 text-sm text-white/60">
              <span className="font-medium text-white/80">{t.author}</span> — {t.role}
            </footer>
          </motion.blockquote>
        ))}
      </div>
    </section>
  );
}
