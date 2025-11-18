import { gql } from "@apollo/client"

/**
 * Query để lấy danh sách sinh viên của khoa (Department Lecturer)
 * Chỉ lấy sinh viên thuộc khoa của department lecturer
 */
export const GET_DEPARTMENT_STUDENTS = gql`
  query GetDepartmentStudents($search: SearchRequestInput!) {
    getDepartmentStudents(search: $search) {
      total
      data {
        id
        email
        phone
        username
        gender
        majorCode
        classCode
        semesterCode
        createdAt
        updatedAt
      }
    }
  }
`
