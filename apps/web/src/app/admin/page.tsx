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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">{t('pages.adminTitle')}</h1>
        <p className="text-muted-foreground">{t('pages.adminDesc')}</p>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>{stats?.users ?? '-'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Courses</CardTitle>
          </CardHeader>
          <CardContent>{stats?.courses ?? '-'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent>{stats?.resources ?? '-'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Groups</CardTitle>
          </CardHeader>
          <CardContent>{stats?.groups ?? '-'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Chats</CardTitle>
          </CardHeader>
          <CardContent>{stats?.conversations ?? '-'}</CardContent>
        </Card>
      </div>

      {/* Users */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
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
              className="w-[240px]"
            />
            <Button onClick={applyUserFilter}>Apply</Button>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-2">
                      {u.firstName ? `${u.firstName} ${u.lastName ?? ''}` : (u.username ?? '-')}
                    </td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2 capitalize">{u.role}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        {['student', 'teacher', 'qa_solver', 'admin'].map((r) => (
                          <Button
                            key={r}
                            size="sm"
                            variant={u.role === r ? 'default' : 'outline'}
                            disabled={savingRole === u.id}
                            onClick={() => setUserRole(u.id, r as any)}
                          >
                            {r}
                          </Button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
