import { gql } from "@apollo/client"

/**
 * Query để lấy thông tin profile của sinh viên
 */
export const GET_MY_PROFILE = gql`
  query GetMyProfile {
    getMyProfile {
      id
      email
      phone
      username
      gender
      majorCode
      classCode
      semesterCode
      createdAt
      updatedAt
    }
  }
`

/**
 * Query để lấy danh sách enrollments của sinh viên
 */
export const GET_MY_ENROLLMENTS = gql`
  query GetMyEnrollments($search: SearchRequestInput) {
    getMyEnrollments(search: $search) {
      total
      data {
        id
        title
        studentCode
        topicCouncilCode
        finalCode
        gradeReviewCode
        midtermCode
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
          supervisors {
            id
            teacherSupervisorCode
            teacher {
              id
              email
              username
              gender
              majorCode
            }
          }
          council {
            id
            title
            majorCode
            semesterCode
            timeStart
            defences {
              id
              title
              teacher_code
              position
              teacher {
                id
                email
                username
                gender
                majorCode
              }
            }
          }
        }
        midterm {
          id
          title
          grade
          status
          feedback
          createdAt
          updatedAt
        }
        final {
          id
          title
          supervisorGrade
          departmentGrade
          finalGrade
          status
          notes
          completionDate
        }
        gradeReview {
          id
          title
          reviewGrade
          teacherCode
          status
          notes
          completionDate
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
          defence {
            id
            title
            teacher_code
            position
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
 * Query để lấy chi tiết enrollment
 */
export const GET_MY_ENROLLMENT_DETAIL = gql`
  query GetMyEnrollmentDetail($id: ID!) {
    getMyEnrollmentDetail(id: $id) {
      id
      title
      studentCode
      topicCouncilCode
      finalCode
      gradeReviewCode
      midtermCode
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
        }
        supervisors {
          id
          teacherSupervisorCode
          teacher {
            id
            email
            username
            gender
            majorCode
          }
        }
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
      gradeReview {
        id
        title
        reviewGrade
        status
        notes
      }
      gradeDefences {
        id
        defenceCode
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
`

/**
 * Query để lấy danh sách semesters của sinh viên
 */
export const GET_MY_SEMESTERS = gql`
  query GetMySemesters($search: SearchRequestInput) {
    getMySemesters(search: $search) {
      total
      data {
        id
        title
        createdAt
        updatedAt
      }
    }
  }
`
