import { gql } from "@apollo/client"

/**
 * Department Lecturer - Teacher Queries
 * Updated for Backend Schema v2 - Namespace-based approach
 */

/**
 * Query để lấy danh sách giáo viên của khoa (Department Lecturer)
 * Chỉ lấy giáo viên thuộc khoa của department lecturer
 */
export const GET_DEPARTMENT_TEACHERS = gql`
  query GetDepartmentTeachers($search: SearchRequestInput!) {
    department {
      teachers(search: $search) {
        total
        data {
          id
          email
          username
          gender
          msgv
          majorCode
          semesterCode
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
  }
`

/**
 * Query để lấy chi tiết giáo viên (dùng teachers với filter theo ID)
 * Lấy đầy đủ data bao gồm roles
 */
export const GET_DEPARTMENT_TEACHER_DETAIL = gql`
  query GetDepartmentTeacherDetail($search: SearchRequestInput!) {
    department {
      teachers(search: $search) {
        total
        data {
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
  }
`
