/**
 * GraphQL Search Utilities
 *
 * Helper functions để tạo search input cho GraphQL queries
 * Updated to match actual backend schema
 */

import type { SearchRequestInput, FilterCriteriaInput, FilterConditionInput } from '@/types/graphql'

/**
 * Tạo search input với filter theo semester
 *
 * @param semesterCode - Mã học kỳ
 * @param field - Tên field để filter (mặc định là 'semesterCode')
 * @param pageSize - Số lượng items per page (mặc định là 100)
 * @returns SearchInput object
 *
 * @example
 * ```typescript
 * const search = createSemesterSearch('HK1_2024')
 * const { data } = useQuery(GET_MY_ENROLLMENTS, {
 *   variables: { search }
 * })
 * ```
 */
export function createSemesterSearch(
  semesterCode: string | undefined,
  field: string = 'semesterCode',
  pageSize: number = 100
): { search: SearchRequestInput } {
  return {
    search: {
      pagination: { page: 1, pageSize, sortBy: 'created_at', descending: true },
      filters: semesterCode
        ? [
            {
              condition: {
                field,
                operator: 'EQUAL',
                values: [semesterCode],
              },
            },
          ]
        : [],
    },
  }
}

/**
 * Tạo search input với filter IN (multiple values)
 *
 * @param field - Tên field để filter
 * @param values - Mảng values để filter
 * @param pageSize - Số lượng items per page (mặc định là 100)
 * @returns SearchInput object
 *
 * @example
 * ```typescript
 * const search = createInSearch('id', ['TOP_000648', 'TOP_000675'])
 * const { data } = useQuery(GET_ALL_TOPICS, {
 *   variables: { search }
 * })
 * ```
 */
export function createInSearch(
  field: string,
  values: string[],
  pageSize: number = 100
): { search: SearchRequestInput } {
  return {
    search: {
      pagination: { page: 1, pageSize, sortBy: 'created_at', descending: true },
      filters:
        values.length > 0
          ? [
              {
                condition: {
                  field,
                  operator: 'IN',
                  values,
                },
              },
            ]
          : [],
    },
  }
}

/**
 * Tạo search input cơ bản với pagination
 *
 * @param page - Số trang (mặc định là 1)
 * @param pageSize - Số lượng items per page (mặc định là 20)
 * @param sortBy - Field để sort
 * @param descending - Sort theo thứ tự giảm dần (mặc định là false)
 * @returns SearchInput object
 *
 * @example
 * ```typescript
 * const search = createBasicSearch(1, 20, 'createdAt', true)
 * const { data } = useQuery(GET_ALL_TOPICS, {
 *   variables: { search }
 * })
 * ```
 */
export function createBasicSearch(
  page: number = 1,
  pageSize: number = 20,
  sortBy?: string,
  descending: boolean = false
): { search: SearchRequestInput } {
  return {
    search: {
      pagination: {
        page,
        pageSize,
        sortBy,
        descending,
      },
      filters: [],
    },
  }
}

/**
 * Tạo search input với multiple filters
 *
 * @param filters - Mảng filter criteria
 * @param page - Số trang (mặc định là 1)
 * @param pageSize - Số lượng items per page (mặc định là 20)
 * @returns SearchInput object
 *
 * @example
 * ```typescript
 * const search = createMultiFilterSearch([
 *   { condition: { field: 'semesterCode', operator: 'EQUAL', values: ['HK1_2024'] } },
 *   { condition: { field: 'status', operator: 'IN', values: ['APPROVED', 'PENDING'] } }
 * ])
 * const { data } = useQuery(GET_ALL_TOPICS, {
 *   variables: { search }
 * })
 * ```
 */
export function createMultiFilterSearch(
  filters: FilterCriteriaInput[],
  page: number = 1,
  pageSize: number = 20
): { search: SearchRequestInput } {
  return {
    search: {
      pagination: { page, pageSize, sortBy: 'created_at', descending: true },
      filters,
    },
  }
}

/**
 * Tạo search input để lấy detail (filter theo ID)
 * Dùng cho detail pages - query list endpoint với filter id = entityId
 *
 * @param id - ID của entity cần lấy detail
 * @param field - Tên field để filter (mặc định là 'id')
 * @returns SearchInput object
 *
 * @example
 * ```typescript
 * const search = createDetailSearch('STU_001')
 * const { data } = useQuery(GET_STUDENT_DETAIL, {
 *   variables: { search }
 * })
 * // Lấy data: data.affair.students.data[0]
 * ```
 */
export function createDetailSearch(
  id: string,
  field: string = 'id'
): SearchRequestInput {
  return {
    pagination: { page: 1, pageSize: 1 },
    filters: [
      {
        condition: {
          field,
          operator: 'EQUAL',
          values: [id],
        },
      },
    ],
  }
}

/**
 * Merge multiple search inputs into one
 *
 * @param searches - Mảng các search inputs
 * @returns Merged SearchInput object
 *
 * @example
 * ```typescript
 * const semesterSearch = createSemesterSearch('HK1_2024')
 * const statusSearch = createInSearch('status', ['APPROVED', 'PENDING'])
 * const merged = mergeSearchInputs(semesterSearch.search, statusSearch.search)
 * ```
 */
export function mergeSearchInputs(...searches: SearchRequestInput[]): { search: SearchRequestInput } {
  const merged: SearchRequestInput = {
    pagination: searches[0]?.pagination || { page: 1, pageSize: 20, sortBy: 'created_at', descending: true },
    filters: [],
  }

  searches.forEach((search) => {
    if (search.filters) {
      merged.filters = [...(merged.filters || []), ...search.filters]
    }
  })

  return { search: merged }
}
