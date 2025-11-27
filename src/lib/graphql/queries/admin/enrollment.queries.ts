import { gql } from "@apollo/client"

/**
 * Admin (Affair) - Enrollment Queries
 * Updated for Backend Schema v2 - Namespace-based approach
 */

/**
 * Query để lấy danh sách enrollments
 * OPTIMIZED: Only fetches fields needed for table/list display
 * Displays: student info, topicCouncil (minimal), grade summaries
 * Removed: detailed timestamps, full grade details (reserved for detail page)
 */
export const GET_ALL_ENROLLMENTS = gql`
  query GetAllEnrollments($search: SearchRequestInput!) {
    affair {
      enrollments(search: $search) {
        total
        data {
          id
          title
          studentCode
          topicCouncilCode
          student {
            id
            username
            email
            classCode
          }
          topicCouncil {
            id
            title
            stage
          }
          midterm {
            id
            grade
            status
          }
          final {
            id
            finalGrade
            status
          }
        }
      }
    }
  }
`

/**
 * Query để lấy chi tiết enrollment (dùng enrollments với filter theo ID)
 * Lấy đầy đủ data bao gồm student, topicCouncil, grades, gradeDefences
 */
export const GET_ENROLLMENT_DETAIL = gql`
  query GetEnrollmentDetail($search: SearchRequestInput!) {
    affair {
      enrollments(search: $search) {
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
    }
  }
`
