# Role Navigation Component

Component navigation dựa trên vai trò (role-based) cho phép giáo viên truy cập các chức năng khác nhau dựa trên vai trò của họ trong hệ thống.

## Tính năng

- **Hiển thị theo role**: Component tự động hiển thị các thanh tương ứng với roles của user
- **Expandable/Collapsible**: Click vào từng thanh để mở rộng và xem các tab chức năng
- **Role-based navigation**: Mỗi role có danh sách navigation items riêng
- **Visual feedback**: Highlight tab hiện tại, màu sắc khác nhau cho mỗi role
- **Responsive**: Hoạt động tốt trên mọi kích thước màn hình

## Cấu trúc

```
src/components/teacher/navigation/
├── role-navigation.tsx  # Main component
├── index.ts            # Exports
└── README.md           # Documentation (file này)
```

## Các Role và Navigation Items

### 1. TEACHER (Giáo viên)
- Thông tin cá nhân
- Danh sách sinh viên
- Hướng dẫn luận văn
- Chấm điểm
- Lịch bảo vệ

### 2. DEPARTMENT_LECTURER (Giáo viên bộ môn)
- Dashboard bộ môn
- Quản lý giảng viên
- Phân công công việc
- Báo cáo bộ môn

### 3. ACADEMIC_AFFAIRS_STAFF (Giáo vụ)
- Quản lý học kỳ
- Quản lý người dùng
- Quản lý topic
- Quản lý lịch bảo vệ
- Quản lý hội đồng
- Quản lý chuyên nghành
- Quản lý khoa
- Phân tích học kỳ
- Cài đặt chung

## Cách sử dụng

### Basic Usage

```tsx
import { RoleNavigation } from '@/components/teacher/navigation'
import { RoleType } from '@/types/teacher'

export default function MyPage() {
  // Lấy roles từ user profile
  const userRoles: RoleType[] = ['TEACHER', 'DEPARTMENT_LECTURER']

  return (
    <div>
      <RoleNavigation roles={userRoles} />
    </div>
  )
}
```

### Với user profile từ GraphQL

```tsx
import { useMyTeacherProfile } from '@/lib/graphql/hooks'
import { RoleNavigation } from '@/components/teacher/navigation'
import { RoleType } from '@/types/teacher'

export default function Dashboard() {
  const { profile, loading } = useMyTeacherProfile()

  if (loading) return <div>Loading...</div>

  // Lấy unique roles đang active
  const userRoles = profile?.roles
    ? Array.from(new Set(
        profile.roles
          .filter(r => r.activate)
          .map(r => r.role as RoleType)
      ))
    : []

  return (
    <div>
      <h1>Dashboard</h1>
      <RoleNavigation roles={userRoles} />
    </div>
  )
}
```

## Customize Navigation Items

Để thêm hoặc sửa navigation items, chỉnh sửa object `ROLE_NAVIGATION` trong `role-navigation.tsx`:

```tsx
const ROLE_NAVIGATION: Record<RoleType, NavigationItem[]> = {
  TEACHER: [
    { label: 'Tên tab', href: '/path/to/page', icon: '🎯' },
    // Thêm items mới ở đây...
  ],
  // ...
}
```

## Customize Colors

Để thay đổi màu sắc cho từng role, chỉnh sửa object `ROLE_COLOR_CLASSES`:

```tsx
const ROLE_COLOR_CLASSES: Record<RoleType, {...}> = {
  TEACHER: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-300',
    hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    active: 'bg-blue-100 dark:bg-blue-900/40 border-blue-500',
  },
  // ...
}
```

**Lưu ý**: Phải sử dụng full Tailwind class names, KHÔNG dùng dynamic strings như `bg-${color}-50`.

## Props

### RoleNavigationProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| roles | RoleType[] | Yes | Danh sách roles của user |

## State Management

Component sử dụng local state để quản lý:
- `expandedRole`: Role nào đang được mở rộng (chỉ 1 role tại 1 thời điểm)

## Features

### Active Link Detection
Component tự động detect link hiện tại dựa trên `usePathname()` và highlight nó.

### Single Expansion
Chỉ một role có thể được mở rộng tại một thời điểm. Khi click vào role khác, role trước sẽ tự động đóng lại.

### Empty State
Nếu user không có role nào, component hiển thị message thông báo.

## Example Layout

Thường được đặt trong sidebar hoặc navigation panel:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Left: Navigation */}
  <div className="lg:col-span-1">
    <RoleNavigation roles={userRoles} />
  </div>

  {/* Right: Main content */}
  <div className="lg:col-span-2">
    {/* Your page content */}
  </div>
</div>
```

## Best Practices

1. **Lấy roles từ backend**: Luôn lấy roles từ user profile (database) thay vì hardcode
2. **Filter active roles**: Chỉ hiển thị roles đang hoạt động (`activate: true`)
3. **Remove duplicates**: Dùng `Array.from(new Set(...))` để loại bỏ roles trùng lặp
4. **Loading state**: Hiển thị loading state khi đang fetch user profile
5. **Error handling**: Xử lý trường hợp user không có roles

## Todo

- [ ] Thêm badge đếm số lượng items cần xử lý cho mỗi nav item
- [ ] Thêm search/filter cho navigation items
- [ ] Thêm keyboard shortcuts
- [ ] Persist expanded state trong localStorage
- [ ] Thêm animations cho expand/collapse
