import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define route patterns for different roles
const ROLE_ROUTES = {
  student: /^\/student/,
  teacher: /^\/teacher/,
  admin: /^\/admin/,
  department: /^\/department/,
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password']

// Routes that should redirect to dashboard if already authenticated
const AUTH_REDIRECT_ROUTES = ['/login', '/register']

// Helper function to get dashboard URL based on roles (supports both single and multiple roles)
function getDashboardUrl(userRoles: string[] | null | undefined, singleRole?: string | null): string {
  // Determine the primary role (first role in array, or fallback to singleRole)
  const primaryRole = userRoles && userRoles.length > 0 ? userRoles[0] : singleRole

  switch (primaryRole) {
    case 'teacher':
      return '/teacher/topics'
    case 'student':
      return '/student/topics'
    case 'admin':
      return '/admin/users' // Changed from /admin/students to /admin/users
    case 'department':
      return '/department/topics'
    default:
      return '/login'
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get authentication data from cookies
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  // Support both new (userRoles - comma-separated) and old (userRole - single) cookie formats
  const userRolesCookie = request.cookies.get('userRoles')?.value
  const userRoleLegacy = request.cookies.get('userRole')?.value

  // Parse roles into array
  const userRoles: string[] = userRolesCookie
    ? userRolesCookie.split(',').map(r => r.trim()).filter(Boolean)
    : userRoleLegacy
    ? [userRoleLegacy]
    : []

  // Check if user is authenticated (has either access or refresh token)
  const isAuthenticated = !!(accessToken || refreshToken)

  // Debug logging (comment out in production)
  // console.log('[Middleware]', {
  //   pathname,
  //   isAuthenticated,
  //   hasAccessToken: !!accessToken,
  //   hasRefreshToken: !!refreshToken,
  //   userRoles,
  //   userRoleLegacy,
  // })

  // ====== 1. If authenticated and trying to access login/register, redirect to appropriate dashboard ======
  if (isAuthenticated && AUTH_REDIRECT_ROUTES.includes(pathname)) {
    // Redirect to appropriate dashboard based on roles
    const dashboardUrl = getDashboardUrl(userRoles, userRoleLegacy)

    if (dashboardUrl !== '/login') {
      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }
  }

  // ====== 2. If authenticated and on home page, redirect to dashboard ======
  if (isAuthenticated && pathname === '/') {
    const dashboardUrl = getDashboardUrl(userRoles, userRoleLegacy)

    if (dashboardUrl !== '/') {
      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }
  }

  // ====== 3. Public routes - allow access ======
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  // ====== 4. Protected routes - check authentication ======
  const isProtectedRoute = pathname.startsWith('/student') ||
                          pathname.startsWith('/teacher') ||
                          pathname.startsWith('/admin') ||
                          pathname.startsWith('/department')

  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login with return URL
    // console.log('[Middleware] Not authenticated, redirecting to login')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ====== 5. Role-based access control ======
  if (isAuthenticated && isProtectedRoute && userRoles.length > 0) {
    // Check if user is accessing a route that matches any of their roles
    let hasMatchingRole = false

    for (const [role, pattern] of Object.entries(ROLE_ROUTES)) {
      if (pattern.test(pathname)) {
        // This route requires a specific role
        // Check if user has this role (in their list of active roles for current semester)
        if (userRoles.includes(role)) {
          hasMatchingRole = true
          break
        }
      }
    }

    // If user is accessing a role-specific route but doesn't have the required role
    if (!hasMatchingRole) {
      // Check if pathname matches any role pattern
      const isRoleSpecificRoute = Object.values(ROLE_ROUTES).some(pattern => pattern.test(pathname))

      if (isRoleSpecificRoute) {
        // User is trying to access a route they don't have permission for
        // Redirect to their appropriate dashboard
        // console.log('[Middleware] No matching role found, redirecting to dashboard')
        const dashboardUrl = getDashboardUrl(userRoles, userRoleLegacy)
        return NextResponse.redirect(new URL(dashboardUrl, request.url))
      }
    }
  }

  // ====== 6. Allow the request to proceed ======
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif).*)',
  ],
}
