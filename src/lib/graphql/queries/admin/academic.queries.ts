import { gql } from "@apollo/client"

/**
 * Admin (Affair) - Academic Queries
 * Updated for Backend Schema v2 - Namespace-based approach
 */

/**
 * Query để lấy danh sách semesters
 */
export const GET_ALL_SEMESTERS = gql`
  query GetAllSemesters($search: SearchRequestInput!) {
    affair {
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
`

/**
 * Query để lấy danh sách majors
 */
export const GET_ALL_MAJORS = gql`
  query GetAllMajors($search: SearchRequestInput!) {
    affair {
      majors(search: $search) {
        total
        data {
          id
          ms
          title
          facultyCode
          createdAt
          updatedAt
        }
      }
    }
  }
`

/**
 * Query để lấy danh sách faculties
 */
export const GET_ALL_FACULTIES = gql`
  query GetAllFaculties($search: SearchRequestInput!) {
    affair {
      faculties(search: $search) {
        total
        data {
          id
          ms
          title
          createdAt
          updatedAt
          majors {
            id
            ms
            title
            facultyCode
          }
        }
      }
    }
  }
`
