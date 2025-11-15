import { gql } from "@apollo/client"

/**
 * Mutation để upload file midterm
 */
export const UPLOAD_MIDTERM_FILE = gql`
  mutation UploadMidtermFile($input: UploadFileInput!) {
    uploadMidtermFile(input: $input) {
      id
      title
      file
      status
      table
      option
      tableId
      createdAt
    }
  }
`

/**
 * Mutation để upload file final
 */
export const UPLOAD_FINAL_FILE = gql`
  mutation UploadFinalFile($input: UploadFileInput!) {
    uploadFinalFile(input: $input) {
      id
      title
      file
      status
      table
      option
      tableId
      createdAt
    }
  }
`
