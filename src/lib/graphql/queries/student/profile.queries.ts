import { gql } from "@apollo/client"

/**
 * Query để lấy thông tin profile của sinh viên
 * Updated for Backend Schema v2 - Namespace-based approach
 */
export const GET_MY_PROFILE = gql`
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
`

/**
 * Query để lấy danh sách semesters của sinh viên
 * Updated for Backend Schema v2 - Namespace-based approach
 */
export const GET_MY_SEMESTERS = gql`
  query GetMySemesters($search: SearchRequestInput) {
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
`
