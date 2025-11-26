/**
 * Debug script to check user roles and cookies
 * Run this in browser console after login
 */

console.log('=== AUTH DEBUG INFO ===')
console.log('\n1. LocalStorage:')
console.log('  - userRole (legacy):', localStorage.getItem('userRole'))
console.log('  - userRoles (all):', localStorage.getItem('userRoles'))
console.log('  - currentSemesterId:', localStorage.getItem('currentSemesterId'))

console.log('\n2. Cookies:')
const cookies = document.cookie.split(';').reduce((acc, cookie) => {
  const [key, value] = cookie.trim().split('=')
  acc[key] = value
  return acc
}, {})
console.log('  - accessToken:', cookies.accessToken ? 'present' : 'missing')
console.log('  - refreshToken:', cookies.refreshToken ? 'present' : 'missing')
console.log('  - userRole:', cookies.userRole)
console.log('  - userRoles:', cookies.userRoles)

console.log('\n3. JWT Token Payload:')
try {
  const token = cookies.accessToken || localStorage.getItem('accessToken')
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]))
    console.log('  - role:', payload.role)
    console.log('  - ids:', payload.ids)
    console.log('  - email:', payload.email)
    console.log('  - name:', payload.name)
  } else {
    console.log('  No token found')
  }
} catch (e) {
  console.error('  Error parsing token:', e)
}

console.log('\n4. Active Roles Check:')
try {
  const userRolesStr = localStorage.getItem('userRoles')
  if (userRolesStr) {
    const userRoles = JSON.parse(userRolesStr)
    console.log('  Total roles:', userRoles.length)
    userRoles.forEach((role, i) => {
      console.log(`  ${i + 1}. ${role.role} (${role.semesterCode}) - activate: ${role.activate}`)
    })

    // Check current semester roles
    const currentSemester = localStorage.getItem('currentSemesterId')
    if (currentSemester) {
      const activeRoles = userRoles
        .filter(r => r.semesterCode === currentSemester && r.activate)
        .map(r => r.role)
      console.log(`\n  Active roles for ${currentSemester}:`, activeRoles)
    }
  } else {
    console.log('  No userRoles found in localStorage')
  }
} catch (e) {
  console.error('  Error checking roles:', e)
}

console.log('\n======================')
