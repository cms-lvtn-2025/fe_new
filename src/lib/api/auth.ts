/**
 * Check if token is expired or will expire soon (within 1 minute)
 */
function isTokenExpiringSoon(): boolean {
  if (typeof window === 'undefined') return true

  const expiresAt = localStorage.getItem('tokenExpiresAt')
  if (!expiresAt) return true

  const expiryTime = parseInt(expiresAt)
  const now = Date.now()
  const timeUntilExpiry = expiryTime - now

  // Refresh if token expires in less than 1 minute (60000ms)
  return timeUntilExpiry < 60000
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null

  try {
    const refreshToken = localStorage.getItem('refreshToken')

    if (!refreshToken) {
      console.warn('No refresh token available')
      return null
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    })

    if (response.status === 401) {
      // Refresh token expired, need to login again
      console.warn('Refresh token expired, redirecting to login')
      localStorage.clear()
      window.location.href = '/login'
      return null
    }

    const data = await response.json()

    if (data.success && data.data) {
      // Save new tokens
      const { access_token, expires_in } = data.data
      localStorage.setItem('accessToken', access_token)

      // Calculate and save expiry time
      const expiresAt = Date.now() + (expires_in * 1000)
      localStorage.setItem('tokenExpiresAt', expiresAt.toString())

      console.log('Token refreshed successfully')
      return access_token
    }

    return null
  } catch (error) {
    console.error('Error refreshing token:', error)
    return null
  }
}

/**
 * Get valid access token from localStorage
 * Auto refresh if token is expired or expiring soon
 */
export async function getValidAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const token = localStorage.getItem('accessToken')

    if (!token) {
      return null
    }

    // Check if token is expiring soon
    if (isTokenExpiringSoon()) {
      console.log('Token expiring soon, refreshing...')
      const newToken = await refreshAccessToken()
      return newToken || token
    }

    return token
  } catch (error) {
    console.error('Error getting access token:', error)
    return null
  }
}

/**
 * Save access token and calculate expiry time
 */
export function saveAccessToken(token: string, expiresIn?: number): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token)

    if (expiresIn) {
      const expiresAt = Date.now() + (expiresIn * 1000)
      localStorage.setItem('tokenExpiresAt', expiresAt.toString())
    }
  }
}

/**
 * Remove access token from localStorage
 */
export function removeAccessToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('tokenExpiresAt')
  }
}

/**
 * Setup auto token refresh interval
 * Refreshes token every 10 minutes to ensure it's always valid
 */
export function setupTokenRefresh(): NodeJS.Timeout | null {
  if (typeof window === 'undefined') return null

  // Refresh every 10 minutes (600000ms)
  const interval = setInterval(async () => {
    const token = localStorage.getItem('accessToken')
    if (token && isTokenExpiringSoon()) {
      console.log('Auto-refreshing token...')
      await refreshAccessToken()
    }
  }, 600000) // 10 minutes

  return interval
}

/**
 * Clear token refresh interval
 */
export function clearTokenRefresh(interval: NodeJS.Timeout | null): void {
  if (interval) {
    clearInterval(interval)
  }
}
