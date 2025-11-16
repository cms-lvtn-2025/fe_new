import { gql } from "@apollo/client"

/**
 * Query để lấy danh sách semesters
 */
export const GET_ALL_SEMESTERS = gql`
  query GetAllSemesters($search: SearchRequestInput!) {
    getAllSemesters(search: $search) {
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

/**
 * Query để lấy danh sách majors
 */
export const GET_ALL_MAJORS = gql`
  query GetAllMajors($search: SearchRequestInput!) {
    getAllMajors(search: $search) {
      total
      data {
        id
        title
        facultyCode
        createdAt
        updatedAt
      }
    }
  }
`

/**
 * Query để lấy danh sách faculties
 */
export const GET_ALL_FACULTIES = gql`
  query GetAllFaculties($search: SearchRequestInput!) {
    getAllFaculties(search: $search) {
      total
      data {
        id
        title
        createdAt
        updatedAt
        majors {
          id
          title
          facultyCode
        }
      }
    }
  }
`
