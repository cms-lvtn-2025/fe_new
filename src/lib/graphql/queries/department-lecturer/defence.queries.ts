import { gql } from "@apollo/client"

/**
 * Query để lấy lịch bảo vệ của khoa (cho calendar view)
 * Dùng để hiển thị lịch bảo vệ trên calendar
 */
export const GET_DEPARTMENT_DEFENCE_SCHEDULE = gql`
  query GetDepartmentDefenceSchedule($search: SearchRequestInput!) {
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
            username
            email
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
