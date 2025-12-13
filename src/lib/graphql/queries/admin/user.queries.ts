import { gql } from "@apollo/client";

/**
 * Admin (Affair) - User Queries
 * Updated for Backend Schema v2 - Namespace-based approach
 */

/**
 * Query để lấy danh sách giáo viên
 * OPTIMIZED: Only fetches fields needed for table display
 * Table columns: id, username, email, gender, majorCode
 */
export const GET_LIST_TEACHERS = gql`
  query GetListTeachers($search: SearchRequestInput!) {
    affair {
      teachers(search: $search) {
        total
        data {
          id
          email
          msgv
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
  }
`;

/**
 * Query để lấy danh sách sinh viên
 * OPTIMIZED: Only fetches fields needed for table display
 * Table columns: id, username, email, phone, classCode, majorCode
 */
export const GET_LIST_STUDENTS = gql`
  query GetListStudents($search: SearchRequestInput!) {
    affair {
      students(search: $search) {
        total
        data {
          id
          email
          phone
          mssv
          username
          majorCode
          classCode
          semesterCode
          createdAt
          updatedAt
          gender
        }
      }
    }
  }
`;

/**
 * Query để lấy chi tiết sinh viên (dùng students với filter theo ID)
 * Lấy đầy đủ data bao gồm enrollments, grades
 */
export const GET_STUDENT_DETAIL = gql`
  query GetStudentDetail(
    $search_student: SearchRequestInput!
    $search_enrollment: SearchRequestInput!
  ) {
    affair {
      students(search: $search_student) {
        total
        data {
          id
          mssv
          email
          phone
          username
          gender
          majorCode
          classCode
          semesterCode
          createdAt
          updatedAt
          createdBy
          updatedBy
        }
      }
      enrollments(search: $search_enrollment) {
        total
        data {
          id
          title
          studentCode
          topicCouncilCode
          finalCode
          midtermCode
          createdAt
          updatedAt
          topicCouncil {
            topicCode
          }
          midterm {
            id
            title
            grade
            status
            feedback
            createdAt
            updatedAt
            createdBy
            updatedBy
          }
          final {
            id
            title
            supervisorGrade
            departmentGrade
            finalGrade
            status
            notes
            completionDate
            createdAt
            updatedAt
            createdBy
            updatedBy
          }
          
        }
      }
    }
  }
`;

/**
 * Query để lấy chi tiết giáo viên (dùng teachers với filter theo ID)
 * Lấy đầy đủ data bao gồm roles
 */
export const GET_TEACHER_DETAIL = gql`
  query GetTeacherDetail($search: SearchRequestInput!) {
    affair {
      teachers(search: $search) {
        total
        data {
          id
          msgv
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
  }
`;
