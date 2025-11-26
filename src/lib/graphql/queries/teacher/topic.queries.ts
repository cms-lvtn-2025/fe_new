import { gql } from "@apollo/client"

/**
 * Query để lấy danh sách topic councils mà giáo viên hướng dẫn
 * OPTIMIZED: Only fetches fields needed for list display
 * Added: percentStage1, percentStage2 for progress display
 */
export const GET_MY_SUPERVISED_TOPIC_COUNCILS = gql`
  query GetMySupervisedTopicCouncils($search: SearchRequestInput) {
    teacher {
      supervisor {
        topicCouncils(search: $search) {
          total
          data {
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
              percentStage1
              percentStage2
            }
            enrollments {
              id
              studentCode
              student {
                id
                username
                email
              }
            }
          }
        }
      }
    }
  }
`

/**
 * Query để lấy chi tiết topic council (dùng topicCouncils với filter theo ID)
 * Lấy đầy đủ data bao gồm topic, enrollments, supervisors
 */
export const GET_TOPIC_COUNCIL_DETAIL = gql`
  query GetTopicCouncilDetail($search: SearchRequestInput!) {
    teacher {
      supervisor {
        topicCouncils(search: $search) {
          total
          data {
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
              major {
                id
                title
                facultyCode
              }
              semester {
                id
                title
              }
            }
            enrollments {
              id
              title
              studentCode
              topicCouncilCode
              finalCode
              gradeReviewCode
              midtermCode
              student {
                id
                email
                username
                gender
                majorCode
                classCode
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
            }
            supervisors {
              id
              teacherSupervisorCode
              teacher {
                id
                email
                username
                gender
              }
            }
          }
        }
      }
    }
  }
`
