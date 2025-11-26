# 🚀 Complete GraphQL Migration Guide - Backend Schema v2

## ✅ COMPLETED - Student Role (100%)

### Files Updated:
- ✅ `queries/student/profile.queries.ts`
- ✅ `queries/student/enrollment.queries.ts`
- ✅ `mutations/student/file.mutations.ts`
- ✅ `hooks.ts` (Student hooks: useMyProfile, useMyEnrollments, useMyEnrollmentDetail, useMySemesters)

---

## ✅ COMPLETED - Teacher Role (Partial 40%)

### Files Updated:
- ✅ `queries/teacher/profile.queries.ts`
- ✅ `queries/teacher/topic.queries.ts`
- ✅ `queries/teacher/defence.queries.ts`
- ✅ `mutations/teacher/topic.mutations.ts` (CREATE_TOPIC_FOR_SUPERVISOR, CREATE_TOPIC_COUNCIL_FOR_SUPERVISOR)

### Files PENDING:
- ⏳ `mutations/teacher/grade.mutations.ts`
- ⏳ `mutations/teacher/profile.mutations.ts`
- ⏳ `hooks.ts` (Teacher hooks)

---

## ⏳ TODO - Remaining Files

### Admin (Affair) - 10 files
```
queries/admin/user.queries.ts
queries/admin/academic.queries.ts
queries/admin/topic.queries.ts
queries/admin/council.queries.ts
queries/admin/enrollment.queries.ts
mutations/admin/user.mutations.ts
mutations/admin/academic.mutations.ts
mutations/admin/topic.mutations.ts
mutations/admin/council.mutations.ts
hooks.ts (Admin hooks)
```

### Department - 8 files
```
queries/department/academic.queries.ts
queries/department/council.queries.ts
queries/department/defence.queries.ts
queries/department/student.queries.ts
queries/department/teacher.queries.ts
queries/department/topic.queries.ts
mutations/department/topic.mutations.ts
mutations/department/council.mutations.ts
hooks.ts (Department hooks)
```

---

## 📝 Migration Pattern Reference

### Student
```typescript
// Before
query { getMyProfile { ... } }
// After
query { student { me { ... } } }
```

### Teacher - Supervisor
```typescript
// Before
query { getMySupervisedTopicCouncils { ... } }
mutation { createTopicForSuperVisor { ... } }

// After
query { teacher { supervisor { topicCouncils { ... } } } }
mutation { teacher { supervisor { createTopic { ... } } } }
```

### Teacher - Council Member
```typescript
// Before
query { getMyDefences { ... } }
mutation { createGradeDefence { ... } }

// After
query { teacher { council { defences { ... } } } }
mutation { teacher { council { createGradeDefence { ... } } } }
```

### Teacher - Reviewer
```typescript
// Before
query { getMyGradeReviews { ... } }
mutation { updateGradeReview { ... } }

// After
query { teacher { reviewer { gradeReviews { ... } } } }
mutation { teacher { reviewer { updateGradeReview { ... } } } }
```

### Admin (Affair)
```typescript
// Before
query { getAllTeachers { ... } }
mutation { createTeacher { ... } }

// After
query { affair { teachers { ... } } }
mutation { affair { createTeacher { ... } } }
```

### Department
```typescript
// Before
query { getDepartmentTopics { ... } }
mutation { approveTopicStage1 { ... } }

// After
query { department { topics { ... } } }
mutation { department { approveTopicStage1 { ... } } }
```

---

## 🔧 Hook Update Pattern

### Query Hooks
```typescript
// Before
export function useMyProfile() {
  const { data, loading, error, refetch } = useQuery(GET_MY_PROFILE)
  return {
    profile: data?.getMyProfile,
    loading, error, refetch
  }
}

// After
export function useMyProfile() {
  const { data, loading, error, refetch } = useQuery(GET_MY_PROFILE)
  return {
    profile: data?.student?.me,  // Updated path
    loading, error, refetch
  }
}
```

### List Query Hooks
```typescript
// Before
export function useMyEnrollments(search?: any) {
  const { data, loading, error } = useQuery(GET_MY_ENROLLMENTS, { variables: { search } })
  return {
    enrollments: data?.getMyEnrollments?.data || [],
    total: data?.getMyEnrollments?.total || 0,
    loading, error
  }
}

// After
export function useMyEnrollments(search?: any) {
  const { data, loading, error } = useQuery(GET_MY_ENROLLMENTS, { variables: { search } })
  return {
    enrollments: data?.student?.enrollments?.data || [],  // Updated path
    total: data?.student?.enrollments?.total || 0,        // Updated path
    loading, error
  }
}
```

---

## ⚠️ CRITICAL Input Changes

### CreateTopicInput (Teacher Supervisor)
```typescript
// BEFORE
{
  title: string
  titleEnglish: string          // ❌ REMOVED
  description: string
  majorCode: string             // ❌ REMOVED
  semesterCode: string          // ❌ REMOVED
  trainingProgram?: string      // ❌ REMOVED (renamed)
  startDate: Time               // ❌ REMOVED (renamed)
  endDate: Time                 // ❌ REMOVED (renamed)
  maxStudents: number           // ❌ REMOVED
  students: string[]
}

// AFTER
{
  title: string
  titleEn: string               // ✅ RENAMED from titleEnglish
  description: string
  students: string[]
  stage: TopicStage             // ✅ NEW (STAGE_DACN | STAGE_LVTN)
  curriculum?: string           // ✅ RENAMED from trainingProgram
  timeStart: Time               // ✅ RENAMED from startDate
  timeEnd: Time                 // ✅ RENAMED from endDate
}
```

### CreateTopicCouncilInput (Teacher Supervisor)
```typescript
// BEFORE
{
  topicCode: string
  timeStart: Time
  timeEnd: Time
  students: string[]
}

// AFTER (No changes - same structure)
{
  topicCode: string
  timeStart: Time
  timeEnd: Time
  students: string[]
}
```

---

## 📋 Complete TODO Checklist

### Queries
- [x] Student: profile, enrollments, semesters
- [x] Teacher: profile, supervisor.topicCouncils, council.defences, reviewer.gradeReviews
- [ ] Admin: teachers, students, semesters, majors, faculties, topics, enrollments, councils
- [ ] Department: teachers, students, topics, enrollments, councils, defences

### Mutations
- [x] Student: uploadMidtermFile, uploadFinalFile
- [x] Teacher Supervisor: createTopic, createTopicCouncil
- [ ] Teacher Supervisor: gradeMidterm, gradeFinal, feedbackMidterm, feedbackFinal, approveMidtermFile, rejectMidtermFile, approveFinalFile, rejectFinalFile
- [ ] Teacher Council: createGradeDefence, updateGradeDefence, addCriterion, updateCriterion, deleteCriterion
- [ ] Teacher Reviewer: updateGradeReview, completeGradeReview
- [ ] Teacher Profile: updateProfile
- [ ] Admin: CRUD teachers, students, semesters, majors, faculties, councils, topics
- [ ] Department: createCouncil, updateCouncil, addDefence, removeDefence, approveTopicStage1, rejectTopicStage1, assignTopicToCouncil, removeTopicFromCouncil

### Hooks (hooks.ts)
- [x] Student: useMyProfile, useMyEnrollments, useMyEnrollmentDetail, useMySemesters
- [ ] Teacher: useMyTeacherProfile, useMySupervisedTopicCouncils, useMyDefences, useMyGradeReviews
- [ ] Admin: useListTeachers, useListStudents, useAllSemesters, useAllMajors, useAllFaculties, useAllTopics, useAllEnrollments, useAllCouncils
- [ ] Department: useDepartmentTeachers, useDepartmentStudents, useDepartmentTopics, useDepartmentEnrollments, useDepartmentCouncils, useDepartmentDefences

---

## 🎯 Migration Strategy

### Phase 1: Core Roles (COMPLETED 50%)
- [x] Student (100%)
- [x] Teacher Queries (100%)
- [ ] Teacher Mutations (40%)

### Phase 2: Admin & Department (PENDING)
- [ ] Admin Queries (0%)
- [ ] Admin Mutations (0%)
- [ ] Department Queries (0%)
- [ ] Department Mutations (0%)

### Phase 3: Hooks Update (PENDING)
- [x] Student hooks (100%)
- [ ] Teacher hooks (0%)
- [ ] Admin hooks (0%)
- [ ] Department hooks (0%)

### Phase 4: Testing & Validation
- [ ] Test all query/mutation responses
- [ ] Test all hook integrations
- [ ] Test component integrations
- [ ] Update TypeScript types if needed

---

## 🚀 Auto-Complete Remaining Migration?

Tôi có thể tự động generate và cập nhật toàn bộ các files còn lại nếu bạn muốn. Chỉ cần confirm!

**Commands available:**
1. `migrate:teacher-mutations` - Complete all teacher mutation files
2. `migrate:admin` - Complete all admin query/mutation files
3. `migrate:department` - Complete all department query/mutation files
4. `migrate:hooks` - Update all remaining hooks in hooks.ts
5. `migrate:all` - Do everything above at once

Hoặc bạn muốn tôi migrate từng phần một để review?
