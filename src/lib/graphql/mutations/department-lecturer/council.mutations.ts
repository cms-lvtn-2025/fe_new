import { gql } from "@apollo/client"

/**
 * Mutation để tạo hội đồng
 * Department Lecturer có quyền tạo hội đồng cho khoa mình
 */
export const CREATE_COUNCIL = gql`
  mutation CreateCouncil($input: CreateCouncilInput!) {
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
`

/**
 * Mutation để cập nhật hội đồng của khoa
 */
export const UPDATE_DEPARTMENT_COUNCIL = gql`
  mutation UpdateDepartmentCouncil($id: ID!, $input: UpdateCouncilInput!) {
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
`

/**
 * Mutation để thêm thành viên vào hội đồng (Defence)
 */
export const ADD_DEFENCE_TO_COUNCIL = gql`
  mutation AddDefenceToCouncil($input: CreateDefenceInput!) {
    addDefenceToCouncil(input: $input) {
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
`

/**
 * Mutation để xóa thành viên khỏi hội đồng
 */
export const REMOVE_DEFENCE_FROM_COUNCIL = gql`
  mutation RemoveDefenceFromCouncil($id: ID!) {
    removeDefenceFromCouncil(id: $id)
  }
`
