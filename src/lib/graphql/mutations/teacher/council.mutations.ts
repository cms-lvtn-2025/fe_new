import { gql } from "@apollo/client"

/**
 * Teacher Council Member - Grading Mutations
 * Updated for Backend Schema v2 - Namespace-based approach
 */

/**
 * Mutation để tạo grade defence mới
 * Council member tạo grade defence cho sinh viên trong hội đồng
 */
export const CREATE_GRADE_DEFENCE = gql`
  mutation CreateGradeDefence($input: CreateGradeDefenceInput!) {
    teacher {
      council {
        createGradeDefence(input: $input) {
          id
          defenceCode
          enrollmentCode
          note
          totalScore
          createdAt
          updatedAt
        }
      }
    }
  }
`

/**
 * Mutation để cập nhật grade defence
 */
export const UPDATE_GRADE_DEFENCE = gql`
  mutation UpdateGradeDefence($id: ID!, $input: UpdateGradeDefenceInput!) {
    teacher {
      council {
        updateGradeDefence(id: $id, input: $input) {
          id
          defenceCode
          enrollmentCode
          note
          totalScore
          createdAt
          updatedAt
        }
      }
    }
  }
`

/**
 * Mutation để thêm criterion vào grade defence
 */
export const ADD_CRITERION = gql`
  mutation AddCriterion($input: CreateGradeDefenceCriterionInput!) {
    teacher {
      council {
        addCriterion(input: $input) {
          id
          gradeDefenceCode
          name
          score
          maxScore
          createdAt
          updatedAt
        }
      }
    }
  }
`

/**
 * Mutation để cập nhật criterion
 */
export const UPDATE_CRITERION = gql`
  mutation UpdateCriterion($id: ID!, $input: UpdateGradeDefenceCriterionInput!) {
    teacher {
      council {
        updateCriterion(id: $id, input: $input) {
          id
          gradeDefenceCode
          name
          score
          maxScore
          createdAt
          updatedAt
        }
      }
    }
  }
`

/**
 * Mutation để xóa criterion
 */
export const DELETE_CRITERION = gql`
  mutation DeleteCriterion($id: ID!) {
    teacher {
      council {
        deleteCriterion(id: $id)
      }
    }
  }
`
