# GraphQL Migration Report - Backend Schema v2

## 🔴 CRITICAL: Frontend GraphQL queries/mutations CẦN ĐƯỢC CẬP NHẬT TOÀN BỘ

Backend đã chuyển từ **flat queries** sang **namespace-based GraphQL** theo role. Frontend hiện tại **KHÔNG TƯƠNG THÍCH** và cần refactor hoàn toàn.

---

## 📊 Tổng quan thay đổi Backend Schema

### Backend Schema Cũ (Flat)
```graphql
query {
  getMyProfile { ... }
  getMyTeacherProfile { ... }
  getMySupervisedTopicCouncils { ... }
}

mutation {
  createTopic(input: ...) { ... }
  createTopicForSuperVisor(input: ...) { ... }
}
```

### Backend Schema Mới (Namespace-based)
```graphql
query {
  student { me { ... } }
  teacher { me { ... } }
  teacher { supervisor { topicCouncils { ... } } }
}

mutation {
  teacher { supervisor { createTopic(input: ...) { ... } } }
}
```

---

## 🔍 Chi tiết thay đổi theo Role

### 1️⃣ STUDENT QUERIES

#### ❌ Cũ (Frontend hiện tại)
```graphql
query GetMyProfile {
  getMyProfile { ... }
}

query GetMySemesters {
  getMySemesters(search: $search) { ... }
}

query GetMyEnrollments {
  getMyEnrollments(search: $search) { ... }
}
```

#### ✅ Mới (Backend schema v2)
```graphql
query GetMyProfile {
  student {
    me {
      id
      email
      phone
      username
      gender
      majorCode
      classCode
      semesterCode
      mssv
      createdAt
      updatedAt
    }
  }
}

query GetMyEnrollments {
  student {
    enrollments(search: $search) {
      total
      data {
        id
        title
        studentCode
        topicCouncilCode
        # ... more fields
      }
    }
  }
}

query GetMySemesters {
  student {
    semesters(search: $search) {
      total
      data {
        id
        title
        createdAt
        updatedAt
      }
    }
  }
}
```

**Files cần sửa:**
- ✏️ `src/lib/graphql/queries/student/profile.queries.ts`
- ✏️ `src/lib/graphql/queries/student/enrollment.queries.ts`

---

### 2️⃣ TEACHER QUERIES & MUTATIONS

#### ❌ Cũ (Frontend hiện tại)
```graphql
query GetMyTeacherProfile {
  getMyTeacherProfile { ... }
}

query GetMySupervisedTopicCouncils {
  getMySupervisedTopicCouncils(search: $search) { ... }
}

mutation CreateTopicForSuperVisor {
  createTopicForSuperVisor(input: $input) { ... }
}
```

#### ✅ Mới (Backend schema v2)
```graphql
# Teacher profile
query GetMyTeacherProfile {
  teacher {
    me {
      id
      email
      username
      gender
      majorCode
      semesterCode
      msgv
      createdAt
      updatedAt
      roles {
        id
        title
        role
        semesterCode
        activate
      }
    }
  }
}

# Supervisor queries
query GetMySupervisedTopicCouncils {
  teacher {
    supervisor {
      topicCouncils(search: $search) {
        total
        data {
          id
          title
          stage
          topicCode
          councilCode
          timeStart
          timeEnd
          topic { ... }
          enrollments { ... }
          supervisors { ... }
        }
      }
    }
  }
}

# Supervisor mutations
mutation CreateTopic {
  teacher {
    supervisor {
      createTopic(input: $input) {
        id
        title
        majorCode
        semesterCode
        status
        # ... more fields
      }
    }
  }
}

mutation CreateTopicCouncil {
  teacher {
    supervisor {
      createTopicCouncil(input: $input) {
        id
        title
        stage
        topicCode
        timeStart
        timeEnd
      }
    }
  }
}

# Council member queries
query GetMyDefences {
  teacher {
    council {
      defences(search: $search) {
        total
        data {
          id
          title
          councilCode
          teacherCode
          position
          council { ... }
        }
      }
    }
  }
}

# Reviewer queries
query GetMyGradeReviews {
  teacher {
    reviewer {
      gradeReviews(search: $search) {
        total
        data {
          id
          title
          reviewGrade
          teacherCode
          status
          notes
        }
      }
    }
  }
}
```

**Files cần sửa:**
- ✏️ `src/lib/graphql/queries/teacher/profile.queries.ts`
- ✏️ `src/lib/graphql/queries/teacher/topic.queries.ts`
- ✏️ `src/lib/graphql/queries/teacher/defence.queries.ts`
- ✏️ `src/lib/graphql/mutations/teacher/topic.mutations.ts`
- ✏️ `src/lib/graphql/mutations/teacher/grade.mutations.ts`
- ✏️ `src/lib/graphql/mutations/teacher/profile.mutations.ts`

---

### 3️⃣ ADMIN (AFFAIR) QUERIES & MUTATIONS

#### ❌ Cũ (Frontend hiện tại)
```graphql
query GetAllTeachers {
  getAllTeachers(search: $search) { ... }
}

mutation CreateTeacher {
  createTeacher(input: $input) { ... }
}
```

#### ✅ Mới (Backend schema v2)
```graphql
query GetAllTeachers {
  affair {
    teachers(search: $search) {
      total
      data {
        id
        email
        username
        gender
        majorCode
        semesterCode
        msgv
        roles { ... }
      }
    }
  }
}

mutation CreateTeacher {
  affair {
    createTeacher(input: $input) {
      id
      email
      username
      # ... more fields
    }
  }
}
```

**Files cần sửa:**
- ✏️ `src/lib/graphql/queries/admin/user.queries.ts`
- ✏️ `src/lib/graphql/queries/admin/academic.queries.ts`
- ✏️ `src/lib/graphql/queries/admin/topic.queries.ts`
- ✏️ `src/lib/graphql/queries/admin/council.queries.ts`
- ✏️ `src/lib/graphql/queries/admin/enrollment.queries.ts`
- ✏️ `src/lib/graphql/mutations/admin/user.mutations.ts`
- ✏️ `src/lib/graphql/mutations/admin/academic.mutations.ts`
- ✏️ `src/lib/graphql/mutations/admin/topic.mutations.ts`
- ✏️ `src/lib/graphql/mutations/admin/council.mutations.ts`

---

### 4️⃣ DEPARTMENT QUERIES & MUTATIONS

#### ❌ Cũ (Frontend hiện tại)
```graphql
query GetDepartmentTopics {
  getDepartmentTopics(search: $search) { ... }
}

mutation ApproveTopicStage1 {
  approveTopicStage1(id: $id) { ... }
}
```

#### ✅ Mới (Backend schema v2)
```graphql
query GetDepartmentTopics {
  department {
    topics(search: $search) {
      total
      data {
        id
        title
        majorCode
        semesterCode
        status
        # ... more fields
      }
    }
  }
}

mutation ApproveTopicStage1 {
  department {
    approveTopicStage1(id: $id) {
      id
      title
      status
    }
  }
}
```

**Files cần sửa:**
- ✏️ `src/lib/graphql/queries/department/topic.queries.ts`
- ✏️ `src/lib/graphql/queries/department/council.queries.ts`
- ✏️ `src/lib/graphql/queries/department/student.queries.ts`
- ✏️ `src/lib/graphql/queries/department/teacher.queries.ts`
- ✏️ `src/lib/graphql/queries/department/defence.queries.ts`
- ✏️ `src/lib/graphql/mutations/department/topic.mutations.ts`
- ✏️ `src/lib/graphql/mutations/department/council.mutations.ts`

---

## 📝 Thay đổi về Types và Fields

### Type Names đã thay đổi
| Cũ | Mới | Ghi chú |
|---|---|---|
| `StudentEnrollment` | `Enrollment` | Unified type |
| `SupervisorEnrollment` | `Enrollment` | RBAC controlled fields |
| `CouncilDefence` | `Defence` | Renamed |
| `SupervisorTopicCouncilAssignmentListResponse` | `TopicCouncilListResponse` | Simplified |

### Fields đã thay đổi trong Topic
| Cũ | Mới | Ghi chú |
|---|---|---|
| `titleEnglish` | ❌ Removed | Không còn trong schema |
| `trainingProgram` | ❌ Removed | Không còn trong schema |
| `startDate`, `endDate` | ❌ Removed | Thông tin này giờ ở TopicCouncil |
| `maxStudents` | ❌ Removed | Không còn trong schema |
| - | `percentStage1` | ✅ New field |
| - | `percentStage2` | ✅ New field |

### Fields đã thay đổi trong Teacher
| Cũ | Mới | Ghi chú |
|---|---|---|
| - | `msgv` | ✅ New field (Mã số giảng viên) |
| - | `roles: [RoleSystem!]` | ✅ New field (RBAC roles) |

### Fields đã thay đổi trong Student
| Cũ | Mới | Ghi chú |
|---|---|---|
| - | `mssv` | ✅ New field (Mã số sinh viên) |

---

## 🛠️ Hướng dẫn Migration

### Bước 1: Cập nhật Input Types

**CreateTopicInput - Trước:**
```typescript
{
  title: String!
  titleEnglish: String!
  description: String!
  majorCode: String!
  semesterCode: String!
  trainingProgram: String
  startDate: Time!
  endDate: Time!
  maxStudents: Int!
  students: [String!]
}
```

**CreateTopicInput - Sau:**
```typescript
{
  title: String!
  titleEn: String!          // Đổi tên: titleEnglish -> titleEn
  description: String!
  students: [String!]!
  stage: TopicStage!        // New: STAGE_DACN hoặc STAGE_LVTN
  curriculum: String        // Đổi tên: trainingProgram -> curriculum (optional)
  timeStart: Time!          // Đổi tên: startDate -> timeStart
  timeEnd: Time!            // Đổi tên: endDate -> timeEnd
  // maxStudents removed
}
```

### Bước 2: Cập nhật tất cả queries/mutations

**Ví dụ migration cho Teacher Supervisor:**

```typescript
// ❌ CŨ
export const GET_MY_SUPERVISED_TOPIC_COUNCILS = gql`
  query GetMySupervisedTopicCouncils($search: SearchRequestInput) {
    getMySupervisedTopicCouncils(search: $search) {
      total
      data { ... }
    }
  }
`

// ✅ MỚI
export const GET_MY_SUPERVISED_TOPIC_COUNCILS = gql`
  query GetMySupervisedTopicCouncils($search: SearchRequestInput) {
    teacher {
      supervisor {
        topicCouncils(search: $search) {
          total
          data { ... }
        }
      }
    }
  }
`
```

### Bước 3: Cập nhật hooks

```typescript
// ❌ CŨ
export function useMySupervisedTopicCouncils(search?: any) {
  const { data, loading, error } = useQuery(GET_MY_SUPERVISED_TOPIC_COUNCILS, {
    variables: { search }
  })

  return {
    topicCouncils: data?.getMySupervisedTopicCouncils?.data || [],
    total: data?.getMySupervisedTopicCouncils?.total || 0,
    loading,
    error
  }
}

// ✅ MỚI
export function useMySupervisedTopicCouncils(search?: any) {
  const { data, loading, error } = useQuery(GET_MY_SUPERVISED_TOPIC_COUNCILS, {
    variables: { search }
  })

  return {
    topicCouncils: data?.teacher?.supervisor?.topicCouncils?.data || [],
    total: data?.teacher?.supervisor?.topicCouncils?.total || 0,
    loading,
    error
  }
}
```

---

## 📂 Danh sách đầy đủ files cần cập nhật

### Queries (22 files)
- [ ] `queries/student/profile.queries.ts`
- [ ] `queries/student/enrollment.queries.ts`
- [ ] `queries/teacher/profile.queries.ts`
- [ ] `queries/teacher/topic.queries.ts`
- [ ] `queries/teacher/defence.queries.ts`
- [ ] `queries/admin/user.queries.ts`
- [ ] `queries/admin/academic.queries.ts`
- [ ] `queries/admin/topic.queries.ts`
- [ ] `queries/admin/council.queries.ts`
- [ ] `queries/admin/enrollment.queries.ts`
- [ ] `queries/department/academic.queries.ts`
- [ ] `queries/department/council.queries.ts`
- [ ] `queries/department/defence.queries.ts`
- [ ] `queries/department/student.queries.ts`
- [ ] `queries/department/teacher.queries.ts`
- [ ] `queries/department/topic.queries.ts`

### Mutations (14 files)
- [ ] `mutations/student/file.mutations.ts`
- [ ] `mutations/teacher/profile.mutations.ts`
- [ ] `mutations/teacher/topic.mutations.ts`
- [ ] `mutations/teacher/grade.mutations.ts`
- [ ] `mutations/admin/user.mutations.ts`
- [ ] `mutations/admin/academic.mutations.ts`
- [ ] `mutations/admin/topic.mutations.ts`
- [ ] `mutations/admin/council.mutations.ts`
- [ ] `mutations/department/topic.mutations.ts`
- [ ] `mutations/department/council.mutations.ts`

### Hooks (1 file)
- [ ] `hooks.ts` - Cập nhật tất cả hooks để access data qua namespace

### Components (~50+ files)
- Tất cả components sử dụng các hooks trên cần kiểm tra lại

---

## ⚠️ Breaking Changes quan trọng

### 1. Input field names thay đổi
- `titleEnglish` → `titleEn`
- `trainingProgram` → `curriculum`
- `startDate` → `timeStart`
- `endDate` → `timeEnd`

### 2. Response fields thay đổi
- Topic không còn `titleEnglish`, `trainingProgram`, `maxStudents`
- TopicCouncil chứa thông tin `timeStart`, `timeEnd` thay vì Topic

### 3. Mutation names thay đổi
- `createTopicForSuperVisor` → `teacher.supervisor.createTopic`
- `createTopicCouncilForSuperVisor` → `teacher.supervisor.createTopicCouncil`

---

## ✅ Đề xuất thực hiện

### Priority 1 - Critical (Làm trước)
1. Cập nhật queries/mutations cho Student role
2. Cập nhật queries/mutations cho Teacher Supervisor role
3. Cập nhật hooks.ts
4. Test basic flows

### Priority 2 - High
1. Cập nhật queries/mutations cho Admin (Affair) role
2. Cập nhật queries/mutations cho Department role
3. Cập nhật queries/mutations cho Teacher Council/Reviewer roles

### Priority 3 - Medium
1. Refactor components để sử dụng namespace structure
2. Update types/interfaces
3. Clean up old code

---

## 🔧 Tools cần thiết

Tôi có thể giúp bạn:
1. ✅ Tự động generate tất cả queries/mutations mới theo backend schema v2
2. ✅ Cập nhật hooks.ts với namespace-based data access
3. ✅ Tìm và list tất cả components cần update
4. ✅ Tạo migration script để tự động replace

**Bạn có muốn tôi bắt đầu migrate không?**
