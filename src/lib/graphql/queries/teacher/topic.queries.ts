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
              files {
                id
                title
                file
                status
              }
            }
            enrollments {
              id
              studentCode
              student {
                id
                mssv
                username
                email
              }
            }
            council {
              timeStart
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
              files {
                id
                title
                file
                status
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
                files {
                  id
                  title
                  file
                  status
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
                }
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
