# GraphQL Setup Guide

Thư mục này chứa cấu hình và utilities cho GraphQL client trong ứng dụng.

## Cấu trúc

- `client.ts` - Cấu hình Apollo Client
- `apollo-provider.tsx` - Apollo Provider component
- `queries.ts` - Định nghĩa các GraphQL queries và mutations
- `hooks.ts` - Custom React hooks để sử dụng GraphQL

## Cài đặt

1. **Cài đặt dependencies** (đã hoàn thành):
   ```bash
   yarn add @apollo/client graphql
   ```

2. **Cấu hình GraphQL endpoint**:
   - Thêm biến môi trường `NEXT_PUBLIC_GRAPHQL_ENDPOINT` vào file `.env.local`
   - Hoặc sửa trực tiếp trong `client.ts`:
     ```typescript
     const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql"
     ```

3. **Provider đã được tích hợp vào layout** (`app/layout.tsx`)

## Sử dụng

### 1. Student Hooks

```tsx
"use client"

import { useMyProfile, useMyEnrollments, useUploadMidtermFile } from "@/lib/graphql/hooks"

export default function StudentDashboard() {
  // Lấy thông tin profile
  const { profile, loading: profileLoading } = useMyProfile()
  
  // Lấy danh sách enrollments với pagination
  const { enrollments, total, loading: enrollmentsLoading } = useMyEnrollments({
    pagination: { page: 1, pageSize: 10 },
    filters: []
  })
  
  // Upload file mutation
  const { uploadFile, loading: uploading } = useUploadMidtermFile()

  const handleUpload = async () => {
    try {
      await uploadFile({
        variables: {
          input: {
            title: "Báo cáo giữa kỳ",
            file: "base64_encoded_file",
            tableId: "enrollment_id",
            option: "midterm"
          }
        }
      })
    } catch (err) {
      console.error(err)
    }
  }

  if (profileLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>Xin chào {profile?.username}</h1>
      <p>Tổng số enrollments: {total}</p>
      {enrollments.map((enrollment) => (
        <div key={enrollment.id}>{enrollment.title}</div>
      ))}
    </div>
  )
}
```

### 2. Teacher Hooks

```tsx
"use client"

import { 
  useMyTeacherProfile,
  useMySupervisedTopicCouncils,
  useGradeMidterm 
} from "@/lib/graphql/hooks"

export default function TeacherDashboard() {
  const { profile } = useMyTeacherProfile()
  const { topicCouncils, total } = useMySupervisedTopicCouncils({
    pagination: { page: 1, pageSize: 20 }
  })
  const { gradeMidterm, loading } = useGradeMidterm()

  const handleGrade = async (enrollmentId: string) => {
    try {
      await gradeMidterm({
        variables: {
          enrollmentId,
          input: {
            grade: 8,
            status: "PASS",
            feedback: "Tốt"
          }
        }
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <h1>Giáo viên: {profile?.username}</h1>
      <p>Số topic councils đang hướng dẫn: {total}</p>
      {/* Render topic councils */}
    </div>
  )
}
```

### 3. Academic Affairs Hooks

```tsx
"use client"

import { 
  useAllTopics, 
  useApproveTopic, 
  useRejectTopic 
} from "@/lib/graphql/hooks"

export default function TopicManagementPage() {
  const { topics, total, loading } = useAllTopics({
    pagination: { page: 1, pageSize: 20 },
    filters: [
      {
        condition: {
          field: "status",
          operator: "EQUAL",
          values: ["TOPIC_PENDING"]
        }
      }
    ]
  })
  
  const { approveTopic, loading: approving } = useApproveTopic()
  const { rejectTopic, loading: rejecting } = useRejectTopic()

  const handleApprove = async (topicId: string) => {
    try {
      await approveTopic({
        variables: { id: topicId }
      })
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Quản lý đề tài ({total})</h1>
      {topics.map((topic) => (
        <div key={topic.id}>
          <h3>{topic.title}</h3>
          <button onClick={() => handleApprove(topic.id)}>Phê duyệt</button>
        </div>
      ))}
    </div>
  )
}
```

### 4. Sử dụng useQuery/useMutation trực tiếp

```tsx
"use client"

import { useQuery } from "@apollo/client/react"
import { GET_ALL_TOPICS } from "@/lib/graphql/queries"

export default function TopicsPage() {
  const { data, loading, error } = useQuery(GET_ALL_TOPICS, {
    variables: {
      search: {
        pagination: { page: 1, pageSize: 10 }
      }
    }
  })

  const topics = data?.getAllTopics?.data || []
  const total = data?.getAllTopics?.total || 0

  // ...
}
```

### 4. Sử dụng Apollo Client trực tiếp

```tsx
import { apolloClient } from "@/lib/graphql/client"
import { GET_TOPICS } from "@/lib/graphql/queries"

// Trong server component hoặc API route
const { data } = await apolloClient.query({
  query: GET_TOPICS,
})
```

## Authentication

Client đã được cấu hình để tự động thêm authentication token vào headers. 
Hiện tại nó lấy token từ Firebase Auth. Bạn có thể điều chỉnh logic trong `client.ts` 
tại phần `authLink` nếu cần thay đổi cách lấy token.

## Customization

### Thay đổi cache policy

Sửa trong `hooks.ts`:
```typescript
fetchPolicy: "network-only" // hoặc "cache-first", "cache-and-network", "no-cache"
```

### Thêm error handling

Có thể customize error handling trong `client.ts` tại phần `errorLink`.

### Thêm type safety

Sử dụng GraphQL Code Generator để generate TypeScript types từ schema:
```bash
yarn add -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations
```

## Available Hooks

### Student Hooks
- `useMyProfile()` - Lấy thông tin profile sinh viên
- `useMyEnrollments(search?)` - Lấy danh sách enrollments
- `useMyEnrollmentDetail(id)` - Lấy chi tiết enrollment
- `useMySemesters(search?)` - Lấy danh sách semesters
- `useUploadMidtermFile()` - Upload file midterm
- `useUploadFinalFile()` - Upload file final

### Teacher Hooks
- `useMyTeacherProfile()` - Lấy thông tin profile giáo viên
- `useMySupervisedTopicCouncils(search?)` - Lấy danh sách topic councils đang hướng dẫn
- `useMyDefences(search?)` - Lấy danh sách defence assignments
- `useMyGradeReviews(search?)` - Lấy danh sách grade reviews
- `useUpdateMyTeacherProfile()` - Cập nhật profile giáo viên
- `useGradeMidterm()` - Chấm điểm midterm
- `useGradeFinal()` - Chấm điểm final
- `useCreateGradeDefence()` - Tạo grade defence
- `useUpdateGradeDefence()` - Cập nhật grade defence
- `useAddGradeDefenceCriterion()` - Thêm criterion vào grade defence
- `useUpdateGradeReview()` - Cập nhật grade review

### Academic Affairs Hooks
- `useListTeachers(search)` - Lấy danh sách giáo viên
- `useListStudents(search)` - Lấy danh sách sinh viên
- `useStudentDetail(id)` - Lấy chi tiết sinh viên
- `useTeacherDetail(id)` - Lấy chi tiết giáo viên
- `useAllSemesters(search)` - Lấy danh sách semesters
- `useAllMajors(search)` - Lấy danh sách majors
- `useAllFaculties(search)` - Lấy danh sách faculties
- `useAllTopics(search)` - Lấy danh sách topics
- `useTopicDetail(id)` - Lấy chi tiết topic
- `useAllEnrollments(search)` - Lấy danh sách enrollments
- `useEnrollmentDetail(id)` - Lấy chi tiết enrollment
- `useAllCouncils(search)` - Lấy danh sách councils
- `useCouncilDetail(id)` - Lấy chi tiết council
- `useDefencesByCouncil(councilId)` - Lấy danh sách defences theo council
- Các mutations: `useCreateTeacher()`, `useUpdateTeacher()`, `useDeleteTeacher()`, `useCreateStudent()`, `useUpdateStudent()`, `useDeleteStudent()`, `useApproveTopic()`, `useRejectTopic()`, `useUpdateTopic()`, `useDeleteTopic()`, v.v.

## Lưu ý

- Tất cả components sử dụng GraphQL hooks phải là Client Components (thêm `"use client"` ở đầu file)
- Đảm bảo GraphQL endpoint đã được cấu hình đúng trong `.env.local` hoặc `client.ts`
- Tất cả list responses có format `{ total, data }` - xem `LIST_RESPONSE_PATTERN.md` trong schema
- Search input có format: `{ pagination?: PaginationInput, filters?: FilterCriteriaInput[] }`
- Pagination input: `{ page: number, pageSize: number, sortBy?: string, descending?: boolean }`

## Cấu trúc Modular (NEW!)

Queries và mutations đã được tách ra thành các module riêng biệt để dễ quản lý:

```
src/lib/graphql/
├── queries/
│   ├── student.queries.ts    # Queries dành cho sinh viên
│   ├── teacher.queries.ts    # Queries dành cho giáo viên
│   ├── admin.queries.ts      # Queries dành cho quản trị/giáo vụ
│   └── index.ts              # Export tập trung
├── mutations/
│   ├── student.mutations.ts  # Mutations dành cho sinh viên
│   ├── teacher.mutations.ts  # Mutations dành cho giáo viên
│   ├── admin.mutations.ts    # Mutations dành cho quản trị/giáo vụ
│   └── index.ts              # Export tập trung
└── hooks.ts                  # Custom hooks
```

### Import từ module (Recommended)

```typescript
// Student
import { GET_MY_PROFILE, GET_MY_ENROLLMENTS } from '@/lib/graphql/queries/student.queries'
import { UPLOAD_MIDTERM_FILE } from '@/lib/graphql/mutations/student.mutations'

// Teacher
import { GET_MY_TEACHER_PROFILE } from '@/lib/graphql/queries/teacher.queries'
import { GRADE_MIDTERM, GRADE_FINAL } from '@/lib/graphql/mutations/teacher.mutations'

// Admin
import { GET_LIST_STUDENTS, GET_ALL_TOPICS } from '@/lib/graphql/queries/admin.queries'
import { CREATE_STUDENT, UPDATE_TOPIC } from '@/lib/graphql/mutations/admin.mutations'
```

### Filter Structure (IMPORTANT!)

Khi sử dụng filters, PHẢI wrap trong object `condition`:

```typescript
// ❌ SAI - thiếu "condition" wrapper
{
  filters: [{
    field: "id",
    operator: "IN",
    value: ["TOP_000648", ...]  // Sai: dùng "value"
  }]
}

// ✅ ĐÚNG
{
  filters: [{
    condition: {              // Phải có "condition"
      field: "id",
      operator: "IN",
      values: ["TOP_000648", ...]  // Phải dùng "values" (số nhiều)
    }
  }]
}
```

Ví dụ đầy đủ:

```typescript
const search = {
  pagination: { page: 1, pageSize: 20 },
  filters: [
    {
      condition: {
        field: 'semester_code',
        operator: 'EQUAL',
        values: 'HK1_2024',
      },
    },
  ],
}
```

