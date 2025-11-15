/**
 * @deprecated
 * This file is deprecated and kept for backward compatibility only.
 *
 * Please import from the new modular structure instead:
 *
 * For Student queries:
 * import { GET_MY_PROFILE, GET_MY_ENROLLMENTS } from '@/lib/graphql/queries/student.queries'
 *
 * For Teacher queries:
 * import { GET_MY_TEACHER_PROFILE, GET_MY_DEFENCES } from '@/lib/graphql/queries/teacher.queries'
 *
 * For Admin queries:
 * import { GET_LIST_STUDENTS, GET_ALL_TOPICS } from '@/lib/graphql/queries/admin.queries'
 *
 * Or import all from the index:
 * import { GET_MY_PROFILE, GET_MY_TEACHER_PROFILE } from '@/lib/graphql/queries'
 */

// Re-export all queries and mutations for backward compatibility
export * from './queries/index'
export * from './mutations/index'
