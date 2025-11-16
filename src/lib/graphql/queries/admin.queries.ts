/**
 * DEPRECATED: File này được giữ lại để backward compatibility
 *
 * Vui lòng sử dụng các file trong thư mục admin/ để quản lý queries tốt hơn:
 * - admin/user.queries.ts: Queries về user (teachers, students)
 * - admin/academic.queries.ts: Queries về học thuật (semesters, majors, faculties)
 * - admin/topic.queries.ts: Queries về đề tài
 * - admin/enrollment.queries.ts: Queries về enrollment
 * - admin/council.queries.ts: Queries về hội đồng bảo vệ
 *
 * Import từ: '@/lib/graphql/queries/admin'
 */

// Re-export tất cả queries từ thư mục admin
export * from './admin'
