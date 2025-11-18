import { gql } from "@apollo/client"

/**
 * Query để lấy danh sách giáo viên của khoa (Department Lecturer)
 * Chỉ lấy giáo viên thuộc khoa của department lecturer
 */
export const GET_DEPARTMENT_TEACHERS = gql`
  query GetDepartmentTeachers($search: SearchRequestInput!) {
    getDepartmentTeachers(search: $search) {
      total
      data {
        id
        email
        username
        gender
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
`
