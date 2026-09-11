import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { FormField } from '../components/common/FormField'
import { Button } from '../components/common/Button'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) {
      nextErrors.name = 'Name is required'
    }
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = 'Enter a valid email'
    }
    if (!form.password) {
      nextErrors.password = 'Password is required'
    } else if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters'
    }
    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match'
    }
    return nextErrors
  }

  function updateField(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setServerError('')
    setIsSubmitting(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      navigate('/', { replace: true })
    } catch (error) {
      setServerError(error.response?.data?.error || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-4">Create an account</h1>

        {serverError && <p className="mb-4 text-sm text-danger">{serverError}</p>}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField
            label="Name"
            id="name"
            value={form.name}
            onChange={updateField('name')}
            error={errors.name}
          />
          <FormField
            label="Email"
            id="email"
            type="email"
            value={form.email}
            onChange={updateField('email')}
            error={errors.email}
          />
          <FormField
            label="Password"
            id="password"
            type="password"
            value={form.password}
            onChange={updateField('password')}
            error={errors.password}
          />
          <FormField
            label="Confirm password"
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={updateField('confirmPassword')}
            error={errors.confirmPassword}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-500 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
