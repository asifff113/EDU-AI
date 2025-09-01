'use client';
import { ContactForm } from '@/components/ContactForm';

export default function ContactFormSection() {
  return (
    <section id="contact" className="py-16 w-full">
      <h2 className="text-center text-3xl font-bold mb-6 bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
        Get early access
      </h2>
      <ContactForm />
    </section>
  );
}
