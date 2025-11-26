import { gql } from "@apollo/client"

/**
 * Department Lecturer - Topic Mutations
 * Updated for Backend Schema v2 - Namespace-based approach
 */

/**
 * Mutation để duyệt đề tài (Stage 1)
 * Department Lecturer có quyền duyệt đề tài của khoa mình
 */
export const APPROVE_TOPIC_STAGE1 = gql`
  mutation ApproveTopicStage1($id: ID!) {
    department {
      approveTopicStage1(id: $id) {
        id
        title
        status
        majorCode
        semesterCode
        percentStage1
        percentStage2
        createdAt
        updatedAt
      }
    }
  }
`

/**
 * Mutation để từ chối đề tài (Stage 1)
 * Department Lecturer có quyền từ chối đề tài của khoa mình
 */
export const REJECT_TOPIC_STAGE1 = gql`
  mutation RejectTopicStage1($id: ID!, $reason: String) {
    department {
      rejectTopicStage1(id: $id, reason: $reason) {
        id
        title
        status
        majorCode
        semesterCode
        createdAt
        updatedAt
      }
    }
  }
`
