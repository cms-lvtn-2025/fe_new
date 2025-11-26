import { gql } from "@apollo/client"

/**
 * Department Lecturer - Academic Queries
 * Updated for Backend Schema v2 - Namespace-based approach
 */

/**
 * Query để lấy danh sách semesters của khoa
 */
export const GET_DEPARTMENT_SEMESTERS = gql`
  query GetDepartmentSemesters($search: SearchRequestInput!) {
    department {
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
 * Query để lấy danh sách majors của khoa
 * Department lecturer chỉ quản lý major của khoa mình
 */
export const GET_DEPARTMENT_MAJORS = gql`
  query GetDepartmentMajors($search: SearchRequestInput!) {
    department {
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
export const GET_DEPARTMENT_FACULTIES = gql`
  query GetDepartmentFaculties($search: SearchRequestInput!) {
    department {
      faculties(search: $search) {
        total
        data {
          id
          title
          createdAt
          updatedAt
          majors {
            id
            title
            facultyCode
          }
        }
      }
    }
  }
`
