/**
 * GraphQL Type Definitions
 * Auto-generated from Backend Schema v2
 */

// ============================================
// BASE TYPES
// ============================================

export interface Semester {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  __typename?: 'Semester'
}

export interface Major {
  id: string
  ms: string
  title: string
  facultyCode: string
  createdAt: string
  updatedAt: string
  __typename?: 'Major'
}

export interface Faculty {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  majors?: Major[]
  __typename?: 'Faculty'
}

export interface Student {
  id: string
  email: string
  phone?: string
  username: string
  gender: string
  majorCode: string
  classCode?: string
  semesterCode: string
  mssv?: string
  createdAt: string
  updatedAt: string
  __typename?: 'Student'
}

export interface Teacher {
  id: string
  email: string
  username: string
  gender: string
  majorCode: string
  semesterCode: string
  msgv?: string
  createdAt: string
  updatedAt: string
  roles?: TeacherRole[]
  __typename?: 'Teacher'
}

export interface TeacherRole {
  id: string
  title: string
  role: string
  semesterCode: string
  activate: boolean
  __typename?: 'TeacherRole'
}

export interface Topic {
  id: string
  title: string
  majorCode: string
  semesterCode: string
  status: string
  percentStage1?: number
  percentStage2?: number
  createdAt: string
  updatedAt: string
  major?: Major
  semester?: Semester
  files?: File[]
  topicCouncils?: TopicCouncil[]
  __typename?: 'Topic'
}

export interface TopicCouncil {
  id: string
  title: string
  stage: string
  topicCode: string
  councilCode?: string
  timeStart?: string
  timeEnd?: string
  topic?: Topic
  council?: Council
  enrollments?: Enrollment[]
  supervisors?: TeacherSupervisor[]
  __typename?: 'TopicCouncil'
}

export interface Council {
  id: string
  title: string
  majorCode: string
  semesterCode: string
  timeStart?: string
  createdAt: string
  updatedAt: string
  defences?: Defence[]
  topicCouncils?: TopicCouncil[]
  __typename?: 'Council'
}

export interface Defence {
  id: string
  title: string
  councilCode: string
  teacherCode: string
  position: string
  createdAt: string
  updatedAt: string
  council?: Council
  teacher?: Teacher
  gradeDefences?: GradeDefence[]
  __typename?: 'Defence'
}

export interface Enrollment {
  id: string
  title: string
  studentCode: string
  topicCouncilCode: string
  finalCode?: string
  gradeReviewCode?: string
  midtermCode?: string
  createdAt: string
  updatedAt: string
  student?: Student
  topicCouncil?: TopicCouncil
  midterm?: Midterm
  final?: Final
  gradeReview?: GradeReview
  gradeDefences?: GradeDefence[]
  __typename?: 'Enrollment'
}

export interface Midterm {
  id: string
  title: string
  grade: number
  status: string
  feedback?: string
  __typename?: 'Midterm'
}

export interface Final {
  id: string
  title: string
  supervisorGrade: number
  departmentGrade: number
  finalGrade: number
  status: string
  notes?: string
  __typename?: 'Final'
}

export interface GradeReview {
  id: string
  title: string
  teacherCode: string
  reviewGrade: number
  status: string
  notes?: string
  completionDate?: string
  createdAt: string
  updatedAt: string
  enrollment?: Enrollment
  __typename?: 'GradeReview'
}

export interface GradeDefence {
  id: string
  defenceCode: string
  enrollmentCode: string
  note?: string
  totalScore: number
  createdAt?: string
  updatedAt?: string
  defence?: Defence
  criteria?: GradeDefenceCriterion[]
  __typename?: 'GradeDefence'
}

export interface GradeDefenceCriterion {
  id: string
  name: string
  score: number
  maxScore: number
  __typename?: 'GradeDefenceCriterion'
}

export interface TeacherSupervisor {
  id: string
  teacherSupervisorCode: string
  teacher?: Teacher
  __typename?: 'TeacherSupervisor'
}

export interface File {
  id: string
  title: string
  file: string
  status: string
  table: string
  option: string
  tableId: string
  createdAt: string
  __typename?: 'File'
}

// ============================================
// LIST RESPONSE TYPES
// ============================================

export interface SemesterListResponse {
  total: number
  data: Semester[]
  __typename?: 'SemesterListResponse'
}

export interface MajorListResponse {
  total: number
  data: Major[]
  __typename?: 'MajorListResponse'
}

export interface FacultyListResponse {
  total: number
  data: Faculty[]
  __typename?: 'FacultyListResponse'
}

export interface StudentListResponse {
  total: number
  data: Student[]
  __typename?: 'StudentListResponse'
}

export interface TeacherListResponse {
  total: number
  data: Teacher[]
  __typename?: 'TeacherListResponse'
}

export interface TopicListResponse {
  total: number
  data: Topic[]
  __typename?: 'TopicListResponse'
}

export interface CouncilListResponse {
  total: number
  data: Council[]
  __typename?: 'CouncilListResponse'
}

export interface EnrollmentListResponse {
  total: number
  data: Enrollment[]
  __typename?: 'EnrollmentListResponse'
}

export interface DefenceListResponse {
  total: number
  data: Defence[]
  __typename?: 'DefenceListResponse'
}

export interface GradeReviewListResponse {
  total: number
  data: GradeReview[]
  __typename?: 'GradeReviewListResponse'
}

// ============================================
// QUERY RESPONSE TYPES
// ============================================

// Student Namespace
export interface StudentQuery {
  me?: Student
  enrollments?: EnrollmentListResponse
  semesters?: SemesterListResponse
  __typename?: 'StudentQuery'
}

// Teacher Namespace
export interface TeacherSupervisorQuery {
  topicCouncils?: TopicCouncilListResponse
  __typename?: 'TeacherSupervisorQuery'
}

export interface TeacherCouncilQuery {
  defences?: DefenceListResponse
  __typename?: 'TeacherCouncilQuery'
}

export interface TeacherReviewerQuery {
  gradeReviews?: GradeReviewListResponse
  __typename?: 'TeacherReviewerQuery'
}

export interface TeacherQuery {
  me?: Teacher
  supervisor?: TeacherSupervisorQuery
  council?: TeacherCouncilQuery
  reviewer?: TeacherReviewerQuery
  __typename?: 'TeacherQuery'
}

// Department Namespace
export interface DepartmentQuery {
  teachers?: TeacherListResponse
  teacherDetail?: Teacher
  students?: StudentListResponse
  studentDetail?: Student
  semesters?: SemesterListResponse
  majors?: MajorListResponse
  faculties?: FacultyListResponse
  topics?: TopicListResponse
  topicDetail?: Topic
  councils?: CouncilListResponse
  councilDetail?: Council
  defencesByCouncil?: Defence[]
  gradeDefences?: GradeDefence[]
  __typename?: 'DepartmentQuery'
}

// Affair (Admin) Namespace
export interface AffairQuery {
  teachers?: TeacherListResponse
  teacherDetail?: Teacher
  students?: StudentListResponse
  studentDetail?: Student
  semesters?: SemesterListResponse
  majors?: MajorListResponse
  faculties?: FacultyListResponse
  topics?: TopicListResponse
  topicDetail?: Topic
  councils?: CouncilListResponse
  councilDetail?: Council
  enrollments?: EnrollmentListResponse
  enrollmentDetail?: Enrollment
  defencesByCouncil?: DefenceListResponse
  __typename?: 'AffairQuery'
}

export interface TopicCouncilListResponse {
  total: number
  data: TopicCouncil[]
  __typename?: 'TopicCouncilListResponse'
}

// ============================================
// ROOT QUERY TYPE
// ============================================

export interface Query {
  student?: StudentQuery
  teacher?: TeacherQuery
  department?: DepartmentQuery
  affair?: AffairQuery
}

// ============================================
// GRAPHQL RESPONSE WRAPPER
// ============================================

export interface GraphQLResponse<T = any> {
  data?: T
  errors?: GraphQLError[]
}

export interface GraphQLError {
  message: string
  locations?: { line: number; column: number }[]
  path?: (string | number)[]
  extensions?: Record<string, any>
}

// ============================================
// INPUT TYPES
// ============================================

export interface SearchRequestInput {
  pagination?: PaginationInput
  filters?: FilterCriteriaInput[]
}

export interface PaginationInput {
  page?: number
  pageSize?: number
  sortBy?: string
  descending?: boolean
}

export interface FilterCriteriaInput {
  condition?: FilterConditionInput
  group?: FilterGroupInput
}

export interface FilterConditionInput {
  field: string
  operator: FilterOperator
  values?: string[]
}

export interface FilterGroupInput {
  logic?: 'AND' | 'OR'
  filters: FilterCriteriaInput[]
}

export type FilterOperator =
  | 'EQUAL'
  | 'NOT_EQUAL'
  | 'GREATER_THAN'
  | 'GREATER_THAN_EQUAL'
  | 'LESS_THAN'
  | 'LESS_THAN_EQUAL'
  | 'LIKE'
  | 'IN'
  | 'NOT_IN'
  | 'IS_NULL'
  | 'IS_NOT_NULL'
  | 'BETWEEN'

// ============================================
// MUTATION INPUT TYPES
// ============================================

export interface CreateTopicInput {
  title: string
  titleEn?: string
  description?: string
  curriculum?: string
  stage: 'STAGE_DACN' | 'STAGE_LVTN'
  timeStart?: string
  timeEnd?: string
}

export interface CreateTopicCouncilInput {
  topicCode: string
  title: string
  stage: string
  timeStart?: string
  timeEnd?: string
}

export interface UpdateTeacherProfileInput {
  email?: string
  username?: string
  gender?: string
  majorCode?: string
  semesterCode?: string
}

export interface UpdateStudentProfileInput {
  email?: string
  phone?: string
  username?: string
  gender?: string
  majorCode?: string
  classCode?: string
}

export interface GradeMidtermInput {
  enrollmentId: string
  grade: number
  feedback?: string
}

export interface GradeFinalInput {
  enrollmentId: string
  supervisorGrade: number
  departmentGrade: number
  notes?: string
}

export interface CreateGradeDefenceInput {
  defenceCode: string
  enrollmentCode: string
  totalScore: number
  note?: string
  criteria: GradeDefenceCriterionInput[]
}

export interface GradeDefenceCriterionInput {
  name: string
  score: number
  maxScore: number
}

export interface UpdateGradeReviewInput {
  id: string
  reviewGrade: number
  status?: string
  notes?: string
}

// ============================================
// ENUM TYPES
// ============================================

export enum TopicStatus {
  SUBMIT = 'SUBMIT',
  TOPIC_PENDING = 'TOPIC_PENDING',
  APPROVED_1 = 'APPROVED_1',
  APPROVED_2 = 'APPROVED_2',
  IN_PROGRESS = 'IN_PROGRESS',
  TOPIC_COMPLETED = 'TOPIC_COMPLETED',
  REJECTED = 'REJECTED',
}

export enum TopicStage {
  STAGE_DACN = 'STAGE_DACN',
  STAGE_LVTN = 'STAGE_LVTN',
}

export enum DefencePosition {
  CHAIR = 'CHAIR',
  SECRETARY = 'SECRETARY',
  MEMBER = 'MEMBER',
  REVIEWER = 'REVIEWER',
}

export enum GradeStatus {
  PENDING = 'PENDING',
  GRADED = 'GRADED',
  COMPLETED = 'COMPLETED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}
