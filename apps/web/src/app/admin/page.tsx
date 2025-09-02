'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getApiBaseUrl } from '@/lib/env';
import { io } from 'socket.io-client';

type Stats = {
  users: number;
  courses: number;
  resources: number;
  groups: number;
  conversations: number;
};
type UserRow = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role: string;
  createdAt: string;
};

export default function AdminPage() {
  const { t } = useTranslation('common');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [q, setQ] = useState('');
  const [savingRole, setSavingRole] = useState<string>('');
  const [error, setError] = useState('');

  const base = getApiBaseUrl();

  useEffect(() => {
    load();
    const socket = io(`${base}/admin`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    socket.on('users:update', applyUserFilter);
    socket.on('courses:update', load);
    socket.on('resources:update', load);
    socket.on('settings:update', load);

    return () => {
      socket.disconnect();
    };
  }, []);

  const load = async () => {
    setError('');
    try {
      const [s, u] = await Promise.all([
        fetch(`${base}/admin/stats`, { credentials: 'include' }).then((r) => r.json()),
        fetch(`${base}/admin/users`, { credentials: 'include' }).then((r) => r.json()),
      ]);
      setStats(s);
      setUsers(u);
    } catch (e: any) {
      setError('Failed to load admin data');
    }
  };

  const applyUserFilter = async () => {
    const params = new URLSearchParams();
    if (roleFilter !== 'all') params.set('role', roleFilter);
    if (q) params.set('q', q);
    const res = await fetch(`${base}/admin/users?${params.toString()}`, { credentials: 'include' });
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  };

  const setUserRole = async (userId: string, role: string) => {
    setSavingRole(userId);
    try {
      const res = await fetch(`${base}/admin/users/role`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      if (res.ok) applyUserFilter();
    } finally {
      setSavingRole('');
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header - Amber/Rose/Indigo Card */}
      <div className="group perspective-1000">
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-600/20 via-rose-500/15 to-indigo-400/20 rounded-xl p-6 border border-amber-400/30 shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:rotate-1 hover:shadow-2xl hover:shadow-amber-500/25 transform-gpu">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
              {t('pages.adminTitle')}
            </h1>
            <p className="text-amber-200/80">{t('pages.adminDesc')}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards with Different Colors */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Users Card - Blue Theme */}
        <div className="group perspective-1000">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-indigo-400/15 to-purple-500/20 backdrop-blur-xl border border-blue-400/30 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl hover:shadow-blue-500/25 transform-gpu">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Users
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-blue-100">
              {stats?.users ?? '-'}
            </CardContent>
          </Card>
        </div>

        {/* Courses Card - Emerald Theme */}
        <div className="group perspective-1000">
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-green-400/15 to-teal-500/20 backdrop-blur-xl border border-emerald-400/30 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl hover:shadow-emerald-500/25 transform-gpu">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-emerald-100">
              {stats?.courses ?? '-'}
            </CardContent>
          </Card>
        </div>

        {/* Resources Card - Orange Theme */}
        <div className="group perspective-1000">
          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500/20 via-amber-400/15 to-yellow-500/20 backdrop-blur-xl border border-orange-400/30 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl hover:shadow-orange-500/25 transform-gpu">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"></div>
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-orange-100">
              {stats?.resources ?? '-'}
            </CardContent>
          </Card>
        </div>

        {/* Groups Card - Rose Theme */}
        <div className="group perspective-1000">
          <Card className="relative overflow-hidden bg-gradient-to-br from-rose-500/20 via-pink-400/15 to-red-500/20 backdrop-blur-xl border border-rose-400/30 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl hover:shadow-rose-500/25 transform-gpu">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-red-500"></div>
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                Groups
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-rose-100">
              {stats?.groups ?? '-'}
            </CardContent>
          </Card>
        </div>

        {/* Chats Card - Cyan Theme */}
        <div className="group perspective-1000">
          <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-500/20 via-sky-400/15 to-blue-500/20 backdrop-blur-xl border border-cyan-400/30 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl hover:shadow-cyan-500/25 transform-gpu">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500"></div>
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">
                Chats
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-cyan-100">
              {stats?.conversations ?? '-'}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Users Management Card - Violet/Purple Theme */}
      <div className="group perspective-1000">
        <Card className="relative overflow-hidden bg-gradient-to-br from-violet-500/20 via-purple-400/15 to-fuchsia-500/20 backdrop-blur-xl border border-violet-400/30 shadow-xl transition-all duration-500 hover:scale-[1.01] hover:-rotate-0.5 hover:shadow-2xl hover:shadow-violet-500/25 transform-gpu">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"></div>
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 relative">
            <div className="flex flex-wrap gap-2 items-center">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[160px] bg-violet-500/10 border-violet-400/30 focus:border-violet-400 text-violet-100">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="qa_solver">Q&A Solver</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search users..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-[240px] bg-violet-500/10 border-violet-400/30 focus:border-violet-400 text-violet-100 placeholder:text-violet-300/60"
              />
              <Button
                onClick={applyUserFilter}
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu"
              >
                Apply
              </Button>
            </div>

            <div className="overflow-auto bg-violet-500/5 rounded-lg border border-violet-400/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-violet-500/10">
                    <th className="p-3 text-violet-100 font-semibold">Name</th>
                    <th className="p-3 text-violet-100 font-semibold">Email</th>
                    <th className="p-3 text-violet-100 font-semibold">Role</th>
                    <th className="p-3 text-violet-100 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, index) => {
                    const rowColors = [
                      'hover:bg-blue-500/10 border-blue-400/20',
                      'hover:bg-emerald-500/10 border-emerald-400/20',
                      'hover:bg-orange-500/10 border-orange-400/20',
                      'hover:bg-rose-500/10 border-rose-400/20',
                      'hover:bg-cyan-500/10 border-cyan-400/20',
                    ];
                    const rowColor = rowColors[index % rowColors.length];

                    return (
                      <tr
                        key={u.id}
                        className={`border-t border-violet-400/20 transition-all duration-300 ${rowColor}`}
                      >
                        <td className="p-3 text-violet-100">
                          {u.firstName ? `${u.firstName} ${u.lastName ?? ''}` : (u.username ?? '-')}
                        </td>
                        <td className="p-3 text-violet-200">{u.email}</td>
                        <td className="p-3 capitalize">
                          <span className="px-2 py-1 rounded-full bg-violet-500/20 text-violet-200 text-xs font-medium">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1 flex-wrap">
                            {['student', 'teacher', 'qa_solver', 'admin'].map((r, roleIndex) => {
                              const roleColors = [
                                'from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
                                'from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600',
                                'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
                                'from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600',
                              ];
                              const roleColor = roleColors[roleIndex % roleColors.length];

                              return (
                                <Button
                                  key={r}
                                  size="sm"
                                  variant={u.role === r ? 'default' : 'outline'}
                                  disabled={savingRole === u.id}
                                  onClick={() => setUserRole(u.id, r as any)}
                                  className={
                                    u.role === r
                                      ? `bg-gradient-to-r ${roleColor} shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 transform-gpu text-white`
                                      : `border-violet-400/30 hover:bg-violet-500/20 text-violet-200 hover:text-violet-100 transition-all duration-300`
                                  }
                                >
                                  {r.replace('_', ' ')}
                                </Button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
