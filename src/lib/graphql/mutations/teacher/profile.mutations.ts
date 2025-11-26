import { gql } from "@apollo/client"

/**
 * Mutation để cập nhật profile giáo viên
 * Updated for Backend Schema v2 - Namespace-based approach
 */
export const UPDATE_MY_TEACHER_PROFILE = gql`
  mutation UpdateMyTeacherProfile($input: UpdateTeacherProfileInput!) {
    teacher {
      updateProfile(input: $input) {
        id
        email
        username
        gender
        majorCode
        semesterCode
        msgv
        updatedAt
      }
    }
  }
`
