import { gql } from "@apollo/client"

/**
 * Mutation để upload file midterm
 * Updated for Backend Schema v2 - Namespace-based approach
 */
export const UPLOAD_MIDTERM_FILE = gql`
  mutation UploadMidtermFile($input: UploadFileInput!) {
    student {
      uploadMidtermFile(input: $input) {
        id
        title
        file
        status
        table
        option
        tableId
        createdAt
        updatedAt
      }
    }
  }
`

/**
 * Mutation để upload file final
 * Updated for Backend Schema v2 - Namespace-based approach
 */
export const UPLOAD_FINAL_FILE = gql`
  mutation UploadFinalFile($input: UploadFileInput!) {
    student {
      uploadFinalFile(input: $input) {
        id
        title
        file
        status
        table
        option
        tableId
        createdAt
        updatedAt
      }
    }
  }
`
