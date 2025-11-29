import { gql } from "@apollo/client"

/**
 * Department Lecturer - Council Mutations
 * Updated for Backend Schema v2 - Namespace-based approach
 */

/**
 * Mutation để tạo hội đồng
 * Department Lecturer có quyền tạo hội đồng cho khoa mình
 */
export const CREATE_COUNCIL = gql`
  mutation CreateCouncil($input: CreateCouncilInput!) {
    department {
      createCouncil(input: $input) {
        id
        title
        majorCode
        semesterCode
        timeStart
        createdAt
        updatedAt
      }
    }
  }
`

/**
 * Mutation để cập nhật hội đồng của khoa
 */
export const UPDATE_DEPARTMENT_COUNCIL = gql`
  mutation UpdateDepartmentCouncil($id: ID!, $input: UpdateCouncilInput!) {
    department {
      updateDepartmentCouncil(id: $id, input: $input) {
        id
        title
        majorCode
        semesterCode
        timeStart
        createdAt
        updatedAt
      }
    }
  }
`

/**
 * Mutation để thêm thành viên vào hội đồng (Defence)
 */
export const ADD_DEFENCE_TO_COUNCIL = gql`
  mutation AddDefenceToCouncil($input: CreateDefenceInput!) {
    department {
      addDefence(input: $input) {
        id
        title
        councilCode
        teacherCode
        position
        createdAt
        updatedAt
        teacher {
          id
          email
          username
          gender
        }
      }
    }
  }
`

/**
 * Mutation để xóa thành viên khỏi hội đồng
 */
export const REMOVE_DEFENCE_FROM_COUNCIL = gql`
  mutation RemoveDefenceFromCouncil($id: ID!) {
    department {
      removeDefence(id: $id) 
    }
  }
`

/**
 * Mutation để gán topic vào hội đồng
 */
export const ASSIGN_TOPIC_TO_COUNCIL = gql`
  mutation AssignTopicToCouncil($topicCouncilId: ID!, $councilId: ID!) {
    department {
      assignTopicToCouncil(topicCouncilId: $topicCouncilId, councilId: $councilId) {
        id
        title
        topicCode
        councilCode
        stage
        timeStart
        timeEnd
        createdAt
        updatedAt
        createdBy
        updatedBy
      }
    }
  }
`

/**
 * Mutation để xóa topic khỏi hội đồng
 */
export const REMOVE_TOPIC_FROM_COUNCIL = gql`
  mutation RemoveTopicFromCouncil($topicCouncilId: ID!, $councilId: ID!) {
    department {
      removeTopicFromCouncil(topicCouncilId: $topicCouncilId, councilId: $councilId)
    }
  }
`
