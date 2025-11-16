import { gql } from "@apollo/client"

/**
 * Query để lấy danh sách enrollments
 */
export const GET_ALL_ENROLLMENTS = gql`
  query GetAllEnrollments($search: SearchRequestInput!) {
    getAllEnrollments(search: $search) {
      total
      data {
        id
        title
        studentCode
        topicCouncilCode
        finalCode
        gradeReviewCode
        midtermCode
        createdAt
        updatedAt
        student {
          id
          email
          username
          gender
          majorCode
          classCode
        }
        topicCouncil {
          id
          title
          stage
          topicCode
          councilCode
          timeStart
          timeEnd
        }
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
        }
        gradeReview {
          id
          title
          reviewGrade
          status
        }
      }
    }
  }
`

/**
 * Query để lấy chi tiết enrollment
 */
export const GET_ENROLLMENT_DETAIL = gql`
  query GetEnrollmentDetail($id: ID!) {
    getEnrollmentDetail(id: $id) {
      id
      title
      studentCode
      topicCouncilCode
      finalCode
      gradeReviewCode
      midtermCode
      createdAt
      updatedAt
      student {
        id
        email
        username
        gender
        majorCode
        classCode
      }
      topicCouncil {
        id
        title
        stage
        topicCode
        councilCode
        timeStart
        timeEnd
        topic {
          id
          title
          status
        }
      }
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
      gradeDefences {
        id
        defenceCode
        note
        totalScore
        criteria {
          id
          name
          score
          maxScore
        }
      }
    }
  }
`
