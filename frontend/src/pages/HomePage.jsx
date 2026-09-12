import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Welcome, {user?.name}</h1>
      <p className="mt-2 text-slate-500">Role: {user?.role}</p>
    </div>
  )
}
