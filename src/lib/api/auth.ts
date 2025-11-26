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
      clearAuthData()
      window.location.href = '/login'
      return null
    }

    const data = await response.json()

    if (data.success && data.data) {
      // Save new tokens
      const { access_token, expires_in } = data.data
      saveAccessToken(access_token, expires_in)

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
 * Set cookie helper function
 */
function setCookie(name: string, value: string, expiresInSeconds?: number): void {
  if (typeof window === 'undefined') return

  let cookieString = `${name}=${value}; path=/; SameSite=Lax`

  if (expiresInSeconds) {
    const expiryDate = new Date(Date.now() + expiresInSeconds * 1000)
    cookieString += `; expires=${expiryDate.toUTCString()}`
  }

  document.cookie = cookieString
}

/**
 * Remove cookie helper function
 */
function removeCookie(name: string): void {
  if (typeof window === 'undefined') return
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
}

/**
 * Save access token and calculate expiry time
 */
export function saveAccessToken(token: string, expiresIn?: number): void {
  if (typeof window !== 'undefined') {
    // Save to localStorage for backward compatibility
    localStorage.setItem('accessToken', token)

    // Save to cookie for middleware access
    setCookie('accessToken', token, expiresIn)

    if (expiresIn) {
      const expiresAt = Date.now() + (expiresIn * 1000)
      localStorage.setItem('tokenExpiresAt', expiresAt.toString())
    }
  }
}

/**
 * Save refresh token to both localStorage and cookie
 */
export function saveRefreshToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', token)
    // Refresh token typically has longer expiry (e.g., 30 days)
    setCookie('refreshToken', token, 30 * 24 * 60 * 60) // 30 days
  }
}

/**
 * Save user role to both localStorage and cookie (legacy - single role)
 */
export function saveUserRole(role: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userRole', role)
    // Role cookie should have long expiry
    setCookie('userRole', role, 30 * 24 * 60 * 60) // 30 days
  }
}

/**
 * Save all user roles to localStorage
 */
export function saveUserRoles(roles: Array<{
  id: string
  role: string
  semesterCode: string
  activate: boolean
}>): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userRoles', JSON.stringify(roles))
  }
}

/**
 * Map system role to login role
 * System roles from backend:
 * - ACADEMIC_AFFAIRS_STAFF -> admin (Giáo vụ - quản lý toàn hệ thống)
 * - DEPARTMENT_LECTURER -> department (Giảng viên bộ môn)
 * - TEACHER -> teacher (Giáo viên)
 * - REVIEWER, ADVISOR, COUNCIL_MEMBER -> teacher (additional teacher roles)
 */
function mapSystemRoleToLoginRole(systemRole: string): string {
  const roleMapping: Record<string, string> = {
    'ACADEMIC_AFFAIRS_STAFF': 'admin',
    'DEPARTMENT_LECTURER': 'department',
    'TEACHER': 'teacher',
    'REVIEWER': 'teacher',
    'ADVISOR': 'teacher',
    'COUNCIL_MEMBER': 'teacher',
  }

  return roleMapping[systemRole] || systemRole.toLowerCase()
}

/**
 * Get active roles for a specific semester
 */
export function getActiveRolesForSemester(semesterId: string): string[] {
  if (typeof window === 'undefined') return []

  try {
    const rolesData = localStorage.getItem('userRoles')
    if (!rolesData) {
      console.warn('[Auth] No userRoles in localStorage')
      return []
    }

    const roles = JSON.parse(rolesData)
    console.log('[Auth] All roles from localStorage:', roles)
    console.log('[Auth] Filtering for semester:', semesterId)

    const filteredRoles = roles.filter((r: any) => {
      const matches = r.semesterCode === semesterId && r.activate
      console.log(`[Auth] Role ${r.role} (${r.semesterCode}): activate=${r.activate}, matches=${matches}`)
      return matches
    })

    console.log('[Auth] Filtered roles:', filteredRoles)

    const activeRoles = filteredRoles.map((r: any) => {
      // Use 'role' field (system role) and map it to login role
      // Don't use 'title' field as it's just a display name in Vietnamese
      const systemRole = r.role
      const loginRole = mapSystemRoleToLoginRole(systemRole)
      console.log(`[Auth] Mapping ${systemRole} → ${loginRole}`)
      return loginRole
    })

    // Remove duplicates and return unique roles
    const uniqueRoles = [...new Set(activeRoles)] as string[]
    console.log('[Auth] Unique active roles:', uniqueRoles)
    return uniqueRoles
  } catch (error) {
    console.error('[Auth] Error getting active roles:', error)
    return []
  }
}

/**
 * Save current semester ID and update active roles cookie
 */
export function saveCurrentSemester(semesterId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentSemesterId', semesterId)

    // Update userRoles cookie with active roles for this semester
    const activeRoles = getActiveRolesForSemester(semesterId)
    console.log('[Auth] Active roles for semester', semesterId, ':', activeRoles)

    if (activeRoles.length > 0) {
      // Save as comma-separated string
      setCookie('userRoles', activeRoles.join(','), 30 * 24 * 60 * 60) // 30 days
      console.log('[Auth] Set userRoles cookie:', activeRoles.join(','))
    } else {
      console.warn('[Auth] No active roles found for semester', semesterId)
    }
  }
}

/**
 * Remove access token from localStorage and cookies
 */
export function removeAccessToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('tokenExpiresAt')
    removeCookie('accessToken')
  }
}

/**
 * Clear all auth data (tokens, role, etc.)
 */
export function clearAuthData(): void {
  if (typeof window !== 'undefined') {
    localStorage.clear()
    removeCookie('accessToken')
    removeCookie('refreshToken')
    removeCookie('userRole')
    removeCookie('userRoles')
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
