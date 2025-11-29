import { gql } from "@apollo/client"

/**
 * Query để lấy danh sách enrollments của sinh viên
 * OPTIMIZED: Only fetches fields needed for list display
 * Removed: detailed topic info, council, defences, full grade details
 */
export const GET_MY_ENROLLMENTS = gql`
  query GetMyEnrollments($search: SearchRequestInput) {
    student {
      enrollments(search: $search) {
        total
        data {
          id
          title
          studentCode
          topicCouncilCode
          topicCouncil {
            id
            title
            stage
            topic {
              id
              title
              status
            }
            supervisors {
              id
              teacher {
                id
                username
              }
            }
            council {
              timeStart
            }
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
 * Lấy đầy đủ data bao gồm topicCouncil, midterm, final, gradeReview, gradeDefences
 */
export const GET_MY_ENROLLMENT_DETAIL = gql`
  query GetMyEnrollmentDetail($search: SearchRequestInput!) {
    student {
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
              majorCode
              semesterCode
              status
              percentStage1
              percentStage2
            }
            supervisors {
              id
              teacherSupervisorCode
              teacher {
                id
                email
                username
                gender
                majorCode
              }
            }
          }
          midterm {
            id
            title
            grade
            status
            feedback
            files {
              id
              title
              file
              status
              table
              option
              tableId
            }
          }
          final {
            id
            title
            supervisorGrade
            departmentGrade
            finalGrade
            status
            notes
            files {
              id
              title
              file
              status
              table
              option
              tableId
            }
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
