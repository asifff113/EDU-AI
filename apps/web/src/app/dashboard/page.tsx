'use client';

import { useAppContext } from '@/contexts/AppContext';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { QASolverDashboard } from '@/components/dashboard/QASolverDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export default function DashboardPage() {
  const { user } = useAppContext();

  // Determine which dashboard to show based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard userName={user.name} />;
      case 'teacher':
        return <TeacherDashboard userName={user.name} />;
      case 'qa_solver':
        return <QASolverDashboard userName={user.name} />;
      case 'student':
      default:
        return <StudentDashboard userName={user.name} />;
    }
  };

  return renderDashboard();
}
