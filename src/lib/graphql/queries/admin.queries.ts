import { gql } from "@apollo/client"

/**
 * Query để lấy danh sách giáo viên
 */
export const GET_LIST_TEACHERS = gql`
  query GetListTeachers($search: SearchRequestInput!) {
    getListTeachers(search: $search) {
      total
      data {
        id
        email
        username
        gender
        majorCode
        semesterCode
        createdAt
        updatedAt
        roles {
          id
          title
          role
          semesterCode
          activate
        }
      }
    }
  }
`

/**
 * Query để lấy danh sách sinh viên
 */
export const GET_LIST_STUDENTS = gql`
  query GetListStudents($search: SearchRequestInput!) {
    getListStudents(search: $search) {
      total
      data {
        id
        email
        phone
        username
        gender
        majorCode
        classCode
        semesterCode
        createdAt
        updatedAt
      }
    }
  }
`

/**
 * Query để lấy chi tiết sinh viên
 */
export const GET_STUDENT_DETAIL = gql`
  query GetStudentDetail($id: ID!) {
    getStudentDetail(id: $id) {
      id
      email
      phone
      username
      gender
      majorCode
      classCode
      semesterCode
      createdAt
      updatedAt
      createdBy
      updatedBy
      enrollments {
        id
        title
        studentCode
        topicCouncilCode
        finalCode
        gradeReviewCode
        midtermCode
        createdAt
        updatedAt
        midterm {
          id
          title
          grade
          status
          feedback
        }
        final {
          id
          title
          supervisorGrade
          departmentGrade
          finalGrade
          status
          notes
        }
        gradeReview {
          id
          title
          reviewGrade
          status
          notes
        }
      }
    }
  }
`

/**
 * Query để lấy chi tiết giáo viên
 */
export const GET_TEACHER_DETAIL = gql`
  query GetTeacherDetail($id: ID!) {
    getTeacherDetail(id: $id) {
      id
      email
      username
      gender
      majorCode
      semesterCode
      createdAt
      updatedAt
      roles {
        id
        title
        role
        semesterCode
        activate
      }
    }
  }
`

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

/**
 * Query để lấy danh sách enrollments
 */
export const GET_ALL_ENROLLMENTS = gql`
  query GetAllEnrollments($search: SearchRequestInput!) {
    getAllEnrollments(search: $search) {
      total
      data {
        id
        title
        studentCode
        topicCouncilCode
        finalCode
        gradeReviewCode
        midtermCode
        createdAt
        updatedAt
        student {
          id
          email
          username
          gender
          majorCode
          classCode
        }
        topicCouncil {
          id
          title
          stage
          topicCode
          councilCode
          timeStart
          timeEnd
        }
        midterm {
          id
          title
          grade
          status
          feedback
        }
        final {
          id
          title
          supervisorGrade
          departmentGrade
          finalGrade
          status
        }
        gradeReview {
          id
          title
          reviewGrade
          status
        }
      }
    }
  }
`

/**
 * Query để lấy chi tiết enrollment
 */
export const GET_ENROLLMENT_DETAIL = gql`
  query GetEnrollmentDetail($id: ID!) {
    getEnrollmentDetail(id: $id) {
      id
      title
      studentCode
      topicCouncilCode
      finalCode
      gradeReviewCode
      midtermCode
      createdAt
      updatedAt
      student {
        id
        email
        username
        gender
        majorCode
        classCode
      }
      topicCouncil {
        id
        title
        stage
        topicCode
        councilCode
        timeStart
        timeEnd
        topic {
          id
          title
          status
        }
      }
      midterm {
        id
        title
        grade
        status
        feedback
      }
      final {
        id
        title
        supervisorGrade
        departmentGrade
        finalGrade
        status
        notes
      }
      gradeReview {
        id
        title
        reviewGrade
        status
        notes
      }
      gradeDefences {
        id
        defenceCode
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
`

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
