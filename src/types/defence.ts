/**
 * Types for Defence Schedule Management
 */

import type { Event } from 'react-big-calendar'

export interface Teacher {
  id: string
  username: string
  email: string
  gender?: string
}

export interface Student {
  id: string
  username: string
  email: string
}

export interface Topic {
  id: string
  title: string
  status?: string
}

export interface Defence {
  id: string
  title: string
  teacherCode: string
  position: DefencePosition
  teacher: Teacher
}

export interface Enrollment {
  id: string
  title?: string
  studentCode: string
  student: Student
}

export interface Supervisor {
  id: string
  teacherSupervisorCode: string
  teacher: Teacher
}

export interface TopicCouncil {
  id: string
  title: string
  stage: TopicStage
  topicCode: string
  councilCode?: string
  timeStart: string
  timeEnd: string
  topic?: Topic
  enrollments: Enrollment[]
  supervisors?: Supervisor[]
}

export interface Council {
  id: string
  title: string
  majorCode: string
  semesterCode: string
  timeStart: string | null
  createdAt?: string
  updatedAt?: string
  defences: Defence[]
  topicCouncils: TopicCouncil[]
}

export type DefencePosition = 'PRESIDENT' | 'SECRETARY' | 'REVIEWER' | 'MEMBER'

export type TopicStage = 'STAGE_DACN' | 'STAGE_LVTN'

export interface DefenceEvent extends Event {
  id: string
  councilId: string
  councilTitle: string
  topicTitle: string
  stage: TopicStage
  students: string[]
  majorCode: string
  resource?: {
    singleDay: boolean
    topicCount: number
    studentCount: number
  }
}
