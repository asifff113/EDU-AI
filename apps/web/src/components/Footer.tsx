import { Mail, Linkedin, Github, Facebook, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/10 mt-auto w-full flex flex-col items-center justify-end py-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-4 w-full">
        <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent text-center">
          Made by ASIF
        </div>
        <div className="text-sm text-white/60 text-center">
          {new Date().getFullYear()} Edu AI • All rights reserved
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-xs text-white/70">
          <a
            className="inline-flex items-center gap-1 hover:text-white/90"
            href="mailto:asif@example.com"
          >
            <Mail className="w-3 h-3" /> asif@example.com
          </a>
          <a
            className="inline-flex items-center gap-1 hover:text-white/90"
            href="https://linkedin.com/in/asif"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Linkedin className="w-3 h-3" /> LinkedIn
          </a>
          <a
            className="inline-flex items-center gap-1 hover:text-white/90"
            href="https://github.com/asif"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Github className="w-3 h-3" /> GitHub
          </a>
          <a
            className="inline-flex items-center gap-1 hover:text-white/90"
            href="https://facebook.com/asif"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Facebook className="w-3 h-3" /> Facebook
          </a>
          <a
            className="inline-flex items-center gap-1 hover:text-white/90"
            href="https://instagram.com/asif"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Instagram className="w-3 h-3" /> Instagram
          </a>
        </div>
        <div className="text-sm text-white/60 flex flex-wrap justify-center gap-4">
          <a className="hover:text-white/80" href="/docs">
            Docs
          </a>
          <a className="hover:text-white/80" href="/privacy">
            Privacy
          </a>
          <a className="hover:text-white/80" href="/terms">
            Terms
          </a>
          <a className="hover:text-white/80" href="mailto:asif@example.com">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
