import { gql } from "@apollo/client"

/**
 * Query để lấy danh sách councils
 */
export const GET_ALL_COUNCILS = gql`
  query GetAllCouncils($search: SearchRequestInput!) {
    getAllCouncils(search: $search) {
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
 * Query để lấy chi tiết council
 */
export const GET_COUNCIL_DETAIL = gql`
  query GetCouncilDetail($id: ID!) {
    getCouncilDetail(id: $id) {
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
        gradeDefences {
          id
          defenceCode
          enrollmentCode
          note
          totalScore
          createdAt
          updatedAt
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
export const GET_DEFENCES_BY_COUNCIL = gql`
  query GetDefencesByCouncil($councilId: ID!) {
    getDefencesByCouncil(councilId: $councilId) {
      total
      data {
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
        gradeDefences {
          total
          data {
            id
            enrolmentCode
            note
            totalScore
          }
        }
      }
    }
  }
`

/**
 * Query để lấy lịch bảo vệ cho calendar view
 */
export const GET_DEFENCE_SCHEDULE = gql`
  query GetDefenceSchedule($search: SearchRequestInput!) {
    getAllCouncils(search: $search) {
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
            username
            email
          }
          gradeDefences {
            id
            defenceCode
            enrollmentCode
            note
            totalScore
            createdAt
            updatedAt
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
  }
`
