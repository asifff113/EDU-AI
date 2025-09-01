'use client';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Rocket, BookOpen, Users, Trophy, Zap, Shield, Globe } from 'lucide-react';

const cards = [
  {
    icon: Brain,
    title: 'AI‑Guided Learning',
    body: 'Adaptive pathways and realtime feedback tailored to each learner.',
    gradient: 'from-fuchsia-500 to-violet-500',
  },
  {
    icon: Sparkles,
    title: 'Immersive UI',
    body: '3D visuals, fluid motion, and delightful micro‑interactions.',
    gradient: 'from-cyan-400 to-blue-500',
  },
  {
    icon: Rocket,
    title: 'Blazing Performance',
    body: 'Optimized rendering pipelines and smart caching for speed.',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    icon: BookOpen,
    title: 'Interactive Content',
    body: 'Rich multimedia lessons with hands-on coding exercises and simulations.',
    gradient: 'from-orange-400 to-red-500',
  },
  {
    icon: Users,
    title: 'Collaborative Learning',
    body: 'Real-time peer interaction and group projects in virtual classrooms.',
    gradient: 'from-purple-400 to-pink-500',
  },
  {
    icon: Trophy,
    title: 'Achievement System',
    body: 'Gamified progress tracking with badges, streaks, and leaderboards.',
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    body: 'Real-time code analysis and personalized improvement suggestions.',
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    icon: Shield,
    title: 'Secure Learning',
    body: 'Enterprise-grade security with privacy-first data handling.',
    gradient: 'from-green-400 to-emerald-500',
  },
  {
    icon: Globe,
    title: 'Global Access',
    body: 'Multi-language support and offline capabilities for worldwide reach.',
    gradient: 'from-teal-400 to-cyan-500',
  },
];

export function Features() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <h2 className="text-center text-3xl sm:text-4xl font-bold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent mb-4">
        Why Edu AI
      </h2>
      <p className="text-center text-white/70 text-lg mb-16 max-w-2xl mx-auto">
        Experience the future of education with our cutting-edge AI platform
      </p>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 perspective-1000">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.title}
              initial={{ y: 30, opacity: 0, rotateX: 15 }}
              whileInView={{ y: 0, opacity: 1, rotateX: 0 }}
              viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
              transition={{
                delay: i * 0.1,
                duration: 0.6,
                type: 'spring',
                stiffness: 100,
              }}
              whileHover={{
                y: -10,
                rotateX: 5,
                rotateY: 5,
                scale: 1.05,
                transition: { duration: 0.3 },
              }}
              className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-sm hover:border-white/20 transition-all duration-300 transform-gpu"
              style={{
                transformStyle: 'preserve-3d',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Glow effect */}
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r ${c.gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                style={{ zIndex: -1 }}
              />

              {/* Floating icon with 3D effect */}
              <motion.div
                whileHover={{
                  rotateY: 15,
                  rotateX: -10,
                  scale: 1.1,
                  transition: { duration: 0.3 },
                }}
                className={`relative w-16 h-16 rounded-xl bg-gradient-to-r ${c.gradient} flex items-center justify-center shadow-2xl mb-6 transform-gpu`}
                style={{
                  boxShadow:
                    '0 10px 25px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                }}
              >
                <Icon className="text-white drop-shadow-lg" size={28} />

                {/* Inner glow */}
                <div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${c.gradient} opacity-50 blur-sm`}
                  style={{ zIndex: -1 }}
                />
              </motion.div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/80 group-hover:bg-clip-text transition-all duration-300">
                {c.title}
              </h3>

              <p className="text-white/70 text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                {c.body}
              </p>

              {/* Subtle inner border */}
              <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />

              {/* Bottom accent line */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl`}
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
