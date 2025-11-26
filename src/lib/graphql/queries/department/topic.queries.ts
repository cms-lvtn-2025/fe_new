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
        }
      }
    }
  }
`

/**
 * Query để lấy chi tiết topic (dùng topics với filter theo ID)
 * Lấy đầy đủ data bao gồm major, semester, topicCouncils
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
