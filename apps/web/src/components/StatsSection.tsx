'use client';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Target, Zap } from 'lucide-react';

const stats = [
  {
    icon: TrendingUp,
    value: '94%',
    label: 'Completion Rate',
    description: 'Students complete their courses',
    gradient: 'from-fuchsia-500 to-violet-500',
  },
  {
    icon: Clock,
    value: '3x',
    label: 'Faster Learning',
    description: 'Than traditional methods',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Target,
    value: '89%',
    label: 'Career Success',
    description: 'Land their dream jobs',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Zap,
    value: '24/7',
    label: 'AI Support',
    description: 'Instant help anytime',
    gradient: 'from-orange-500 to-red-500',
  },
];

export function StatsSection() {
  return (
    <section id="stats" className="relative py-20 bg-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Proven Results
            </span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Our AI-powered platform delivers measurable outcomes for learners worldwide
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="relative group"
              >
                <div className="relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 text-center hover:border-white/20 transition-all">
                  {/* Glow effect */}
                  <div
                    className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
                  />

                  {/* Icon */}
                  <div
                    className={`relative w-16 h-16 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Value */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 200 }}
                    className="text-4xl font-bold text-white mb-2"
                  >
                    {stat.value}
                  </motion.div>

                  {/* Label */}
                  <h3 className="text-lg font-semibold text-white mb-2">{stat.label}</h3>

                  {/* Description */}
                  <p className="text-sm text-white/60">{stat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
