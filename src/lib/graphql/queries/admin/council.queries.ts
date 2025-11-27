import { gql } from "@apollo/client"

/**
 * Admin (Affair) - Council Queries
 * Updated for Backend Schema v2 - Namespace-based approach
 */

/**
 * Query để lấy danh sách councils
 * OPTIMIZED: Only fetches fields needed for table/list display
 * Displays: id, title, majorCode, semesterCode, timeStart, defences (minimal), topicCouncils (minimal)
 * Removed: createdAt, updatedAt, detailed teacher info (not displayed in list)
 */
export const GET_ALL_COUNCILS = gql`
  query GetAllCouncils($search: SearchRequestInput!) {
    affair {
      councils(search: $search) {
        total
        data {
          id
          title
          majorCode
          semesterCode
          timeStart
          defences {
            id
            position
            teacher {
              id
              username
            }
          }
          topicCouncils {
            id
            stage
          }
        }
      }
    }
  }
`

/**
 * Query để lấy chi tiết council (dùng councils với filter theo ID)
 * Lấy đầy đủ data bao gồm defences, topicCouncils, enrollments, grades
 */
export const GET_COUNCIL_DETAIL = gql`
  query GetCouncilDetail($search: SearchRequestInput!) {
    affair {
      councils(search: $search) {
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
  }
`

/**
 * Query để lấy danh sách defences theo council
 */
export const GET_DEFENCES_BY_COUNCIL = gql`
  query GetDefencesByCouncil($councilId: ID!) {
    affair {
      defencesByCouncil(councilId: $councilId) {
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
  }
`

/**
 * Query để lấy lịch bảo vệ cho calendar view
 */
export const GET_DEFENCE_SCHEDULE = gql`
  query GetDefenceSchedule($search: SearchRequestInput!) {
    affair {
      councils(search: $search) {
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
  }
`
