import { createBrowserRouter } from 'react-router-dom'

import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import HomePage from '../pages/HomePage'
import ProjectManagementPage from '../pages/ProjectManagementPage'
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
          {
            element: <ProtectedRoute roles={['manager']} />,
            children: [{ path: '/projects', element: <ProjectManagementPage /> }],
          },
        ],
      },
    ],
  },
])
