'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, Input, Alert } from '@/components/common'

type Role = 'student' | 'teacher'

export default function LoginPage() {
  const [role, setRole] = useState<Role>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // TODO: Implement email/password login API call
      console.log('Login with:', { email, password, role })

      // Placeholder - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setError('Email/password login chưa được triển khai')
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      // Get Google OAuth URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/google/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success && data.data.auth_url) {
        // Save role to localStorage to use in callback
        localStorage.setItem('loginRole', role)
        // Redirect to Google OAuth
        window.location.href = data.data.auth_url
      } else {
        setError('Không thể lấy URL đăng nhập Google')
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập Google thất bại')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              BK
            </div>
            <span className="font-bold text-xl text-gray-800 dark:text-gray-100">HCMUT Thesis</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Đăng nhập
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Chào mừng bạn trở lại
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Đăng nhập với vai trò
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  role === 'student'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                } cursor-pointer`}
              >
                <div className="text-2xl mb-1">🎓</div>
                <div className="font-medium">Sinh viên</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  role === 'teacher'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                } cursor-pointer`}
              >
                <div className="text-2xl mb-1">👨‍🏫</div>
                <div className="font-medium">Giảng viên</div>
              </button>
            </div>
          </div>

          {error && (
            <Alert type="error" message={error} dismissible onClose={() => setError('')} />
          )}

          {/* Google Login */}
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            loading={loading}
            variant="outline"
            className="w-full mb-4 border-gray-300 dark:border-gray-600"
            size="lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Đăng nhập với Google
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Hoặc đăng nhập với email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@hcmut.edu.vn"
              required
              disabled={loading}
            />

            <Input
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Ghi nhớ đăng nhập</span>
              </label>
              <Link href="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full"
              size="lg"
            >
              Đăng nhập
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  )
}
