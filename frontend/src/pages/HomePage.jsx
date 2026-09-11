import { useAuth } from '../context/AuthContext'
import { Button } from '../components/common/Button'

export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-800">Welcome, {user?.name}</h1>
        <p className="mt-2 text-slate-500">Role: {user?.role}</p>
        <Button className="mt-6 px-4" onClick={() => logout()}>
          Log out
        </Button>
      </div>
    </div>
  )
}
