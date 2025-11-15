import { gql } from "@apollo/client"

/**
 * Query để lấy thông tin profile của giáo viên
 */
export const GET_MY_TEACHER_PROFILE = gql`
  query GetMyTeacherProfile {
    getMyTeacherProfile {
      id
      email
      username
      gender
      majorCode
      semesterCode
      createdAt
      updatedAt
      roles {
        id
        title
        role
        semesterCode
        activate
      }
    }
  }
`

/**
 * Query để lấy danh sách topic councils mà giáo viên hướng dẫn
 */
export const GET_MY_SUPERVISED_TOPIC_COUNCILS = gql`
  query GetMySupervisedTopicCouncils($search: SearchRequestInput) {
    getMySupervisedTopicCouncils(search: $search) {
      total
      data {
        id
        teacherSupervisorCode
        topicCouncilCode
        createdAt
        updatedAt
        topicCouncil {
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
            majorCode
            semesterCode
            status
            percentStage1
            percentStage2
            major {
              id
              title
              facultyCode
            }
            semester {
              id
              title
            }
          }
          enrollments {
            id
            title
            studentCode
            topicCouncilCode
            finalCode
            gradeReviewCode
            midtermCode
            student {
              id
              email
              username
              gender
              majorCode
              classCode
            }
            midterm {
              id
              title
              grade
              status
              feedback
            }
            final {
              id
              title
              supervisorGrade
              departmentGrade
              finalGrade
              status
              notes
            }
          }
          supervisors {
            id
            teacherSupervisorCode
            teacher {
              id
              email
              username
              gender
            }
          }
        }
      }
    }
  }
`

/**
 * Query để lấy danh sách defence assignments của giáo viên
 */
export const GET_MY_DEFENCES = gql`
  query GetMyDefences($search: SearchRequestInput) {
    getMyDefences(search: $search) {
      total
      data {
        id
        title
        councilCode
        teacherCode
        position
        createdAt
        updatedAt
        council {
          id
          title
          majorCode
          semesterCode
          timeStart
        }
        teacher {
          id
          email
          username
          gender
        }
        gradeDefences {
          id
          defenceCode
          enrollmentCode
          note
          totalScore
          criteria {
            id
            name
            score
            maxScore
          }
        }
      }
    }
  }
`

/**
 * Query để lấy danh sách grade reviews của giáo viên
 */
export const GET_MY_GRADE_REVIEWS = gql`
  query GetMyGradeReviews($search: SearchRequestInput) {
    getMyGradeReviews(search: $search) {
      total
      data {
        id
        title
        teacherCode
        reviewGrade
        status
        notes
        completionDate
        createdAt
        updatedAt
        enrollment {
          id
          title
          studentCode
          topicCouncilCode
          student {
            id
            email
            username
            gender
            majorCode
          }
          topicCouncil {
            id
            title
            stage
            topicCode
            topic {
              id
              title
              status
              majorCode
            }
          }
          midterm {
            id
            title
            grade
            status
          }
          final {
            id
            title
            supervisorGrade
            departmentGrade
            finalGrade
            status
          }
        }
      }
    }
  }
`
