import { gql } from "@apollo/client"

/**
 * Mutation để duyệt đề tài (Stage 1)
 * Department Lecturer có quyền duyệt đề tài của khoa mình
 */
export const APPROVE_TOPIC_STAGE1 = gql`
  mutation ApproveTopicStage1($id: ID!) {
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
`

/**
 * Mutation để từ chối đề tài (Stage 1)
 * Department Lecturer có quyền từ chối đề tài của khoa mình
 */
export const REJECT_TOPIC_STAGE1 = gql`
  mutation RejectTopicStage1($id: ID!, $reason: String) {
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
`

/**
 * Mutation để gán đề tài vào hội đồng
 */
export const ASSIGN_TOPIC_TO_COUNCIL = gql`
  mutation AssignTopicToCouncil($topicCouncilId: ID!, $councilId: ID!) {
    assignTopicToCouncil(topicCouncilId: $topicCouncilId, councilId: $councilId) {
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
      council {
        id
        title
        majorCode
        semesterCode
      }
    }
  }
`
