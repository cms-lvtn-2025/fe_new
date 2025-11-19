'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loading, Alert } from '@/components/common'

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      // Get authorization code from URL
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const errorParam = searchParams.get('error')

      if (errorParam) {
        setError(`Đăng nhập thất bại: ${errorParam}`)
        setProcessing(false)
        return
      }

      if (!code) {
        setError('Không tìm thấy mã xác thực')
        setProcessing(false)
        return
      }

      try {
        // Get role from localStorage
        const role = localStorage.getItem('loginRole') || 'student'

        // Call callback API
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/google/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            state: state || undefined,
            role,
          }),
        })

        const data = await response.json()

        if (data.success && data.data) {
          // Save tokens to localStorage
          localStorage.setItem('accessToken', data.data.access_token)
          localStorage.setItem('refreshToken', data.data.refresh_token)
          localStorage.setItem('expiresIn', data.data.expires_in.toString())
          localStorage.setItem('userRole', role)

          // Calculate and save token expiry time
          const expiresAt = Date.now() + (data.data.expires_in * 1000)
          localStorage.setItem('tokenExpiresAt', expiresAt.toString())

          // Save user info
          if (data.data.google_user) {
            localStorage.setItem('userInfo', JSON.stringify(data.data.google_user))
          }

          // Clean up login role
          localStorage.removeItem('loginRole')

          // Redirect based on role
          const redirectUrl = role === 'student' ? '/student/dashboard' : '/teacher/dashboard'

          // Show success message briefly before redirect
          setTimeout(() => {
            router.push(redirectUrl)
          }, 1000)
        } else {
          setError(data.message || 'Đăng nhập thất bại')
          setProcessing(false)
        }
      } catch (err: any) {
        console.error('Callback error:', err)
        setError(err.message || 'Có lỗi xảy ra khi xử lý đăng nhập')
        setProcessing(false)
      }
    }

    handleCallback()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <Alert
              type="error"
              title="Lỗi đăng nhập"
              message={error}
              dismissible={false}
            />
            <button
              onClick={() => router.push('/login')}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Quay lại trang đăng nhập
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="text-center">
        <Loading size="lg" text="Đang xử lý đăng nhập..." fullScreen />
        <div className="mt-8">
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
              BK
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Vui lòng đợi...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginCallbackPage() {
  return (
    <Suspense fallback={<Loading size="lg" text="Đang tải..." fullScreen />}>
      <CallbackContent />
    </Suspense>
  )
}
