# Middleware Authentication & Authorization

## Tổng quan

File `middleware.ts` cung cấp authentication và authorization tự động cho toàn bộ ứng dụng Next.js.

## Các tính năng chính

### 1. **Tự động redirect khi đã đăng nhập**
- Khi user đã có JWT token (đã đăng nhập):
  - Truy cập `/` (trang home) → Tự động redirect về dashboard tương ứng với role
  - Truy cập `/login` hoặc `/register` → Tự động redirect về dashboard

### 2. **Bảo vệ route theo authentication**
- Các route protected (`/student`, `/teacher`, `/admin`, `/department`):
  - Nếu chưa đăng nhập → Redirect về `/login` kèm returnUrl
  - Nếu đã đăng nhập → Cho phép truy cập

### 3. **Kiểm tra role-based access**
- User chỉ được truy cập route phù hợp với role của mình:
  - Student → Chỉ được vào `/student/*`
  - Teacher → Chỉ được vào `/teacher/*`
  - Admin → Chỉ được vào `/admin/*`
  - Department → Chỉ được vào `/department/*`
- Nếu truy cập sai route → Tự động redirect về dashboard phù hợp

## Dashboard mặc định theo role

| Role | Dashboard URL |
|------|---------------|
| Student | `/student/topics` |
| Teacher | `/teacher/topics` |
| Admin | `/admin/users` |
| Department | `/department/topics` |

## Cơ chế hoạt động

### Token Storage
- Middleware đọc authentication data từ **cookies**
- Cookies được tự động set khi user login thành công
- Cookies bao gồm:
  - `accessToken`: JWT access token
  - `refreshToken`: Refresh token
  - `userRole`: Role của user (student/teacher/admin/department)

### Flow hoạt động

```
1. User request → Middleware kiểm tra cookies
2. Có token?
   - Không → Redirect login (nếu là protected route)
   - Có → Kiểm tra role
3. Role đúng với route?
   - Đúng → Cho phép truy cập
   - Sai → Redirect về dashboard phù hợp
4. Đã login mà vào /login hoặc /?
   - Redirect về dashboard
```

## Public Routes

Các route sau không yêu cầu authentication:
- `/` - Trang home
- `/login` - Trang đăng nhập
- `/register` - Trang đăng ký
- `/forgot-password` - Quên mật khẩu

## Excluded Paths

Middleware KHÔNG chạy trên các path sau:
- `/api/*` - API routes
- `/_next/static/*` - Static files
- `/_next/image/*` - Image optimization
- `/favicon.ico` - Favicon
- Các file media (`.png`, `.jpg`, `.jpeg`, `.svg`, `.gif`)

## Integration với Auth System

### 1. Login Flow
```typescript
// Trong app/login/callback/page.tsx
import { saveAccessToken, saveRefreshToken, saveUserRole } from '@/lib/api/auth'

// Sau khi login thành công
saveAccessToken(access_token, expires_in)  // Lưu vào localStorage + cookie
saveRefreshToken(refresh_token)            // Lưu vào localStorage + cookie
saveUserRole(role)                          // Lưu vào localStorage + cookie

// Middleware sẽ tự động redirect về dashboard
router.push('/teacher/topics')
```

### 2. Logout Flow
```typescript
// Trong components/layout/header.tsx
import { clearAuthData } from '@/lib/api/auth'

const handleLogout = async () => {
  // Call backend logout API
  await fetch('/api/v1/auth/logout', { ... })

  // Clear tất cả auth data (localStorage + cookies)
  clearAuthData()

  // Redirect về login
  router.push('/login')
}
```

### 3. Token Refresh
```typescript
// Trong lib/api/auth.ts
// Auto refresh token khi sắp hết hạn
const newToken = await refreshAccessToken()

// Token mới sẽ tự động được lưu vào cookies
// Middleware sẽ dùng token mới cho các request tiếp theo
```

## Testing Middleware

### Test Case 1: Chưa đăng nhập
```
1. Xóa hết cookies
2. Truy cập /student/topics
3. Expected: Redirect về /login?returnUrl=/student/topics
```

### Test Case 2: Đã đăng nhập - Truy cập đúng route
```
1. Login với role = teacher
2. Truy cập /teacher/topics
3. Expected: Hiển thị trang topics
```

### Test Case 3: Đã đăng nhập - Truy cập sai route
```
1. Login với role = teacher
2. Truy cập /student/topics
3. Expected: Redirect về /teacher/topics
```

### Test Case 4: Đã đăng nhập - Truy cập login
```
1. Login với role = student
2. Truy cập /login
3. Expected: Redirect về /student/topics
```

### Test Case 5: Đã đăng nhập - Truy cập home
```
1. Login với role = admin
2. Truy cập /
3. Expected: Redirect về /admin/users
```

## Debugging

### Check cookies trong DevTools
```javascript
// Console
document.cookie
// Expected output:
// "accessToken=...; refreshToken=...; userRole=teacher"
```

### Check localStorage
```javascript
// Console
console.log({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  userRole: localStorage.getItem('userRole')
})
```

### Enable middleware logging
```typescript
// Trong middleware.ts, thêm console.log
export function middleware(request: NextRequest) {
  console.log('Middleware:', {
    pathname: request.nextUrl.pathname,
    hasAccessToken: !!request.cookies.get('accessToken'),
    userRole: request.cookies.get('userRole')?.value
  })
  // ...
}
```

## Lưu ý

1. **Cookie vs localStorage**:
   - Middleware chỉ có thể đọc cookies (server-side)
   - localStorage chỉ dùng cho client-side
   - Cần lưu cả 2 để đảm bảo consistency

2. **Security**:
   - Cookies được set với `SameSite=Lax` để prevent CSRF
   - Access token có expiry time ngắn (thường 15 phút)
   - Refresh token có expiry time dài (thường 30 ngày)

3. **Performance**:
   - Middleware chạy trên mọi request (trừ excluded paths)
   - Chỉ kiểm tra cookies, không call API
   - Rất nhanh và không impact performance

## Troubleshooting

### Lỗi: Infinite redirect loop
**Nguyên nhân**: Role không khớp với dashboard URL

**Giải pháp**: Kiểm tra cookie `userRole` có đúng không

### Lỗi: Không redirect khi đã login
**Nguyên nhân**: Cookies chưa được set

**Giải pháp**:
1. Check `saveAccessToken`, `saveRefreshToken`, `saveUserRole` được gọi đúng chưa
2. Check cookie expiry time
3. Check domain của cookie

### Lỗi: Redirect về login liên tục
**Nguyên nhân**: Token expired hoặc invalid

**Giải pháp**:
1. Check token expiry time
2. Check refresh token có work không
3. Clear cookies và login lại
