'use client';
import { motion } from 'framer-motion';
import {
  Code,
  Brain,
  Palette,
  Globe,
  Calculator,
  Stethoscope,
  Star,
  Clock,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const categories = [
  {
    icon: Code,
    name: 'Programming',
    courses: 2500,
    gradient: 'from-blue-500 to-indigo-500',
    popular: ['Python', 'JavaScript', 'React', 'AI/ML'],
  },
  {
    icon: Brain,
    name: 'Data Science',
    courses: 1200,
    gradient: 'from-purple-500 to-pink-500',
    popular: ['Machine Learning', 'Deep Learning', 'Statistics', 'Big Data'],
  },
  {
    icon: Palette,
    name: 'Design',
    courses: 1800,
    gradient: 'from-orange-500 to-red-500',
    popular: ['UI/UX', 'Figma', 'Web Design', '3D Design'],
  },
  {
    icon: Globe,
    name: 'Languages',
    courses: 900,
    gradient: 'from-emerald-500 to-teal-500',
    popular: ['English', 'Spanish', 'Mandarin', 'French'],
  },
  {
    icon: Calculator,
    name: 'Business',
    courses: 1500,
    gradient: 'from-yellow-500 to-orange-500',
    popular: ['Marketing', 'Finance', 'Leadership', 'Strategy'],
  },
  {
    icon: Stethoscope,
    name: 'Healthcare',
    courses: 800,
    gradient: 'from-green-500 to-emerald-500',
    popular: ['Nursing', 'Medicine', 'Public Health', 'Nutrition'],
  },
];

export function CoursesPreview() {
  return (
    <section id="courses" className="relative py-20 bg-gradient-to-b from-black to-black/95">
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
              Explore 10,000+ Courses
            </span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            From programming to arts, find expert-led courses in every field
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative"
              >
                <div className="relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:border-white/20 transition-all hover:transform hover:-translate-y-1">
                  {/* Glow effect */}
                  <div
                    className={`absolute -inset-0.5 bg-gradient-to-r ${category.gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                  />

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.gradient} flex items-center justify-center shadow-lg`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                          <p className="text-sm text-white/60">
                            {category.courses.toLocaleString()} courses
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Popular Topics */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {category.popular.map((topic) => (
                        <span
                          key={topic}
                          className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-white/60">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>4.8 avg rating</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/60">
                        <Users className="w-4 h-4" />
                        <span>50k+ students</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-600 hover:to-violet-600 text-white shadow-2xl shadow-fuchsia-500/25"
          >
            <Link href="/courses">Browse All Courses</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
