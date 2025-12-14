import { gql } from "@apollo/client"

/**
 * Department Lecturer - Topic Queries
 * Updated for Backend Schema v2 - Namespace-based approach
 */

/**
 * OPTIMIZED: Only fetches fields needed for table/list display
 * Removed: percentStage1, percentStage2, createdAt, updatedAt, major, semester
 */
export const GET_DEPARTMENT_TOPICS = gql`
  query GetDepartmentTopics($search: SearchRequestInput!) {
    department {
      topics(search: $search) {
        total
        data {
          id
          title
          majorCode
          semesterCode
          status
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
      }
    }
  }
`

export const GET_DEPARTMENT_TOPICS_FOR_ADDCOUNCIL = gql`
  query GetDepartmentTopics($search: SearchRequestInput!) {
    department {
      topics(search: $search) {
        total
        data {
          id
          title
          majorCode
          semesterCode
          status
          topicCouncils {
            id
            title
            stage
            topicCode
            councilCode
            timeStart
            timeEnd
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
export const GET_DEPARTMENT_TOPIC_DETAIL = gql`
  query GetDepartmentTopicDetail($search: SearchRequestInput!) {
    department {
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
