import { gql } from "@apollo/client"

/**
 * Admin (Affair) - Topic Mutations
 * Updated for Backend Schema v2 - Namespace-based approach
 */

// ============================================
// TOPIC MANAGEMENT
// ============================================

export const APPROVE_TOPIC = gql`
  mutation ApproveTopic($id: ID!) {
    affair {
      approveTopic(id: $id) {
        id
        title
        status
      }
    }
  }
`

export const REJECT_TOPIC = gql`
  mutation RejectTopic($id: ID!, $reason: String) {
    affair {
      rejectTopic(id: $id, reason: $reason) {
        id
        title
        status
      }
    }
  }
`

export const UPDATE_TOPIC = gql`
  mutation UpdateTopic($id: ID!, $input: UpdateTopicInput!) {
    affair {
      updateTopic(id: $id, input: $input) {
        id
        title
        status
        percentStage1
        percentStage2
      }
    }
  }
`

export const DELETE_TOPIC = gql`
  mutation DeleteTopic($id: ID!) {
    affair {
      deleteTopic(id: $id)
    }
  }
`
