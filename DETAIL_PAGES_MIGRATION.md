# Detail Pages Migration - Từ SessionStorage sang GraphQL

## Vấn Đề

Hiện tại TẤT CẢ detail pages đang dùng **sessionStorage** để lưu data thay vì query trực tiếp từ GraphQL API:

```typescript
// ❌ HIỆN TẠI - Dùng sessionStorage
useEffect(() => {
  const storedData = sessionStorage.getItem('studentDetailData')
  if (storedData) {
    setStudent(JSON.parse(storedData))
  }
}, [])
```

### Nhược Điểm
1. **Không có deep linking** - Refresh page hoặc share URL sẽ mất data
2. **Data không fresh** - Hiển thị data cũ từ session
3. **Phức tạp** - Phải serialize/deserialize data khi navigate
4. **Không scalable** - Không support SSR/SSG của Next.js

## Giải Pháp

Backend đã có detail queries sẵn trong schema:

### Admin/Affair Queries
```graphql
type AffairQuery {
  studentDetail(id: ID!): Student
  teacherDetail(id: ID!): Teacher
  topicDetail(id: ID!): Topic
  councilDetail(id: ID!): Council
  enrollmentDetail(id: ID!): Enrollment
  semesterDetail(id: ID!): Semester
  majorDetail(id: ID!): Major
  facultyDetail(id: ID!): Faculty
}
```

### Department Queries
```graphql
type DepartmentQuery {
  studentDetail(id: ID!): Student
  teacherDetail(id: ID!): Teacher
  topicDetail(id: ID!): Topic
  councilDetail(id: ID!): Council
  enrollmentDetail(id: ID!): Enrollment
}
```

### Teacher Queries
```graphql
type SupervisorQuery {
  topicCouncilDetail(id: ID!): TopicCouncil
}

type CouncilMemberQuery {
  defenceDetail(id: ID!): Defence
}

type ReviewerQuery {
  gradeReviewDetail(id: ID!): GradeReview
}
```

## Implementation Plan

### Pages Cần Migrate

#### Admin Pages
- ✅ [app/admin/students/[id]/page.tsx](/home/thaily/code/lvtn/FE_main/app/admin/students/[id]/page.tsx) - Dùng `GET_STUDENT_DETAIL`
- ✅ [app/admin/teachers/[id]/page.tsx](/home/thaily/code/lvtn/FE_main/app/admin/teachers/[id]/page.tsx) - Dùng `GET_TEACHER_DETAIL`
- ✅ [app/admin/topics/[id]/page.tsx](/home/thaily/code/lvtn/FE_main/app/admin/topics/[id]/page.tsx) - Dùng `GET_TOPIC_DETAIL`
- ✅ [app/admin/councils/[id]/page.tsx](/home/thaily/code/lvtn/FE_main/app/admin/councils/[id]/page.tsx) - Dùng `GET_COUNCIL_DETAIL`

#### Department Pages
- ✅ [app/department/students/[id]/page.tsx](/home/thaily/code/lvtn/FE_main/app/department/students/[id]/page.tsx) - Dùng `GET_DEPARTMENT_STUDENT_DETAIL`
- ✅ [app/department/teachers/[id]/page.tsx](/home/thaily/code/lvtn/FE_main/app/department/teachers/[id]/page.tsx) - Dùng `GET_DEPARTMENT_TEACHER_DETAIL`
- ✅ [app/department/topics/[id]/page.tsx](/home/thaily/code/lvtn/FE_main/app/department/topics/[id]/page.tsx) - Dùng `GET_DEPARTMENT_TOPIC_DETAIL`
- ✅ [app/department/councils/[id]/page.tsx](/home/thaily/code/lvtn/FE_main/app/department/councils/[id]/page.tsx) - Dùng `GET_DEPARTMENT_COUNCIL_DETAIL`

#### Teacher Pages
- ✅ [app/teacher/topics/[id]/page.tsx](/home/thaily/code/lvtn/FE_main/app/teacher/topics/[id]/page.tsx) - Dùng `GET_TOPIC_COUNCIL_DETAIL`
- ✅ [app/teacher/councils/[id]/page.tsx](/home/thaily/code/lvtn/FE_main/app/teacher/councils/[id]/page.tsx) - Dùng `GET_DEFENCE_DETAIL`

#### Student Pages
- ✅ [app/student/thesis/[id]/page.tsx](/home/thaily/code/lvtn/FE_main/app/student/thesis/[id]/page.tsx) - Dùng enrollment detail query

## Pattern Chuẩn

### Before (SessionStorage)
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function StudentDetailPage() {
  const params = useParams()
  const [student, setStudent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedData = sessionStorage.getItem('studentDetailData')
    if (storedData) {
      setStudent(JSON.parse(storedData))
    }
    setIsLoading(false)
  }, [])

  if (isLoading) return <div>Loading...</div>
  if (!student) return <div>Not found</div>

  return <div>{student.username}</div>
}
```

### After (GraphQL Query)
```typescript
'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { GET_STUDENT_DETAIL } from '@/lib/graphql/queries/admin'

export default function StudentDetailPage() {
  const params = useParams()
  const studentId = params.id as string

  const { data, loading, error } = useQuery(GET_STUDENT_DETAIL, {
    variables: { id: studentId },
    skip: !studentId,
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const student = data?.affair?.studentDetail
  if (!student) return <div>Not found</div>

  return <div>{student.username}</div>
}
```

## Benefits

1. ✅ **Deep Linking** - URL có thể share và bookmark
2. ✅ **Fresh Data** - Luôn query data mới nhất từ backend
3. ✅ **Simple Code** - Không cần manage sessionStorage
4. ✅ **Type Safe** - GraphQL types tự động generate
5. ✅ **Cache** - Apollo cache tự động optimize
6. ✅ **SSR Ready** - Có thể dùng SSG/ISR sau này

## Testing Checklist

Sau khi migrate, test các scenario:

### Functional Tests
- [ ] Navigate từ list page → detail page - xem data hiển thị đúng
- [ ] Refresh detail page - data vẫn load đúng
- [ ] Copy URL và mở tab mới - data vẫn hiển thị
- [ ] Back button - quay lại list page không lỗi

### Error Handling
- [ ] ID không tồn tại - hiển thị error state
- [ ] Network error - hiển thị error message
- [ ] Loading state - hiển thị spinner khi loading

### Performance
- [ ] Query chỉ chạy 1 lần khi mount
- [ ] Cache hoạt động - navigate back/forward không re-query
- [ ] Loading state mượt mà

## Migration Status

- [ ] Admin student detail
- [ ] Admin teacher detail
- [ ] Admin topic detail
- [ ] Admin council detail
- [ ] Department student detail
- [ ] Department teacher detail
- [ ] Department topic detail
- [ ] Department council detail
- [ ] Teacher topic detail
- [ ] Teacher council/defence detail
- [ ] Student enrollment detail
