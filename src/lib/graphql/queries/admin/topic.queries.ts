import { gql } from "@apollo/client"

/**
 * Admin (Affair) - Topic Queries
 * Updated for Backend Schema v2 - Namespace-based approach
 */

/**
 * Query để lấy danh sách topics
 * OPTIMIZED: Only fetches fields needed for table display
 * Table columns: id, title, supervisors (from topicCouncils), status, stage (from topicCouncils)
 * Removed: files, enrollments, grades, defences (not displayed in table)
 */
export const GET_ALL_TOPICS = gql`
  query GetAllTopics($search: SearchRequestInput!) {
    affair {
      topics(search: $search) {
        total
        data {
          id
          title
          status
          topicCouncils {
            id
            stage
            supervisors {
              id
              teacherSupervisorCode
              teacher {
                id
                username
              }
            }
          }
        }
      }
    }
  }
`

/**
 * Query để lấy danh sách topic councils chưa được gán hội đồng
 */
export const GET_UNASSIGNED_TOPIC_COUNCILS = gql`
  query GetUnassignedTopicCouncils($search: SearchRequestInput!) {
    affair {
      topics(search: $search) {
        total
        data {
          id
          title
          majorCode
          semesterCode
          topicCouncils {
            id
            title
            stage
            topicCode
            councilCode
            timeStart
            timeEnd
            enrollments {
              id
              studentCode
              student {
                id
                username
              }
            }
            supervisors {
              id
              teacherSupervisorCode
              teacher {
                id
                username
              }
            }
          }
        }
      }
    }
  }
`

/**
 * Query để lấy chi tiết topic (dùng topics với filter theo ID)
 * Lấy đầy đủ data bao gồm files, topicCouncils, enrollments, grades
 */
export const GET_TOPIC_DETAIL = gql`
  query GetTopicDetail($search: SearchRequestInput!) {
    affair {
      topics(search: $search) {
        total
        data {
          id
          title
          majorCode
          semesterCode
          status
          percentStage1
          percentStage2
          createdAt
          updatedAt
          files {
            id
            title
            file
            status
            table
            option
            tableId
          }
          topicCouncils {
            id
            title
            stage
            topicCode
            councilCode
            timeStart
            timeEnd
            enrollments {
              id
              title
              studentCode
              student {
                id
                username
                email
              }
              midterm {
                id
                grade
                status
                feedback
              }
              final {
                id
                supervisorGrade
                departmentGrade
                finalGrade
                status
                notes
              }
              gradeReview {
                id
                reviewGrade
                status
                notes
              }
              gradeDefences {
                id
                totalScore
                note
                defence {
                  id
                  position
                  teacher {
                    id
                    username
                    email
                  }
                }
                criteria {
                  id
                  name
                  score
                  maxScore
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
              }
            }
          }
        }
      }
    }
  }
`
