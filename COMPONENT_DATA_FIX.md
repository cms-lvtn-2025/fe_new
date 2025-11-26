# Component Data Display Fix

## Vấn đề ban đầu
Backend trả về data đầy đủ và đúng format:
```json
{
  "data": {
    "affair": {
      "students": {
        "total": 1001,
        "data": [...]
      }
    }
  }
}
```

Nhưng **KHÔNG HIỂN thị được trên giao diện** vì các component vẫn dùng **cấu trúc cũ** không khớp với Backend Schema v2.

## Nguyên nhân

### 1. Data Path Không Đúng
**Cũ (sai):**
```typescript
const students = (data as any)?.getListStudents?.data || []
const semesters = (semestersData as any)?.getAllSemesters?.data || []
```

**Mới (đúng):**
```typescript
const students = (data as any)?.affair?.students?.data || []
const semesters = (semestersData as any)?.affair?.semesters?.data || []
```

### 2. Filter Structure Không Khớp
**Cũ (sai):**
```typescript
filters.push({
  condition: {
    field: 'semester_code',
    operator: 'EQUAL',
    values: [selectedSemester]
  }
})
```

**Mới (đúng):**
```typescript
filters.push({
  field: 'semesterCode',
  operator: 'eq',
  value: selectedSemester
})
```

### 3. Pagination Structure Cũ
**Cũ (sai):**
```typescript
pagination: {
  page: 1,
  pageSize: 100,
  sortBy: 'created_at',
  descending: true
}
```

**Mới (đúng):**
```typescript
pagination: {
  page: 1,
  pageSize: 100
},
sorts: [{ field: 'createdAt', order: 'DESC' }]
```

## Files Đã Fix

### Components chính:
1. **`/src/components/admin/users/student-management.tsx`**
   - ✅ Fix data path: `affair.students`
   - ✅ Fix filter structure
   - ✅ Fix pagination với sorts
   - ✅ Fix field names: `semester_code` → `semesterCode`

2. **`/src/components/admin/users/teacher-management.tsx`**
   - ✅ Fix data path: `affair.teachers`
   - ✅ Fix filter structure
   - ✅ Fix pagination với sorts
   - ✅ Fix syntax errors (missing closing braces)

3. **`/src/components/admin/councils/assign-topics-dialog.tsx`**
   - ✅ Fix data path: `affair.topics`

4. **`/src/components/admin/users/teacher-form-dialog.tsx`**
   - ✅ Fix data path: `affair.majors`, `affair.semesters`

5. **`/src/components/admin/users/student-form-dialog.tsx`**
   - ✅ Fix data path: `affair.majors`, `affair.semesters`

6. **`/src/components/admin/majors/major-form-dialog.tsx`**
   - ✅ Fix data path: `affair.faculties`

## Bảng Mapping Data Path

| Cũ (Flat Query) | Mới (Namespace) | Ghi chú |
|----------------|----------------|---------|
| `getListStudents.data` | `affair.students.data` | Admin student list |
| `getListStudents.total` | `affair.students.total` | Total count |
| `getListTeachers.data` | `affair.teachers.data` | Admin teacher list |
| `getListTeachers.total` | `affair.teachers.total` | Total count |
| `getAllSemesters.data` | `affair.semesters.data` | Semester list |
| `getAllMajors.data` | `affair.majors.data` | Major list |
| `getAllFaculties.data` | `affair.faculties.data` | Faculty list |
| `getAllTopics.data` | `affair.topics.data` | Topic list |
| `getAllCouncils.data` | `affair.councils.data` | Council list |
| `getAllEnrollments.data` | `affair.enrollments.data` | Enrollment list |

## Filter Operators Mapping

| Cũ | Mới | Mô tả |
|----|-----|-------|
| `EQUAL` | `eq` | Bằng |
| `IN` | `in` | Trong danh sách |
| `LIKE` | `contains` | Chứa chuỗi |
| `GT` | `gt` | Lớn hơn |
| `LT` | `lt` | Nhỏ hơn |
| `GTE` | `gte` | Lớn hơn hoặc bằng |
| `LTE` | `lte` | Nhỏ hơn hoặc bằng |

## Field Name Changes

| Cũ | Mới | Context |
|----|-----|---------|
| `semester_code` | `semesterCode` | camelCase format |
| `class_code` | `classCode` | camelCase format |
| `major_code` | `majorCode` | camelCase format |
| `created_at` | `createdAt` | camelCase format |
| `updated_at` | `updatedAt` | camelCase format |

## Test Checklist

Sau khi fix, kiểm tra các trang sau:

### Admin Pages
- ✅ `/admin/users` - Tab Sinh viên
  - Hiển thị danh sách students
  - Filter by semester, class, major
  - Search by username
  - Pagination hoạt động

- ✅ `/admin/users` - Tab Giảng viên
  - Hiển thị danh sách teachers
  - Filter by semester, major
  - Search by username
  - Pagination hoạt động

- ✅ `/admin/semesters` - Danh sách học kỳ
- ✅ `/admin/majors` - Danh sách ngành
- ✅ `/admin/faculties` - Danh sách khoa
- ✅ `/admin/topics` - Danh sách đề tài
- ✅ `/admin/councils` - Danh sách hội đồng

### Department Pages
- `/department/students`
- `/department/teachers`
- `/department/topics`
- `/department/councils`

### Teacher Pages
- `/teacher/topics`
- `/teacher/councils`
- `/teacher/defences`

## Kết quả
✅ **Build thành công**
✅ **Data hiển thị đúng trên UI**
✅ **Filters hoạt động**
✅ **Pagination hoạt động**
✅ **Search hoạt động**

## Lưu ý cho Developer

### 1. Luôn dùng namespace paths
```typescript
// ❌ SAI
const data = response?.getListStudents?.data

// ✅ ĐÚNG
const data = response?.affair?.students?.data
```

### 2. Filter structure mới
```typescript
// ❌ SAI
{ condition: { field: 'name', operator: 'EQUAL', values: ['value'] } }

// ✅ ĐÚNG
{ field: 'name', operator: 'eq', value: 'value' }
```

### 3. Pagination + Sorting
```typescript
// ✅ ĐÚNG
{
  pagination: { page: 1, pageSize: 20 },
  sorts: [{ field: 'createdAt', order: 'DESC' }],
  filters: [...]
}
```

### 4. Sử dụng TypeScript types
```typescript
import type { SearchRequestInput } from '@/types/graphql'

const search: SearchRequestInput = {
  pagination: { page: 1, pageSize: 20 },
  sorts: [{ field: 'createdAt', order: 'DESC' }],
  filters: []
}
```

## Debug Tips

Nếu data không hiển thị:

1. **Kiểm tra console log:**
```typescript
console.log('GraphQL Response:', data)
console.log('Extracted data:', data?.affair?.students?.data)
```

2. **Kiểm tra query variables:**
```typescript
console.log('Search variables:', {
  pagination,
  sorts,
  filters
})
```

3. **Kiểm tra Apollo DevTools:**
   - Xem query đã gửi
   - Xem response từ server
   - Kiểm tra cache

4. **Kiểm tra Network tab:**
   - POST request đến `/graphql`
   - Response status = 200
   - Response body có data
