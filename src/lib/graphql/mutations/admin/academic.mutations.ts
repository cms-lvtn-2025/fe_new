import { gql } from "@apollo/client"

/**
 * Admin (Affair) - Academic Mutations
 * Updated for Backend Schema v2 - Namespace-based approach
 */

// ============================================
// SEMESTER MANAGEMENT
// ============================================

export const CREATE_SEMESTER = gql`
  mutation CreateSemester($input: CreateSemesterInput!) {
    affair {
      createSemester(input: $input) {
        id
        title
      }
    }
  }
`

export const UPDATE_SEMESTER = gql`
  mutation UpdateSemester($id: ID!, $input: UpdateSemesterInput!) {
    affair {
      updateSemester(id: $id, input: $input) {
        id
        title
      }
    }
  }
`

export const DELETE_SEMESTER = gql`
  mutation DeleteSemester($id: ID!) {
    affair {
      deleteSemester(id: $id)
    }
  }
`

// ============================================
// MAJOR MANAGEMENT
// ============================================

export const CREATE_MAJOR = gql`
  mutation CreateMajor($input: CreateMajorInput!) {
    affair {
      createMajor(input: $input) {
        id
        title
        facultyCode
      }
    }
  }
`

export const UPDATE_MAJOR = gql`
  mutation UpdateMajor($id: ID!, $input: UpdateMajorInput!) {
    affair {
      updateMajor(id: $id, input: $input) {
        id
        title
        facultyCode
      }
    }
  }
`

export const DELETE_MAJOR = gql`
  mutation DeleteMajor($id: ID!) {
    affair {
      deleteMajor(id: $id)
    }
  }
`

// ============================================
// FACULTY MANAGEMENT
// ============================================

export const CREATE_FACULTY = gql`
  mutation CreateFaculty($input: CreateFacultyInput!) {
    affair {
      createFaculty(input: $input) {
        id
        title
      }
    }
  }
`

export const UPDATE_FACULTY = gql`
  mutation UpdateFaculty($id: ID!, $input: UpdateFacultyInput!) {
    affair {
      updateFaculty(id: $id, input: $input) {
        id
        title
      }
    }
  }
`

export const DELETE_FACULTY = gql`
  mutation DeleteFaculty($id: ID!) {
    affair {
      deleteFaculty(id: $id)
    }
  }
`
