import { gql } from "@apollo/client"

/**
 * Query để lấy danh sách defence assignments của giáo viên
 * Updated for Backend Schema v2 - Namespace-based approach
 */
export const GET_MY_DEFENCES = gql`
  query GetMyDefences($search: SearchRequestInput) {
    teacher {
      council {
        defences(search: $search) {
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
    }
  }
`

/**
 * Query để lấy chi tiết defence (dùng defences với filter theo ID)
 * Lấy đầy đủ data bao gồm council, gradeDefences
 */
export const GET_DEFENCE_DETAIL = gql`
  query GetDefenceDetail($search: SearchRequestInput!) {
    teacher {
      council {
        defences(search: $search) {
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
              topicCouncils {
                id
                title
                topicCode
                councilCode
                stage
                timeStart
                timeEnd
                enrollments {
                  id
                  title
                  studentCode
                  topicCouncilCode
                  student {
                    id
                    email
                    username
                    mssv
                  }
                }
              }
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
              enrollment {
                id
                title
                studentCode
                student {
                  id
                  email
                  username
                  mssv
                }
              }
            }
          }
        }
      }
    }
  }
`

