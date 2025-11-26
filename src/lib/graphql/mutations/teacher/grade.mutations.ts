import { gql } from "@apollo/client"

/**
 * Teacher Supervisor Mutations - Grading
 * Updated for Backend Schema v2 - Namespace-based approach
 */

// ============================================
// SUPERVISOR GRADING MUTATIONS
// ============================================

/**
 * Mutation để chấm điểm midterm cho sinh viên
 */
export const GRADE_MIDTERM = gql`
  mutation GradeMidterm($enrollmentId: ID!, $input: GradeMidtermInput!) {
    teacher {
      supervisor {
        gradeMidterm(enrollmentId: $enrollmentId, input: $input) {
          id
          title
          grade
          status
          feedback
          createdAt
          updatedAt
        }
      }
    }
  }
`

/**
 * Mutation để phản hồi midterm cho sinh viên
 */
export const FEEDBACK_MIDTERM = gql`
  mutation FeedbackMidterm($midtermId: ID!, $feedback: String!) {
    teacher {
      supervisor {
        feedbackMidterm(midtermId: $midtermId, feedback: $feedback) {
          id
          title
          grade
          status
          feedback
          updatedAt
        }
      }
    }
  }
`

/**
 * Mutation để chấm điểm final cho sinh viên
 */
export const GRADE_FINAL = gql`
  mutation GradeFinal($enrollmentId: ID!, $input: GradeFinalInput!) {
    teacher {
      supervisor {
        gradeFinal(enrollmentId: $enrollmentId, input: $input) {
          id
          title
          supervisorGrade
          departmentGrade
          finalGrade
          status
          notes
          completionDate
          createdAt
          updatedAt
        }
      }
    }
  }
`

/**
 * Mutation để phản hồi final cho sinh viên
 */
export const FEEDBACK_FINAL = gql`
  mutation FeedbackFinal($finalId: ID!, $notes: String!) {
    teacher {
      supervisor {
        feedbackFinal(finalId: $finalId, notes: $notes) {
          id
          title
          supervisorGrade
          departmentGrade
          finalGrade
          status
          notes
          updatedAt
        }
      }
    }
  }
`

/**
 * Mutation để phê duyệt file midterm của sinh viên
 */
export const APPROVE_MIDTERM_FILE = gql`
  mutation ApproveMidtermFile($fileId: ID!) {
    teacher {
      supervisor {
        approveMidtermFile(fileId: $fileId) {
          id
          title
          file
          status
          table
          option
          tableId
          updatedAt
        }
      }
    }
  }
`

/**
 * Mutation để từ chối file midterm của sinh viên
 */
export const REJECT_MIDTERM_FILE = gql`
  mutation RejectMidtermFile($fileId: ID!, $reason: String) {
    teacher {
      supervisor {
        rejectMidtermFile(fileId: $fileId, reason: $reason) {
          id
          title
          file
          status
          table
          option
          tableId
          updatedAt
        }
      }
    }
  }
`

/**
 * Mutation để phê duyệt file final của sinh viên
 */
export const APPROVE_FINAL_FILE = gql`
  mutation ApproveFinalFile($fileId: ID!) {
    teacher {
      supervisor {
        approveFinalFile(fileId: $fileId) {
          id
          title
          file
          status
          table
          option
          tableId
          updatedAt
        }
      }
    }
  }
`

/**
 * Mutation để từ chối file final của sinh viên
 */
export const REJECT_FINAL_FILE = gql`
  mutation RejectFinalFile($fileId: ID!, $reason: String) {
    teacher {
      supervisor {
        rejectFinalFile(fileId: $fileId, reason: $reason) {
          id
          title
          file
          status
          table
          option
          tableId
          updatedAt
        }
      }
    }
  }
`

// ============================================
// COUNCIL MEMBER GRADING MUTATIONS
// ============================================

/**
 * Mutation để tạo grade defence mới
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
          updatedAt
        }
      }
    }
  }
`

/**
 * Mutation để thêm criterion vào grade defence
 */
export const ADD_GRADE_DEFENCE_CRITERION = gql`
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
export const UPDATE_GRADE_DEFENCE_CRITERION = gql`
  mutation UpdateCriterion($id: ID!, $input: UpdateGradeDefenceCriterionInput!) {
    teacher {
      council {
        updateCriterion(id: $id, input: $input) {
          id
          gradeDefenceCode
          name
          score
          maxScore
          updatedAt
        }
      }
    }
  }
`

/**
 * Mutation để xóa criterion
 */
export const DELETE_GRADE_DEFENCE_CRITERION = gql`
  mutation DeleteCriterion($id: ID!) {
    teacher {
      council {
        deleteCriterion(id: $id)
      }
    }
  }
`

// ============================================
// REVIEWER GRADING MUTATIONS
// ============================================

/**
 * Mutation để cập nhật grade review
 */
export const UPDATE_GRADE_REVIEW = gql`
  mutation UpdateGradeReview($id: ID!, $input: UpdateGradeReviewInput!) {
    teacher {
      reviewer {
        updateGradeReview(id: $id, input: $input) {
          id
          title
          reviewGrade
          teacherCode
          status
          notes
          completionDate
          updatedAt
        }
      }
    }
  }
`

/**
 * Mutation để hoàn thành grade review
 */
export const COMPLETE_GRADE_REVIEW = gql`
  mutation CompleteGradeReview($id: ID!) {
    teacher {
      reviewer {
        completeGradeReview(id: $id) {
          id
          title
          reviewGrade
          teacherCode
          status
          notes
          completionDate
          updatedAt
        }
      }
    }
  }
`
