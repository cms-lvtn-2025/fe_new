import { gql } from "@apollo/client"

/**
 * Query để lấy danh sách đề tài của khoa (Department Lecturer)
 * Chỉ lấy đề tài thuộc khoa của department lecturer
 */
export const GET_DEPARTMENT_TOPICS = gql`
  query GetDepartmentTopics($search: SearchRequestInput!) {
    getDepartmentTopics(search: $search) {
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
        files {
          id
          title
          file
          status
          table
          option
          tableId
          createdAt
        }
        topicCouncils {
        id
        title
        stage
        topicCode
        councilCode
        timeStart
        timeEnd
        enrollments {
          id
          title
          studentCode
          student {
            id
            username
            email
          }
          midterm {
            id
            grade
            status
            feedback
          }
          final {
            id
            supervisorGrade
            departmentGrade
            finalGrade
            status
            notes
          }
          gradeReview {
            id
            reviewGrade
            status
            notes
          }
          gradeDefences {
            id
            totalScore
            note
            defence {
              id
              position
              teacher {
                id
                username
                email
              }
            }
            criteria {
              id
              name
              score
              maxScore
            }
          }
        }
        supervisors {
          id
          teacherSupervisorCode
          teacher {
            id
            email
            username
          }
        }
      }
      }
    }
  }
`

/**
 * Query để lấy chi tiết đề tài của khoa
 */
export const GET_DEPARTMENT_TOPIC_DETAIL = gql`
  query GetDepartmentTopicDetail($id: ID!) {
    getDepartmentTopicDetail(id: $id) {
      id
      title
      majorCode
      semesterCode
      status
      percentStage1
      percentStage2
      createdAt
      updatedAt
      files {
        id
        title
        file
        status
        table
        option
        tableId
      }
      topicCouncils {
        id
        title
        stage
        topicCode
        councilCode
        timeStart
        timeEnd
        enrollments {
          id
          title
          studentCode
          student {
            id
            username
            email
          }
          midterm {
            id
            grade
            status
            feedback
          }
          final {
            id
            supervisorGrade
            departmentGrade
            finalGrade
            status
            notes
          }
          gradeReview {
            id
            reviewGrade
            status
            notes
          }
          gradeDefences {
            id
            totalScore
            note
            defence {
              id
              position
              teacher {
                id
                username
                email
              }
            }
            criteria {
              id
              name
              score
              maxScore
            }
          }
        }
        supervisors {
          id
          teacherSupervisorCode
          teacher {
            id
            email
            username
          }
        }
      }
    }
  }
`

/**
 * Query để lấy danh sách enrollments của khoa
 */
export const GET_DEPARTMENT_ENROLLMENTS = gql`
  query GetDepartmentEnrollments($search: SearchRequestInput!) {
    getDepartmentEnrollments(search: $search) {
      id
      title
      studentCode
      topicCouncilCode
      finalCode
      gradeReviewCode
      midtermCode
      createdAt
      updatedAt
      student {
        id
        username
        email
        phone
        gender
        majorCode
        classCode
      }
    }
  }
`

/**
 * Query để lấy chi tiết enrollment của khoa
 */
export const GET_DEPARTMENT_ENROLLMENT_DETAIL = gql`
  query GetDepartmentEnrollmentDetail($id: ID!) {
    getDepartmentEnrollmentDetail(id: $id) {
      id
      title
      studentCode
      topicCouncilCode
      finalCode
      gradeReviewCode
      midtermCode
      createdAt
      updatedAt
      student {
        id
        username
        email
        phone
        gender
        majorCode
        classCode
      }
    }
  }
`
