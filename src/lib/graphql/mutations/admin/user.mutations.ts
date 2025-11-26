import { gql } from "@apollo/client"

/**
 * Admin (Affair) - User Mutations
 * Updated for Backend Schema v2 - Namespace-based approach
 */

// ============================================
// TEACHER MANAGEMENT
// ============================================

export const CREATE_TEACHER = gql`
  mutation CreateTeacher($input: CreateTeacherInput!) {
    affair {
      createTeacher(input: $input) {
        id
        email
        username
        gender
        majorCode
        semesterCode
      }
    }
  }
`

export const UPDATE_TEACHER = gql`
  mutation UpdateTeacher($id: ID!, $input: UpdateTeacherInput!) {
    affair {
      updateTeacher(id: $id, input: $input) {
        id
        email
        username
        gender
        majorCode
        semesterCode
      }
    }
  }
`

export const DELETE_TEACHER = gql`
  mutation DeleteTeacher($id: ID!) {
    affair {
      deleteTeacher(id: $id)
    }
  }
`

// ============================================
// STUDENT MANAGEMENT
// ============================================

export const CREATE_STUDENT = gql`
  mutation CreateStudent($input: CreateStudentInput!) {
    affair {
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
  }
`

export const UPDATE_STUDENT = gql`
  mutation UpdateStudent($id: ID!, $input: UpdateStudentInput!) {
    affair {
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
  }
`

export const DELETE_STUDENT = gql`
  mutation DeleteStudent($id: ID!) {
    affair {
      deleteStudent(id: $id)
    }
  }
`
