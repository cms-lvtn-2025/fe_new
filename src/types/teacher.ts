/**
 * Teacher Types & Interfaces
 */

// Role types theo backend - chỉ có 3 loại (đúng với enum RoleSystemRole)
export type RoleType = 'TEACHER' | 'DEPARTMENT_LECTURER' | 'ACADEMIC_AFFAIRS_STAFF'

export interface TeacherRole {
  id: string
  title: string
  role: RoleType | string // Role có thể là các giá trị khác từ backend
  semesterCode: string
  activate: boolean
}

export interface TeacherProfile {
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

export interface TopicCouncilSupervisor {
  id: string
  teacherSupervisorCode: string
  topicCouncilCode: string
  createdAt: string
  updatedAt: string
  topicCouncil?: any // TODO: Define TopicCouncil interface
}

export interface Defence {
  id: string
  title: string
  councilCode: string
  teacherCode: string
  position: string
  createdAt: string
  updatedAt: string
  council?: any // TODO: Define Council interface
  teacher?: Partial<TeacherProfile>
  gradeDefences?: any[] // TODO: Define GradeDefence interface
}

