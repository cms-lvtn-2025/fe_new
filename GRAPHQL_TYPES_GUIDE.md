# GraphQL Types & Response Parser Guide

## 📋 Tổng quan

File này hướng dẫn cách sử dụng TypeScript interfaces và response parsers để làm việc với GraphQL API một cách type-safe, tránh bugs.

## 📦 Files quan trọng

- **`src/types/graphql.ts`**: Định nghĩa tất cả TypeScript interfaces
- **`src/lib/graphql/response-parser.ts`**: Helper functions để parse responses
- **`src/lib/graphql/hooks.ts`**: React hooks để query/mutation

## 🔧 Cách sử dụng

### 1. Import types trong component

```typescript
import type {
  Semester,
  SemesterListResponse,
  Student,
  Teacher,
  Topic
} from '@/types/graphql'
```

### 2. Sử dụng hooks với type-safe

```typescript
import { useAllSemesters } from '@/lib/graphql/hooks'

function MyComponent() {
  const { semesters, total, loading, error } = useAllSemesters({
    pagination: { page: 1, pageSize: 10 }
  })

  // semesters có type: Semester[]
  // total có type: number

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <p>Total: {total}</p>
      {semesters.map((semester) => (
        <div key={semester.id}>
          <h3>{semester.title}</h3>
          <p>Created: {new Date(semester.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  )
}
```

### 3. Parse raw GraphQL response

Nếu bạn có raw response từ GraphQL, dùng parsers:

```typescript
import { parseAffairSemesters } from '@/lib/graphql/response-parser'

// Raw response from GraphQL
const rawData = {
  "data": {
    "affair": {
      "semesters": {
        "total": 6,
        "data": [/* ... */]
      }
    }
  }
}

// Parse to type-safe object
const result = parseAffairSemesters(rawData.data)
// result: { total: number, data: Semester[] }

console.log(result.total) // 6
console.log(result.data[0].title) // "Học kỳ 2 năm 2025-2026"
```

### 4. Xử lý errors

```typescript
import { extractErrorMessages, hasErrors } from '@/lib/graphql/response-parser'

const response = {
  data: null,
  errors: [
    { message: "Not authenticated" }
  ]
}

if (hasErrors(response)) {
  const messages = extractErrorMessages(response)
  console.error('GraphQL Errors:', messages)
  // ["Not authenticated"]
}
```

## 📊 Cấu trúc Response

### Student Namespace

```typescript
{
  student: {
    me: Student | null
    enrollments: {
      total: number
      data: Enrollment[]
    }
    semesters: Semester[]
  }
}
```

### Teacher Namespace

```typescript
{
  teacher: {
    me: Teacher | null
    supervisor: {
      topicCouncils: {
        total: number
        data: TopicCouncil[]
      }
    }
    council: {
      defences: {
        total: number
        data: Defence[]
      }
    }
    reviewer: {
      gradeReviews: {
        total: number
        data: GradeReview[]
      }
    }
  }
}
```

### Department Namespace

```typescript
{
  department: {
    teachers: { total: number, data: Teacher[] }
    students: { total: number, data: Student[] }
    topics: { total: number, data: Topic[] }
    councils: { total: number, data: Council[] }
    semesters: { total: number, data: Semester[] }
    majors: { total: number, data: Major[] }
    faculties: { total: number, data: Faculty[] }
    topicDetail: Topic | null
    councilDetail: Council | null
  }
}
```

### Affair (Admin) Namespace

```typescript
{
  affair: {
    teachers: { total: number, data: Teacher[] }
    students: { total: number, data: Student[] }
    topics: { total: number, data: Topic[] }
    councils: { total: number, data: Council[] }
    enrollments: { total: number, data: Enrollment[] }
    semesters: { total: number, data: Semester[] }
    majors: { total: number, data: Major[] }
    faculties: { total: number, data: Faculty[] }
    teacherDetail: Teacher | null
    studentDetail: Student | null
    topicDetail: Topic | null
    councilDetail: Council | null
    enrollmentDetail: Enrollment | null
  }
}
```

## ✅ Best Practices

### 1. Always use type annotations

```typescript
// ✅ Good
const semester: Semester = data.affair.semesters.data[0]

// ❌ Bad - no type safety
const semester = data.affair.semesters.data[0]
```

### 2. Handle null/undefined gracefully

```typescript
// ✅ Good
const teacher = data?.affair?.teacherDetail
if (teacher) {
  console.log(teacher.username)
}

// ❌ Bad - can crash
const teacher = data.affair.teacherDetail
console.log(teacher.username) // Error if null
```

### 3. Use parsers for consistency

```typescript
// ✅ Good - consistent parsing
const { semesters, total } = parseAffairSemesters(data)

// ❌ Bad - manual parsing, prone to errors
const semesters = data?.affair?.semesters?.data || []
const total = data?.affair?.semesters?.total || 0
```

### 4. Type mutations correctly

```typescript
import type { CreateTopicInput } from '@/types/graphql'

const input: CreateTopicInput = {
  title: "My Topic",
  titleEn: "My Topic English",
  stage: "STAGE_LVTN",
  timeStart: "2025-01-01",
}

// TypeScript will catch errors:
// input.stage = "INVALID" // ❌ Error!
```

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot read property of undefined"

**Nguyên nhân:** Không check null/undefined trước khi access

```typescript
// ❌ Problem
const title = data.affair.semesters.data[0].title

// ✅ Solution
const title = data?.affair?.semesters?.data?.[0]?.title ?? 'No title'
```

### Issue 2: Type mismatch

**Nguyên nhân:** GraphQL response structure không khớp với interface

```typescript
// ❌ Problem - accessing wrong path
const semesters = data.semesters // undefined!

// ✅ Solution - use correct namespace
const semesters = data.affair.semesters.data
```

### Issue 3: Empty array instead of null

**Nguyên nhân:** Hook return empty array thay vì null khi loading

```typescript
// ❌ Problem
if (semesters) { /* always true even when loading */ }

// ✅ Solution - check loading state
if (loading) return <Loading />
if (semesters.length > 0) { /* ... */ }
```

## 🔍 Debugging Tips

### 1. Log raw response

```typescript
const { data, loading, error } = useAllSemesters(search)

console.log('Raw response:', data)
console.log('Parsed semesters:', parseAffairSemesters(data))
```

### 2. Check __typename

```typescript
console.log(semester.__typename) // Should be "Semester"
console.log(response.__typename) // Should be "SemesterListResponse"
```

### 3. Validate response structure

```typescript
import { safeParser } from '@/lib/graphql/response-parser'

const semesters = safeParser(
  data,
  parseAffairSemesters,
  { total: 0, data: [] } // fallback value
)
```

## 📚 Examples

### Example 1: Display semester list

```typescript
import { useAllSemesters } from '@/lib/graphql/hooks'
import type { Semester } from '@/types/graphql'

export default function SemesterList() {
  const { semesters, total, loading, error, refetch } = useAllSemesters({
    pagination: { page: 1, pageSize: 100 }
  })

  if (loading) return <div>Đang tải...</div>
  if (error) return <div>Lỗi: {error.message}</div>

  return (
    <div>
      <h1>Danh sách học kỳ ({total})</h1>
      <button onClick={() => refetch()}>Làm mới</button>

      <ul>
        {semesters.map((semester: Semester) => (
          <li key={semester.id}>
            {semester.title}
            <small>({new Date(semester.createdAt).toLocaleDateString()})</small>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Example 2: Create topic with type-safe input

```typescript
import { useCreateTopic } from '@/lib/graphql/hooks'
import type { CreateTopicInput } from '@/types/graphql'

export default function CreateTopicForm() {
  const { createTopic, loading, error } = useCreateTopic()

  const handleSubmit = async (formData: any) => {
    const input: CreateTopicInput = {
      title: formData.title,
      titleEn: formData.titleEn,
      description: formData.description,
      stage: formData.stage as 'STAGE_DACN' | 'STAGE_LVTN',
      timeStart: formData.timeStart,
      timeEnd: formData.timeEnd,
    }

    try {
      await createTopic({ variables: { input } })
      alert('Tạo đề tài thành công!')
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>
}
```

## 🎯 Migration Checklist

Khi migrate component cũ sang dùng types mới:

- [ ] Import types từ `@/types/graphql`
- [ ] Thay `any` bằng proper types
- [ ] Sử dụng optional chaining (`?.`)
- [ ] Check null/undefined trước khi access properties
- [ ] Sử dụng parsers cho consistency
- [ ] Test với data rỗng và data null
- [ ] Handle loading và error states
- [ ] Verify TypeScript compile không có lỗi

## 📖 References

- [GraphQL Documentation](https://graphql.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Apollo Client React Hooks](https://www.apollographql.com/docs/react/api/react/hooks/)
