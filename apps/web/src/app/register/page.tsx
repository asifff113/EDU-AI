'use client';

import { useState } from 'react';
import { getApiBaseUrl } from '@/lib/env';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    phone: '',
    nationality: '',
    role: 'STUDENT',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const base = getApiBaseUrl();
      const response = await fetch(`${base}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username || undefined,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          age: formData.age ? parseInt(formData.age) : undefined,
          phone: formData.phone || undefined,
          nationality: formData.nationality || undefined,
          role: formData.role,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        // Registration successful, redirect to login
        window.location.href = '/login?message=Registration successful! Please log in.';
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 w-full">
      <h1 className="text-5xl font-extrabold mb-8 bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
        Sign Up
      </h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
            placeholder="First Name *"
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
          <input
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
            placeholder="Last Name *"
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>

        <input
          className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
          placeholder="Username (optional)"
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />

        <input
          className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
          placeholder="Email *"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        {/* Password Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
            placeholder="Password *"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <input
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
            placeholder="Confirm Password *"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
            placeholder="Age (optional)"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          />
          <input
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
            placeholder="Phone (optional)"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white"
            value={formData.nationality}
            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
          >
            <option value="" className="bg-slate-800 text-white">
              Select Nationality (optional)
            </option>
            <option value="Afghanistan" className="bg-slate-800 text-white">
              Afghanistan
            </option>
            <option value="Albania" className="bg-slate-800 text-white">
              Albania
            </option>
            <option value="Algeria" className="bg-slate-800 text-white">
              Algeria
            </option>
            <option value="Argentina" className="bg-slate-800 text-white">
              Argentina
            </option>
            <option value="Armenia" className="bg-slate-800 text-white">
              Armenia
            </option>
            <option value="Australia" className="bg-slate-800 text-white">
              Australia
            </option>
            <option value="Austria" className="bg-slate-800 text-white">
              Austria
            </option>
            <option value="Azerbaijan" className="bg-slate-800 text-white">
              Azerbaijan
            </option>
            <option value="Bahrain" className="bg-slate-800 text-white">
              Bahrain
            </option>
            <option value="Bangladesh" className="bg-slate-800 text-white">
              Bangladesh
            </option>
            <option value="Belarus" className="bg-slate-800 text-white">
              Belarus
            </option>
            <option value="Belgium" className="bg-slate-800 text-white">
              Belgium
            </option>
            <option value="Bolivia" className="bg-slate-800 text-white">
              Bolivia
            </option>
            <option value="Brazil" className="bg-slate-800 text-white">
              Brazil
            </option>
            <option value="Bulgaria" className="bg-slate-800 text-white">
              Bulgaria
            </option>
            <option value="Cambodia" className="bg-slate-800 text-white">
              Cambodia
            </option>
            <option value="Canada" className="bg-slate-800 text-white">
              Canada
            </option>
            <option value="Chile" className="bg-slate-800 text-white">
              Chile
            </option>
            <option value="China" className="bg-slate-800 text-white">
              China
            </option>
            <option value="Colombia" className="bg-slate-800 text-white">
              Colombia
            </option>
            <option value="Croatia" className="bg-slate-800 text-white">
              Croatia
            </option>
            <option value="Czech Republic" className="bg-slate-800 text-white">
              Czech Republic
            </option>
            <option value="Denmark" className="bg-slate-800 text-white">
              Denmark
            </option>
            <option value="Ecuador" className="bg-slate-800 text-white">
              Ecuador
            </option>
            <option value="Egypt" className="bg-slate-800 text-white">
              Egypt
            </option>
            <option value="Estonia" className="bg-slate-800 text-white">
              Estonia
            </option>
            <option value="Finland" className="bg-slate-800 text-white">
              Finland
            </option>
            <option value="France" className="bg-slate-800 text-white">
              France
            </option>
            <option value="Georgia" className="bg-slate-800 text-white">
              Georgia
            </option>
            <option value="Germany" className="bg-slate-800 text-white">
              Germany
            </option>
            <option value="Ghana" className="bg-slate-800 text-white">
              Ghana
            </option>
            <option value="Greece" className="bg-slate-800 text-white">
              Greece
            </option>
            <option value="Hungary" className="bg-slate-800 text-white">
              Hungary
            </option>
            <option value="Iceland" className="bg-slate-800 text-white">
              Iceland
            </option>
            <option value="India" className="bg-slate-800 text-white">
              India
            </option>
            <option value="Indonesia" className="bg-slate-800 text-white">
              Indonesia
            </option>
            <option value="Iran" className="bg-slate-800 text-white">
              Iran
            </option>
            <option value="Iraq" className="bg-slate-800 text-white">
              Iraq
            </option>
            <option value="Ireland" className="bg-slate-800 text-white">
              Ireland
            </option>
            <option value="Israel" className="bg-slate-800 text-white">
              Israel
            </option>
            <option value="Italy" className="bg-slate-800 text-white">
              Italy
            </option>
            <option value="Japan" className="bg-slate-800 text-white">
              Japan
            </option>
            <option value="Jordan" className="bg-slate-800 text-white">
              Jordan
            </option>
            <option value="Kazakhstan" className="bg-slate-800 text-white">
              Kazakhstan
            </option>
            <option value="Kenya" className="bg-slate-800 text-white">
              Kenya
            </option>
            <option value="Kuwait" className="bg-slate-800 text-white">
              Kuwait
            </option>
            <option value="Latvia" className="bg-slate-800 text-white">
              Latvia
            </option>
            <option value="Lebanon" className="bg-slate-800 text-white">
              Lebanon
            </option>
            <option value="Lithuania" className="bg-slate-800 text-white">
              Lithuania
            </option>
            <option value="Malaysia" className="bg-slate-800 text-white">
              Malaysia
            </option>
            <option value="Mexico" className="bg-slate-800 text-white">
              Mexico
            </option>
            <option value="Morocco" className="bg-slate-800 text-white">
              Morocco
            </option>
            <option value="Netherlands" className="bg-slate-800 text-white">
              Netherlands
            </option>
            <option value="New Zealand" className="bg-slate-800 text-white">
              New Zealand
            </option>
            <option value="Nigeria" className="bg-slate-800 text-white">
              Nigeria
            </option>
            <option value="Norway" className="bg-slate-800 text-white">
              Norway
            </option>
            <option value="Pakistan" className="bg-slate-800 text-white">
              Pakistan
            </option>
            <option value="Peru" className="bg-slate-800 text-white">
              Peru
            </option>
            <option value="Philippines" className="bg-slate-800 text-white">
              Philippines
            </option>
            <option value="Poland" className="bg-slate-800 text-white">
              Poland
            </option>
            <option value="Portugal" className="bg-slate-800 text-white">
              Portugal
            </option>
            <option value="Qatar" className="bg-slate-800 text-white">
              Qatar
            </option>
            <option value="Romania" className="bg-slate-800 text-white">
              Romania
            </option>
            <option value="Russia" className="bg-slate-800 text-white">
              Russia
            </option>
            <option value="Saudi Arabia" className="bg-slate-800 text-white">
              Saudi Arabia
            </option>
            <option value="Singapore" className="bg-slate-800 text-white">
              Singapore
            </option>
            <option value="Slovakia" className="bg-slate-800 text-white">
              Slovakia
            </option>
            <option value="Slovenia" className="bg-slate-800 text-white">
              Slovenia
            </option>
            <option value="South Africa" className="bg-slate-800 text-white">
              South Africa
            </option>
            <option value="South Korea" className="bg-slate-800 text-white">
              South Korea
            </option>
            <option value="Spain" className="bg-slate-800 text-white">
              Spain
            </option>
            <option value="Sri Lanka" className="bg-slate-800 text-white">
              Sri Lanka
            </option>
            <option value="Sweden" className="bg-slate-800 text-white">
              Sweden
            </option>
            <option value="Switzerland" className="bg-slate-800 text-white">
              Switzerland
            </option>
            <option value="Thailand" className="bg-slate-800 text-white">
              Thailand
            </option>
            <option value="Turkey" className="bg-slate-800 text-white">
              Turkey
            </option>
            <option value="Ukraine" className="bg-slate-800 text-white">
              Ukraine
            </option>
            <option value="United Arab Emirates" className="bg-slate-800 text-white">
              United Arab Emirates
            </option>
            <option value="United Kingdom" className="bg-slate-800 text-white">
              United Kingdom
            </option>
            <option value="United States" className="bg-slate-800 text-white">
              United States
            </option>
            <option value="Uruguay" className="bg-slate-800 text-white">
              Uruguay
            </option>
            <option value="Venezuela" className="bg-slate-800 text-white">
              Venezuela
            </option>
            <option value="Vietnam" className="bg-slate-800 text-white">
              Vietnam
            </option>
            <option value="Other" className="bg-slate-800 text-white">
              Other
            </option>
          </select>
          <select
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="STUDENT" className="bg-slate-800 text-white">
              Student
            </option>
            <option value="INSTRUCTOR" className="bg-slate-800 text-white">
              Instructor
            </option>
            <option value="PARENT" className="bg-slate-800 text-white">
              Parent
            </option>
            <option value="QA_SOLVER" className="bg-slate-800 text-white">
              QA Solver
            </option>
            <option value="ADMIN" className="bg-slate-800 text-white">
              Admin
            </option>
          </select>
        </div>

        {error && <div className="text-red-400 mt-2">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md px-4 py-3 bg-gradient-to-r from-fuchsia-500 via-violet-400 to-cyan-400 text-white text-lg font-semibold"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className="text-center mt-4">
          <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
            Already have an account? Sign in
          </Link>
        </div>

        <div className="text-center mt-2">
          <span className="text-xs text-white/50">
            <span className="text-red-400">*</span> Required fields
          </span>
        </div>
      </form>
    </div>
  );
}
