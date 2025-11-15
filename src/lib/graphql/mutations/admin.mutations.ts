import { gql } from "@apollo/client"

// ============================================
// TEACHER MANAGEMENT
// ============================================

export const CREATE_TEACHER = gql`
  mutation CreateTeacher($input: CreateTeacherInput!) {
    createTeacher(input: $input) {
      id
      email
      username
      gender
      majorCode
      semesterCode
    }
  }
`

export const UPDATE_TEACHER = gql`
  mutation UpdateTeacher($id: ID!, $input: UpdateTeacherInput!) {
    updateTeacher(id: $id, input: $input) {
      id
      email
      username
      gender
      majorCode
      semesterCode
    }
  }
`

export const DELETE_TEACHER = gql`
  mutation DeleteTeacher($id: ID!) {
    deleteTeacher(id: $id)
  }
`

// ============================================
// STUDENT MANAGEMENT
// ============================================

export const CREATE_STUDENT = gql`
  mutation CreateStudent($input: CreateStudentInput!) {
    createStudent(input: $input) {
      id
      email
      phone
      username
      gender
      majorCode
      classCode
      semesterCode
    }
  }
`

export const UPDATE_STUDENT = gql`
  mutation UpdateStudent($id: ID!, $input: UpdateStudentInput!) {
    updateStudent(id: $id, input: $input) {
      id
      email
      phone
      username
      gender
      majorCode
      classCode
      semesterCode
    }
  }
`

export const DELETE_STUDENT = gql`
  mutation DeleteStudent($id: ID!) {
    deleteStudent(id: $id)
  }
`

// ============================================
// SEMESTER MANAGEMENT
// ============================================

export const CREATE_SEMESTER = gql`
  mutation CreateSemester($input: CreateSemesterInput!) {
    createSemester(input: $input) {
      id
      title
    }
  }
`

export const UPDATE_SEMESTER = gql`
  mutation UpdateSemester($id: ID!, $input: UpdateSemesterInput!) {
    updateSemester(id: $id, input: $input) {
      id
      title
    }
  }
`

export const DELETE_SEMESTER = gql`
  mutation DeleteSemester($id: ID!) {
    deleteSemester(id: $id)
  }
`

// ============================================
// MAJOR MANAGEMENT
// ============================================

export const CREATE_MAJOR = gql`
  mutation CreateMajor($input: CreateMajorInput!) {
    createMajor(input: $input) {
      id
      title
      facultyCode
    }
  }
`

export const UPDATE_MAJOR = gql`
  mutation UpdateMajor($id: ID!, $input: UpdateMajorInput!) {
    updateMajor(id: $id, input: $input) {
      id
      title
      facultyCode
    }
  }
`

export const DELETE_MAJOR = gql`
  mutation DeleteMajor($id: ID!) {
    deleteMajor(id: $id)
  }
`

// ============================================
// FACULTY MANAGEMENT
// ============================================

export const CREATE_FACULTY = gql`
  mutation CreateFaculty($input: CreateFacultyInput!) {
    createFaculty(input: $input) {
      id
      title
    }
  }
`

export const UPDATE_FACULTY = gql`
  mutation UpdateFaculty($id: ID!, $input: UpdateFacultyInput!) {
    updateFaculty(id: $id, input: $input) {
      id
      title
    }
  }
`

export const DELETE_FACULTY = gql`
  mutation DeleteFaculty($id: ID!) {
    deleteFaculty(id: $id)
  }
`

// ============================================
// COUNCIL MANAGEMENT
// ============================================

export const APPROVE_COUNCIL = gql`
  mutation ApproveCouncil($id: ID!, $timeStart: Time!) {
    approveCouncil(id: $id, timeStart: $timeStart) {
      id
      title
      timeStart
    }
  }
`

export const UPDATE_COUNCIL = gql`
  mutation UpdateCouncil($id: ID!, $input: UpdateCouncilInput!) {
    updateCouncil(id: $id, input: $input) {
      id
      title
      timeStart
    }
  }
`

export const DELETE_COUNCIL = gql`
  mutation DeleteCouncil($id: ID!) {
    deleteCouncil(id: $id)
  }
`

// ============================================
// TOPIC MANAGEMENT
// ============================================

export const APPROVE_TOPIC = gql`
  mutation ApproveTopic($id: ID!) {
    approveTopic(id: $id) {
      id
      title
      status
    }
  }
`

export const REJECT_TOPIC = gql`
  mutation RejectTopic($id: ID!, $reason: String) {
    rejectTopic(id: $id, reason: $reason) {
      id
      title
      status
    }
  }
`

export const UPDATE_TOPIC = gql`
  mutation UpdateTopic($id: ID!, $input: UpdateTopicInput!) {
    updateTopic(id: $id, input: $input) {
      id
      title
      status
      percentStage1
      percentStage2
    }
  }
`

export const DELETE_TOPIC = gql`
  mutation DeleteTopic($id: ID!) {
    deleteTopic(id: $id)
  }
`
