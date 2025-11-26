import { gql } from "@apollo/client"

/**
 * Mutation để tạo đề tài mới cho supervisor (giai đoạn 1 hoặc 2)
 * Updated for Backend Schema v2 - Namespace-based approach
 *
 * IMPORTANT INPUT CHANGES:
 * - titleEnglish → titleEn
 * - trainingProgram → curriculum (optional)
 * - startDate/endDate → timeStart/timeEnd
 * - Removed: maxStudents
 * - Added: stage (STAGE_DACN or STAGE_LVTN)
 */
export const CREATE_TOPIC_FOR_SUPERVISOR = gql`
  mutation CreateTopicForSuperVisor($input: CreateTopicInput!) {
    teacher {
      supervisor {
        createTopic(input: $input) {
          id
          title
          status
          majorCode
          semesterCode
          percentStage1
          percentStage2
          createdAt
          updatedAt
        }
      }
    }
  }
`

/**
 * Mutation để tạo topic council cho giai đoạn 2 từ topic có sẵn
 * Updated for Backend Schema v2 - Namespace-based approach
 */
export const CREATE_TOPIC_COUNCIL_FOR_SUPERVISOR = gql`
  mutation CreateTopicCouncilForSuperVisor($input: CreateTopicCouncilInput!) {
    teacher {
      supervisor {
        createTopicCouncil(input: $input) {
          id
          title
          stage
          topicCode
          timeStart
          timeEnd
          createdAt
          updatedAt
        }
      }
    }
  }
`
