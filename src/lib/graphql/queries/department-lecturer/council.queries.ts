import { gql } from "@apollo/client"

/**
 * Query để lấy danh sách hội đồng của khoa (Department Lecturer)
 * Chỉ lấy hội đồng thuộc khoa của department lecturer
 */
export const GET_DEPARTMENT_COUNCILS = gql`
  query GetDepartmentCouncils($search: SearchRequestInput!) {
    getDepartmentCouncils(search: $search) {
      total
      data {
        id
        title
        majorCode
        semesterCode
        timeStart
        createdAt
        updatedAt
        defences {
          id
          title
          teacherCode
          position
          teacher {
            id
            email
            username
          }
        }
        topicCouncils {
          id
          title
          stage
          topicCode
          timeStart
          timeEnd
        }
      }
    }
  }
`

/**
 * Query để lấy chi tiết hội đồng của khoa
 */
export const GET_DEPARTMENT_COUNCIL_DETAIL = gql`
  query GetDepartmentCouncilDetail($id: ID!) {
    getDepartmentCouncilDetail(id: $id) {
      id
      title
      majorCode
      semesterCode
      timeStart
      createdAt
      updatedAt
      defences {
        id
        title
        teacherCode
        position
        teacher {
          id
          email
          username
          gender
        }
      }
      topicCouncils {
        id
        title
        stage
        topicCode
        timeStart
        timeEnd
        topic {
          id
          title
          status
        }
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
            username
            email
          }
        }
      }
    }
  }
`

/**
 * Query để lấy danh sách defences theo council
 */
export const GET_DEPARTMENT_DEFENCES = gql`
  query GetDepartmentDefences($councilId: ID!) {
    getDepartmentDefences(councilId: $councilId) {
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
 * Query để lấy danh sách grade defences của khoa
 */
export const GET_DEPARTMENT_GRADE_DEFENCES = gql`
  query GetDepartmentGradeDefences($search: SearchRequestInput!) {
    getDepartmentGradeDefences(search: $search) {
      id
      defenceCode
      enrollmentCode
      note
      totalScore
      createdAt
      updatedAt
    }
  }
`
