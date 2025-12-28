'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loading, Alert } from '@/components/common'
import { saveAccessToken, saveRefreshToken, saveUserRole, saveUserRoles, saveCurrentSemester } from '@/lib/api/auth'
import { apolloClient } from '@/lib/graphql/client'
import { GET_MY_TEACHER_PROFILE } from '@/lib/graphql/queries/teacher'

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
          console.log('[Login] Login successful, saving tokens...')

          // Save tokens to localStorage AND cookies
          saveAccessToken(data.data.access_token, data.data.expires_in)
          saveRefreshToken(data.data.refresh_token)
          saveUserRole(role) // Keep for backward compatibility

          console.log('[Login] Tokens saved. Role:', role)
          console.log('[Login] Cookies after token save:', document.cookie)

          // Save additional data to localStorage only
          localStorage.setItem('expiresIn', data.data.expires_in.toString())

          // Save user info
          if (data.data.google_user) {
            localStorage.setItem('userInfo', JSON.stringify(data.data.google_user))
          }

          // Fetch user profile to get all roles (for teacher/department roles)
          try {
            if (role === 'teacher' || role === 'department') {
              console.log('[Login] Fetching user profile with roles...')

              // Pass token directly to query context to avoid localStorage race condition
              const profileResult = await apolloClient.query({
                query: GET_MY_TEACHER_PROFILE,
                fetchPolicy: 'network-only',
                context: {
                  headers: {
                    authorization: `Bearer ${data.data.access_token}`,
                  },
                },
              })

              console.log('[Login] Profile result:', profileResult.data)

              if ((profileResult.data as any)?.teacher?.me?.roles) {
                const roles = (profileResult.data as any).teacher.me.roles
                console.log('[Login] Found roles:', roles)
                console.log('[Login] Roles structure:', JSON.stringify(roles, null, 2))

                // Save all roles to localStorage
                saveUserRoles(roles)

                // Get current semester (or most recent if not set)
                let currentSemesterId = localStorage.getItem('currentSemesterId')

                // If no current semester, find the most recent active semester from roles
                if (!currentSemesterId && roles.length > 0) {
                  const activeSemesters = [...new Set(roles
                    .filter((r: any) => r.activate)
                    .map((r: any) => r.semesterCode))] as string[]

                  // Sort semesters descending (newest first)
                  activeSemesters.sort((a, b) => b.localeCompare(a))
                  currentSemesterId = activeSemesters[0] || roles[0].semesterCode
                }

                console.log('[Login] Current semester:', currentSemesterId)

                // Save current semester and update active roles cookie
                if (currentSemesterId) {
                  saveCurrentSemester(currentSemesterId)

                  // Verify cookie was set
                  console.log('[Login] Cookies after saveCurrentSemester:', document.cookie)
                }
              } else {
                console.warn('[Login] No roles found in profile')
              }
            }
          } catch (profileError) {
            console.error('[Login] Error fetching user profile:', profileError)
            // Continue with login even if profile fetch fails
            // In this case, only userRole (legacy) cookie will be set
          }

          // Clean up login role
          localStorage.removeItem('loginRole')

          // Determine redirect URL based on actual roles in current semester (if fetched)
          // Otherwise fallback to login role
          let redirectUrl = '/'

          if (role === 'teacher' || role === 'department') {
            // Check if we successfully fetched roles
            const currentSemesterId = localStorage.getItem('currentSemesterId')
            if (currentSemesterId) {
              const { getActiveRolesForSemester } = await import('@/lib/api/auth')
              const activeRoles = getActiveRolesForSemester(currentSemesterId)

              console.log('[Login] Active roles for redirect:', activeRoles)

              // Use the first active role for redirect
              if (activeRoles.length > 0) {
                const primaryRole = activeRoles[0]
                redirectUrl = primaryRole === 'teacher' ? '/teacher/topics' :
                             primaryRole === 'department' ? '/department/topics' :
                             primaryRole === 'admin' ? '/admin/users' :
                             primaryRole === 'student' ? '/student/thesis' : '/'
              } else {
                // Fallback to login role if no active roles found
                redirectUrl = role === 'teacher' ? '/teacher/topics' :
                             role === 'department' ? '/department/topics' : '/'
              }
            } else {
              // Fallback to login role
              redirectUrl = role === 'teacher' ? '/teacher/topics' :
                           role === 'department' ? '/department/topics' : '/'
            }
          } else {
            // For student/admin, use login role directly
            redirectUrl = role === 'student' ? '/student/thesis' :
                         role === 'admin' ? '/admin/users' : '/'
          }

          console.log('[Login] Redirecting to:', redirectUrl)

          // Wait a bit longer to ensure cookies are properly set
          setTimeout(() => {
            console.log('[Login] Final cookies before redirect:', document.cookie)
            router.push(redirectUrl)
          }, 1500)
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
