'use client';
import { motion } from 'framer-motion';
import { Lightbulb, Target, Heart, Shield } from 'lucide-react';

const values = [
  {
    icon: Lightbulb,
    title: 'Innovation First',
    description: 'Pioneering AI-driven education with cutting-edge technology',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Target,
    title: 'Student Success',
    description: 'Personalized learning paths that adapt to your unique needs',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Heart,
    title: 'Community Driven',
    description: 'Building a global network of learners and educators',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Shield,
    title: 'Trust & Safety',
    description: 'Your data and learning journey are always secure',
    gradient: 'from-green-500 to-emerald-500',
  },
];

export function AboutSection() {
  return (
    <section id="about" className="relative py-20 bg-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                Revolutionizing Education
              </span>
              <br />
              <span className="text-white">Since 2020</span>
            </h2>
            <p className="text-lg text-white/70 mb-6">
              EDU AI was founded with a simple mission: to make quality education accessible to
              everyone, everywhere. We believe that learning should be personalized, engaging, and
              effective.
            </p>
            <p className="text-lg text-white/70 mb-8">
              Our AI-powered platform combines the best of technology and pedagogy to create
              learning experiences that adapt to each student's unique needs, pace, and learning
              style.
            </p>

            {/* Mission Statement */}
            <div className="relative rounded-2xl bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 border border-white/10 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Our Mission</h3>
              <p className="text-white/80 italic">
                "To democratize education through AI, making world-class learning experiences
                available to every person on the planet, regardless of their background or
                location."
              </p>
            </div>
          </motion.div>

          {/* Right Content - Values */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="relative rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:border-white/20 transition-all">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${value.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                    <p className="text-sm text-white/60">{value.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Team Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-white mb-1">200+</div>
            <p className="text-white/60">Team Members</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">50+</div>
            <p className="text-white/60">AI Engineers</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">1000+</div>
            <p className="text-white/60">Expert Instructors</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">15</div>
            <p className="text-white/60">Global Offices</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
