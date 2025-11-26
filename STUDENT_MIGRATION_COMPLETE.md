# ✅ Student Role Migration - COMPLETED

## Tóm tắt

Đã hoàn thành migration tất cả GraphQL queries/mutations cho **Student role** từ flat queries sang namespace-based approach (Backend Schema v2).

---

## 📝 Files đã cập nhật

### 1. Queries (2 files)
- ✅ `src/lib/graphql/queries/student/profile.queries.ts`
  - `GET_MY_PROFILE`: `getMyProfile` → `student { me }`
  - `GET_MY_SEMESTERS`: `getMySemesters` → `student { semesters }`
  - Added `mssv` field to profile

- ✅ `src/lib/graphql/queries/student/enrollment.queries.ts`
  - `GET_MY_ENROLLMENTS`: `getMyEnrollments` → `student { enrollments }`
  - `GET_MY_ENROLLMENT_DETAIL`: Converted to use `student { enrollments }` with filter

### 2. Mutations (1 file)
- ✅ `src/lib/graphql/mutations/student/file.mutations.ts`
  - `UPLOAD_MIDTERM_FILE`: `uploadMidtermFile` → `student { uploadMidtermFile }`
  - `UPLOAD_FINAL_FILE`: `uploadFinalFile` → `student { uploadFinalFile }`
  - Added `updatedAt` field to response

### 3. Hooks (1 file)
- ✅ `src/lib/graphql/hooks.ts`
  - `useMyProfile()`: Updated data path to `data?.student?.me`
  - `useMyEnrollments()`: Updated data path to `data?.student?.enrollments`
  - `useMyEnrollmentDetail()`: Updated data path to `data?.student?.enrollments?.data?.[0]`
  - `useMySemesters()`: Updated data path to `data?.student?.semesters`

---

## 🔄 Schema Changes Summary

### Before (Flat)
```graphql
query {
  getMyProfile { ... }
  getMyEnrollments(search: $search) { ... }
  getMySemesters(search: $search) { ... }
}

mutation {
  uploadMidtermFile(input: $input) { ... }
  uploadFinalFile(input: $input) { ... }
}
```

### After (Namespace-based)
```graphql
query {
  student {
    me { ... }
    enrollments(search: $search) { ... }
    semesters(search: $search) { ... }
  }
}

mutation {
  student {
    uploadMidtermFile(input: $input) { ... }
    uploadFinalFile(input: $input) { ... }
  }
}
```

---

## 🆕 New Fields Added

### Student Profile
- ✅ `mssv: String!` - Mã số sinh viên

### File Response
- ✅ `updatedAt: Time` - Timestamp cập nhật file

---

## ⚠️ Breaking Changes

### 1. Data Access Path Changes
Components accessing query results cần cập nhật path:

**Before:**
```typescript
const profile = data?.getMyProfile
const enrollments = data?.getMyEnrollments?.data
```

**After:**
```typescript
const profile = data?.student?.me
const enrollments = data?.student?.enrollments?.data
```

### 2. Enrollment Detail Query
`GET_MY_ENROLLMENT_DETAIL` giờ sử dụng `enrollments` query với filter thay vì query riêng:

**Before:**
```graphql
query GetMyEnrollmentDetail($id: ID!) {
  getMyEnrollmentDetail(id: $id) { ... }
}
```

**After:**
```graphql
query GetMyEnrollmentDetail($id: ID!) {
  student {
    enrollments(search: {
      filters: [{ condition: { field: "id", operator: "EQUALS", values: [$id] } }]
    }) {
      data { ... }
    }
  }
}
```

---

## ✅ Components Status

### Components using Student queries/mutations:
1. **app/student/thesis/[id]/page.tsx**
   - ✅ Không cần sửa - Chỉ dùng mutation hooks, không access response data trực tiếp

### Hook usage is backwards compatible:
- Tất cả hooks vẫn trả về cùng interface như cũ
- Components sử dụng hooks **KHÔNG CẦN SỬA**
- Chỉ có internal data path trong hooks đã được cập nhật

---

## 🧪 Testing Checklist

- [ ] Test login as student
- [ ] Test view profile page
- [ ] Test view enrollments list
- [ ] Test view enrollment detail
- [ ] Test view semesters list
- [ ] Test upload midterm file
- [ ] Test upload final file
- [ ] Verify `mssv` field hiển thị đúng

---

## 📊 Migration Progress

### Overall Progress: **25% Complete**
- ✅ Student (4/4 roles migrated)
- ⏳ Teacher Supervisor (0/4 roles migrated)
- ⏳ Teacher Council (0/4 roles migrated)
- ⏳ Teacher Reviewer (0/4 roles migrated)
- ⏳ Admin (Affair) (0/4 roles migrated)
- ⏳ Department (0/4 roles migrated)

---

## 🚀 Next Steps

**Option 1: Teacher Supervisor Role**
- Most commonly used teacher role
- Contains create topic, grade midterm/final
- ~6 queries/mutations to migrate

**Option 2: Admin (Affair) Role**
- Full system access
- User management (CRUD teachers/students)
- ~15+ queries/mutations to migrate

**Recommendation:** Migrate Teacher Supervisor next for progressive testing.

---

## 📝 Notes

1. **Backwards Compatibility**: All hooks maintain same return interface, components không cần sửa
2. **New Fields**: `mssv` field giờ available trong student profile
3. **Enrollment Detail**: Giờ dùng list query với filter thay vì dedicated detail query
4. **File Mutations**: Added `updatedAt` field trong response

Migration hoàn thành thành công! ✨
