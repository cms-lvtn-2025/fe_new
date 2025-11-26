import { gql } from "@apollo/client"

/**
 * Query để lấy thông tin profile của giáo viên
 * Updated for Backend Schema v2 - Namespace-based approach
 */
export const GET_MY_TEACHER_PROFILE = gql`
  query GetMyTeacherProfile {
    teacher {
      me {
        id
        email
        username
        gender
        majorCode
        semesterCode
        msgv
        createdAt
        updatedAt
        roles {
          id
          title
          role
          semesterCode
          activate
        }
      }
    }
  }
`
