import { gql } from "@apollo/client"

/**
 * Query để lấy danh sách semesters của khoa
 */
export const GET_DEPARTMENT_SEMESTERS = gql`
  query GetDepartmentSemesters($search: SearchRequestInput!) {
    getDepartmentSemesters(search: $search) {
      id
      title
      createdAt
      updatedAt
    }
  }
`

/**
 * Query để lấy danh sách majors của khoa
 * Department lecturer chỉ quản lý major của khoa mình
 */
export const GET_DEPARTMENT_MAJORS = gql`
  query GetDepartmentMajors($search: SearchRequestInput!) {
    getDepartmentMajors(search: $search) {
      id
      title
      facultyCode
      createdAt
      updatedAt
    }
  }
`

/**
 * Query để lấy danh sách faculties
 */
export const GET_DEPARTMENT_FACULTIES = gql`
  query GetDepartmentFaculties($search: SearchRequestInput!) {
    getDepartmentFaculties(search: $search) {
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
`
