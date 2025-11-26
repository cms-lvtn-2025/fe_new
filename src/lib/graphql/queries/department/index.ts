/**
 * Export tất cả queries cho Department Lecturer
 *
 * Department Lecturer có quyền:
 * - Quản lý giáo viên của khoa
 * - Quản lý sinh viên của khoa
 * - Quản lý đề tài của khoa
 * - Quản lý hội đồng của khoa
 * - Quản lý lịch bảo vệ của khoa
 * - Duyệt đề tài (stage 1)
 * - Gán đề tài vào hội đồng
 */

// Academic queries
export * from "./academic.queries"

// Teacher queries
export * from "./teacher.queries"

// Student queries
export * from "./student.queries"

// Topic queries
export * from "./topic.queries"

// Council queries
export * from "./council.queries"

// Defence queries
export * from "./defence.queries"

// Detail queries
