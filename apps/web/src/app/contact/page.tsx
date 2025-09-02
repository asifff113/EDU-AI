'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getApiBaseUrl } from '@/lib/env';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    planType: 'Team', // Default for team inquiries
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);

    try {
      const response = await fetch(`${getApiBaseUrl()}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: `Company: ${formData.company}\nPlan: ${formData.planType}\n\n${formData.message}`,
        }),
      });

      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      setStatus('success');
      setFormData({ name: '', email: '', company: '', message: '', planType: 'Team' });
    } catch (err: unknown) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Column - Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                Get in Touch
              </span>
            </h1>
            <p className="text-lg text-white/70 mb-8">
              Ready to transform your organization's learning experience? Let's discuss how EDU AI
              can help you achieve your educational goals.
            </p>

            {/* Contact Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Email Us</h3>
                  <p className="text-white/70">support@eduai.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Call Us</h3>
                  <p className="text-white/70">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Visit Us</h3>
                  <p className="text-white/70">
                    123 Innovation Drive
                    <br />
                    San Francisco, CA 94107
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Business Hours</h3>
                  <p className="text-white/70">Mon - Fri: 9:00 AM - 6:00 PM PST</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-2 gap-6">
              <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-bold text-fuchsia-400">24h</div>
                <div className="text-sm text-white/70">Response Time</div>
              </div>
              <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-bold text-cyan-400">500+</div>
                <div className="text-sm text-white/70">Organizations</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">Send us a message</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 transition-colors"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-white/80 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 transition-colors"
                  placeholder="Your organization name"
                />
              </div>

              <div>
                <label htmlFor="planType" className="block text-sm font-medium text-white/80 mb-2">
                  Interested Plan
                </label>
                <select
                  id="planType"
                  name="planType"
                  value={formData.planType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 transition-colors"
                >
                  <option value="Team" className="bg-black">
                    Team Plan
                  </option>
                  <option value="Enterprise" className="bg-black">
                    Enterprise Plan
                  </option>
                  <option value="Custom" className="bg-black">
                    Custom Solution
                  </option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 transition-colors resize-none"
                  placeholder="Tell us about your requirements..."
                />
              </div>

              <Button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-600 hover:to-violet-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-fuchsia-500/25 disabled:opacity-60 transition-all"
              >
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </Button>

              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-center"
                >
                  Thank you! We'll get back to you within 24 hours.
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-center"
                >
                  {error || 'Something went wrong. Please try again.'}
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-bold mb-8">
            <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="text-left p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white mb-3">How quickly can we get started?</h3>
              <p className="text-white/70">
                Most organizations can be up and running within 24-48 hours after setup
                consultation.
              </p>
            </div>
            <div className="text-left p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Do you offer custom integrations?</h3>
              <p className="text-white/70">
                Yes! We provide API access and custom integrations with your existing learning
                management systems.
              </p>
            </div>
            <div className="text-left p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white mb-3">What support do you provide?</h3>
              <p className="text-white/70">
                Team plans include dedicated account management, priority support, and training
                sessions.
              </p>
            </div>
            <div className="text-left p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Can we customize the platform?</h3>
              <p className="text-white/70">
                Absolutely! We offer white-labeling, custom branding, and tailored learning paths
                for your organization.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
