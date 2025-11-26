import { gql } from "@apollo/client"

/**
 * Admin (Affair) - Council Mutations
 * Updated for Backend Schema v2 - Namespace-based approach
 */

// ============================================
// COUNCIL MANAGEMENT
// ============================================

export const APPROVE_COUNCIL = gql`
  mutation ApproveCouncil($id: ID!, $timeStart: Time!) {
    affair {
      approveCouncil(id: $id, timeStart: $timeStart) {
        id
        title
        timeStart
      }
    }
  }
`

export const UPDATE_COUNCIL = gql`
  mutation UpdateCouncil($id: ID!, $input: UpdateCouncilInput!) {
    affair {
      updateCouncil(id: $id, input: $input) {
        id
        title
        timeStart
      }
    }
  }
`

export const DELETE_COUNCIL = gql`
  mutation DeleteCouncil($id: ID!) {
    affair {
      deleteCouncil(id: $id)
    }
  }
`
