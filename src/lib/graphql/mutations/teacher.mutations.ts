import { gql } from "@apollo/client"

/**
 * Mutation để cập nhật profile giáo viên
 */
export const UPDATE_MY_TEACHER_PROFILE = gql`
  mutation UpdateMyTeacherProfile($input: UpdateTeacherProfileInput!) {
    updateMyTeacherProfile(input: $input) {
      id
      email
      username
      gender
      majorCode
      semesterCode
    }
  }
`

/**
 * Mutation để chấm điểm midterm
 */
export const GRADE_MIDTERM = gql`
  mutation GradeMidterm($enrollmentId: ID!, $input: GradeMidtermInput!) {
    gradeMidterm(enrollmentId: $enrollmentId, input: $input) {
      id
      title
      grade
      status
      feedback
      updatedAt
    }
  }
`

/**
 * Mutation để chấm điểm final
 */
export const GRADE_FINAL = gql`
  mutation GradeFinal($enrollmentId: ID!, $input: GradeFinalInput!) {
    gradeFinal(enrollmentId: $enrollmentId, input: $input) {
      id
      title
      supervisorGrade
      status
      notes
      updatedAt
    }
  }
`

/**
 * Mutation để tạo grade defence
 */
export const CREATE_GRADE_DEFENCE = gql`
  mutation CreateGradeDefence($input: CreateGradeDefenceInput!) {
    createGradeDefence(input: $input) {
      id
      defenceCode
      enrollmentCode
      note
      totalScore
      createdAt
    }
  }
`

/**
 * Mutation để cập nhật grade defence
 */
export const UPDATE_GRADE_DEFENCE = gql`
  mutation UpdateGradeDefence($id: ID!, $input: UpdateGradeDefenceInput!) {
    updateGradeDefence(id: $id, input: $input) {
      id
      note
      totalScore
      updatedAt
    }
  }
`

/**
 * Mutation để thêm criterion vào grade defence
 */
export const ADD_GRADE_DEFENCE_CRITERION = gql`
  mutation AddGradeDefenceCriterion($input: CreateGradeDefenceCriterionInput!) {
    addGradeDefenceCriterion(input: $input) {
      id
      gradeDefenceCode
      name
      score
      maxScore
      createdAt
    }
  }
`

/**
 * Mutation để cập nhật grade review
 */
export const UPDATE_GRADE_REVIEW = gql`
  mutation UpdateGradeReview($id: ID!, $input: UpdateGradeReviewInput!) {
    updateGradeReview(id: $id, input: $input) {
      id
      reviewGrade
      status
      notes
      updatedAt
    }
  }
`

/**
 * Mutation để tạo/gửi đề tài mới
 */
export const CREATE_TOPIC = gql`
  mutation CreateTopic($input: CreateTopicInput!) {
    createTopic(input: $input) {
      id
      title
      titleEnglish
      description
      status
      majorCode
      semesterCode
      trainingProgram
      startDate
      endDate
      maxStudents
      createdAt
      updatedAt
    }
  }
`
