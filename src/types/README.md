# TypeScript Types

TypeScript interfaces và types cho ứng dụng.

## Cấu trúc

```
src/types/
├── teacher.ts    # Types cho teacher/giảng viên
├── student.ts    # Types cho student/sinh viên (TODO)
├── admin.ts      # Types cho admin/giáo vụ (TODO)
└── index.ts      # Export tập trung
```

## Teacher Types

### RoleType

Enum cho các loại vai trò (đúng với backend enum RoleSystemRole):

```typescript
type RoleType = 'TEACHER' | 'DEPARTMENT_LECTURER' | 'ACADEMIC_AFFAIRS_STAFF'
```

- **TEACHER**: Giáo viên - Giảng viên giảng dạy
- **DEPARTMENT_LECTURER**: Giáo viên bộ môn - Quản lý bộ môn
- **ACADEMIC_AFFAIRS_STAFF**: Giáo vụ - Cán bộ phòng đào tạo

### TeacherRole

Interface cho vai trò của giảng viên:

```typescript
interface TeacherRole {
  id: string
  title: string
  role: RoleType | string
  semesterCode: string
  activate: boolean
}
```

### TeacherProfile

Interface cho thông tin profile giảng viên:

```typescript
interface TeacherProfile {
  id: string
  email: string
  username: string
  gender: 'male' | 'female' | 'other' | string
  majorCode: string
  semesterCode?: string
  createdAt: string
  updatedAt: string
  roles?: TeacherRole[]
}
```

## Cách sử dụng

### Import Types

```typescript
import { RoleType, TeacherRole, TeacherProfile } from '@/types/teacher'
// hoặc
import { RoleType, TeacherRole, TeacherProfile } from '@/types'
```

### Sử dụng trong Components

```typescript
import { TeacherProfile } from '@/types/teacher'

interface ProfileCardProps {
  profile: Partial<TeacherProfile> | null
}

export function ProfileCard({ profile }: ProfileCardProps) {
  // Component implementation
}
```

### Sử dụng với Hooks

```typescript
import { TeacherProfile } from '@/types/teacher'

function useMyTeacherProfile() {
  // ...
  return {
    profile: data as TeacherProfile,
    loading,
    error,
  }
}
```

## Best Practices

1. **Luôn định nghĩa types cho props**: Mọi component props phải có interface rõ ràng
2. **Sử dụng Partial<T> cho optional data**: Khi data có thể null hoặc undefined
3. **Export từ index.ts**: Để dễ import
4. **Đặt tên rõ ràng**: Interface names phải mô tả rõ data structure

## TODO

- [ ] Thêm Student types
- [ ] Thêm Admin types
- [ ] Thêm Common types (Semester, Major, Faculty, etc.)
- [ ] Tích hợp GraphQL Code Generator để auto-generate types từ schema
