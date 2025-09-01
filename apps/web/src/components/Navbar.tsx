'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Menu, Triangle, BookOpen, Users, Trophy, Zap, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function Navbar() {
  const [featuresOpen, setFeaturesOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full sticky top-0 z-50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20 border-b border-white/10 shadow-lg shadow-black/5"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Triangle className="w-8 h-8 text-fuchsia-400 drop-shadow-[0_0_12px_rgba(232,121,249,0.5)]" />
          <div className="font-extrabold tracking-tight text-2xl bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent uppercase">
            EDU AI
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {/* Features Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFeaturesOpen(!featuresOpen)}
              className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
              suppressHydrationWarning
            >
              Features
              <ChevronDown
                className={`w-4 h-4 transition-transform ${featuresOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {featuresOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 left-0 w-64 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 p-2"
              >
                <Link
                  href="#ai-learning"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white">AI Learning</div>
                    <div className="text-xs text-white/60">Personalized AI tutoring</div>
                  </div>
                </Link>
                <Link
                  href="#courses"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Courses</div>
                    <div className="text-xs text-white/60">10,000+ courses available</div>
                  </div>
                </Link>
                <Link
                  href="#community"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Community</div>
                    <div className="text-xs text-white/60">Learn with peers</div>
                  </div>
                </Link>
                <Link
                  href="#gamification"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Gamification</div>
                    <div className="text-xs text-white/60">Earn rewards & compete</div>
                  </div>
                </Link>
              </motion.div>
            )}
          </div>

          <Link
            href="#pricing"
            className="text-white/80 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
          >
            Pricing
          </Link>
          <Link
            href="#about"
            className="text-white/80 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
          >
            About Us
          </Link>
          <Link
            href="#testimonials"
            className="text-white/80 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
          >
            Success Stories
          </Link>
          <Link
            href="#contact"
            className="text-white/80 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
          >
            Contact
          </Link>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            asChild
            className="relative bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-600 hover:to-violet-600 shadow-lg shadow-fuchsia-500/25 ring-1 ring-white/20 transform hover:-translate-y-0.5 transition-all"
          >
            <Link href="/register">
              <span className="relative z-10">Get Started Free</span>
              <span className="absolute inset-0 rounded-md bg-gradient-to-t from-white/0 to-white/20 opacity-50" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden">
          <MobileAuthMenu />
        </div>
      </div>
    </motion.nav>
  );
}

// Mobile menu for unauthenticated users
function MobileAuthMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[320px] bg-black/95 backdrop-blur-xl border-l border-white/10"
      >
        <div className="flex flex-col gap-6 pt-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Triangle className="w-6 h-6 text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.5)]" />
            <div className="font-extrabold tracking-tight text-xl bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent uppercase">
              EDU AI
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <div className="text-xs text-white/50 uppercase tracking-wider mb-2">Features</div>
            <Link
              href="#ai-learning"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Zap className="w-4 h-4 text-fuchsia-400" />
              <span className="text-white/80">AI Learning</span>
            </Link>
            <Link
              href="#courses"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="text-white/80">Courses</span>
            </Link>
            <Link
              href="#community"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="text-white/80">Community</span>
            </Link>
            <Link
              href="#gamification"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Trophy className="w-4 h-4 text-orange-400" />
              <span className="text-white/80">Gamification</span>
            </Link>
          </nav>

          <div className="border-t border-white/10 pt-4">
            <nav className="flex flex-col gap-2">
              <Link
                href="#pricing"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#about"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
              >
                About Us
              </Link>
              <Link
                href="#testimonials"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
              >
                Success Stories
              </Link>
              <Link
                href="#contact"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Auth Buttons */}
          <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
            <Button
              asChild
              variant="outline"
              className="justify-center border-white/20 text-white hover:bg-white/10"
            >
              <Link href="/login" onClick={() => setOpen(false)}>
                Login
              </Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-600 hover:to-violet-600 justify-center shadow-lg shadow-fuchsia-500/25"
            >
              <Link href="/register" onClick={() => setOpen(false)}>
                Get Started Free
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
