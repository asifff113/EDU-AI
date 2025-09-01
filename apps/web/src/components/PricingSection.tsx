'use client';
import { motion } from 'framer-motion';
import { Check, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Access to 100+ free courses',
      'Basic AI tutor assistance',
      'Community forums access',
      'Progress tracking',
      'Mobile app access',
    ],
    cta: 'Start Learning',
    popular: false,
    gradient: 'from-gray-500 to-gray-600',
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For serious learners',
    features: [
      'Access to all 10,000+ courses',
      'Advanced AI tutor with voice',
      'Unlimited practice exercises',
      'Downloadable resources',
      'Priority support',
      'Certificates of completion',
      'Offline learning mode',
    ],
    cta: 'Go Pro',
    popular: true,
    gradient: 'from-fuchsia-500 to-violet-500',
  },
  {
    name: 'Team',
    price: '$49',
    period: '/user/month',
    description: 'For organizations',
    features: [
      'Everything in Pro',
      'Team management dashboard',
      'Custom learning paths',
      'Analytics & reporting',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SSO authentication',
    ],
    cta: 'Contact Sales',
    popular: false,
    gradient: 'from-cyan-500 to-blue-500',
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-20 bg-gradient-to-b from-black/95 to-black">
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
              Simple, Transparent Pricing
            </span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Choose the perfect plan for your learning journey. Upgrade or downgrade anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className={`relative group ${plan.popular ? 'md:-mt-8' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-sm font-medium shadow-lg">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div
                className={`relative rounded-2xl bg-white/5 backdrop-blur-sm border ${plan.popular ? 'border-fuchsia-500/50' : 'border-white/10'} p-8 h-full hover:border-white/20 transition-all`}
              >
                {/* Glow effect for popular plan */}
                {plan.popular && (
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-violet-500 rounded-2xl blur opacity-20" />
                )}

                <div className="relative">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-white/60 mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/60">{plan.period}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center mt-0.5 flex-shrink-0`}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-white/80 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    asChild
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-600 hover:to-violet-600 text-white shadow-lg'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <Link href={plan.name === 'Team' ? '/contact' : '/register'}>
                      {plan.cta}
                      {plan.popular && <Zap className="ml-2 w-4 h-4" />}
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-white/60 mb-4">
            All plans include a 30-day money-back guarantee. No questions asked.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-white/60">
              <Check className="w-4 h-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Check className="w-4 h-4 text-green-400" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Check className="w-4 h-4 text-green-400" />
              <span>24/7 support</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
