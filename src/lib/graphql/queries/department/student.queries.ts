import { gql } from "@apollo/client"

/**
 * Department Lecturer - Student Queries
 * Updated for Backend Schema v2 - Namespace-based approach
 */

/**
 * Query để lấy danh sách sinh viên của khoa (Department Lecturer)
 * OPTIMIZED: Only fetches fields needed for table display
 * Removed: phone, gender, semesterCode, createdAt, updatedAt
 */
export const GET_DEPARTMENT_STUDENTS = gql`
  query GetDepartmentStudents($search: SearchRequestInput!) {
    department {
      students(search: $search) {
        total
        data {
          id
          email
          username
          majorCode
          classCode
        }
      }
    }
  }
`

/**
 * Query để lấy chi tiết sinh viên (dùng students với filter theo ID)
 * Lấy đầy đủ data bao gồm enrollments, grades
 */
export const GET_DEPARTMENT_STUDENT_DETAIL = gql`
  query GetDepartmentStudentDetail($search: SearchRequestInput!) {
    department {
      students(search: $search) {
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
          mssv
          createdAt
          updatedAt
          enrollments {
            id
            title
            studentCode
            topicCouncilCode
            finalCode
            gradeReviewCode
            midtermCode
            createdAt
            updatedAt
            midterm {
              id
              title
              grade
              status
              feedback
            }
            final {
              id
              title
              supervisorGrade
              departmentGrade
              finalGrade
              status
              notes
            }
            
          }
        }
      }
    }
  }
`
