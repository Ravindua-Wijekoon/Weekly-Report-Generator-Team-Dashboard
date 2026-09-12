import { createBrowserRouter } from 'react-router-dom'

import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import HomePage from '../pages/HomePage'
import MyReportPage from '../pages/MyReportPage'
import ReportHistoryPage from '../pages/ReportHistoryPage'
import ReportDetailPage from '../pages/ReportDetailPage'
import ProjectManagementPage from '../pages/ProjectManagementPage'
import TeamDashboardPage from '../pages/TeamDashboardPage'
import TeamMemberProfilePage from '../pages/TeamMemberProfilePage'
import UserManagementPage from '../pages/UserManagementPage'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import { AppShell } from '../components/layout/AppShell'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/reports/me', element: <MyReportPage /> },
          { path: '/reports/history', element: <ReportHistoryPage /> },
          { path: '/reports/:id', element: <ReportDetailPage /> },
          {
            element: <ProtectedRoute roles={['manager']} />,
            children: [
              { path: '/projects', element: <ProjectManagementPage /> },
              { path: '/dashboard', element: <TeamDashboardPage /> },
              { path: '/team/:userId', element: <TeamMemberProfilePage /> },
              { path: '/users', element: <UserManagementPage /> },
            ],
          },
        ],
      },
    ],
  },
])
