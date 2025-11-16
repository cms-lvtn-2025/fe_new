import { gql } from "@apollo/client"

/**
 * Query để lấy danh sách topics
 */
export const GET_ALL_TOPICS = gql`
  query GetAllTopics($search: SearchRequestInput!) {
    getAllTopics(search: $search) {
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
 * Query để lấy danh sách topic councils chưa được gán hội đồng
 */
export const GET_UNASSIGNED_TOPIC_COUNCILS = gql`
  query GetUnassignedTopicCouncils($search: SearchRequestInput!) {
    getAllTopics(search: $search) {
      total
      data {
        id
        title
        majorCode
        semesterCode
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
            studentCode
            student {
              id
              username
            }
          }
          supervisors {
            id
            teacherSupervisorCode
            teacher {
              id
              username
            }
          }
        }
      }
    }
  }
`

/**
 * Query để lấy chi tiết topic
 */
export const GET_TOPIC_DETAIL = gql`
  query GetTopicDetail($id: ID!) {
    getTopicDetail(id: $id) {
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
