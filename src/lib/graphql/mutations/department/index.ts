/**
 * Export tất cả mutations cho Department Lecturer
 *
 * Department Lecturer có quyền:
 * - Duyệt/Từ chối đề tài (Stage 1)
 * - Tạo và quản lý hội đồng của khoa
 * - Thêm/Xóa thành viên hội đồng
 * - Gán đề tài vào hội đồng
 */

// Topic mutations
export * from "./topic.mutations"

// Council mutations
export * from "./council.mutations"
