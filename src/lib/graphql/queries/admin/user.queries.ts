import { gql } from "@apollo/client"

/**
 * Query để lấy danh sách giáo viên
 */
export const GET_LIST_TEACHERS = gql`
  query GetListTeachers($search: SearchRequestInput!) {
    getListTeachers(search: $search) {
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

/**
 * Query để lấy danh sách sinh viên
 */
export const GET_LIST_STUDENTS = gql`
  query GetListStudents($search: SearchRequestInput!) {
    getListStudents(search: $search) {
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

/**
 * Query để lấy chi tiết sinh viên
 */
export const GET_STUDENT_DETAIL = gql`
  query GetStudentDetail($id: ID!) {
    getStudentDetail(id: $id) {
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
      createdBy
      updatedBy
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
        gradeReview {
          id
          title
          reviewGrade
          status
          notes
        }
      }
    }
  }
`

/**
 * Query để lấy chi tiết giáo viên
 */
export const GET_TEACHER_DETAIL = gql`
  query GetTeacherDetail($id: ID!) {
    getTeacherDetail(id: $id) {
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
`
