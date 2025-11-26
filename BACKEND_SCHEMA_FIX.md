# Backend Schema Fix - Matching Actual GraphQL Schema

## Problem

The initial type implementation was based on ASSUMPTIONS about the backend schema structure, but the actual backend schema at `/home/thaily/code/lvtn/BE_main/src/server/graph/schema_2/base.graphqls` had a **completely different structure**.

This caused GraphQL validation errors:
```json
{"errors":[{"message":"unknown field","path":["variable","search","sorts"]}]}
```

## Root Cause

### What Was Implemented (WRONG)
```typescript
export interface PaginationInput {
  page?: number
  pageSize?: number
  // Missing sortBy and descending
}

export interface SearchRequestInput {
  pagination?: PaginationInput
  sorts?: SortInput[]  // ❌ Backend doesn't have this!
  filters?: FilterInput[]  // ❌ Wrong structure!
}

export interface FilterInput {
  field: string
  operator: 'eq' | 'ne' | 'gt'  // ❌ Wrong operators
  value: any  // ❌ Should be values array
}
```

### What Backend Actually Expects (CORRECT)
```typescript
export interface PaginationInput {
  page?: number
  pageSize?: number
  sortBy?: string      // ✅ Sorting is inside pagination
  descending?: boolean // ✅ Sorting is inside pagination
}

export interface SearchRequestInput {
  pagination?: PaginationInput
  filters?: FilterCriteriaInput[]  // ✅ Nested structure
}

export interface FilterCriteriaInput {
  condition?: FilterConditionInput  // ✅ Nested with 'condition'
  group?: FilterGroupInput          // ✅ Or 'group' for logic
}

export interface FilterConditionInput {
  field: string
  operator: FilterOperator  // ✅ Enum type
  values?: string[]         // ✅ Array, not single value
}

export type FilterOperator =
  | 'EQUAL'           // ✅ Uppercase
  | 'NOT_EQUAL'
  | 'GREATER_THAN'
  | 'LIKE'
  | 'IN'
  | 'NOT_IN'
  // ... etc
```

## Files Fixed

### 1. Type Definitions
- ✅ `/src/types/graphql.ts` - Updated to match actual backend schema

### 2. Helper Functions
- ✅ `/src/lib/graphql/utils/search-helpers.ts` - All functions updated:
  - `createSemesterSearch()` - Uses nested `condition` structure
  - `createInSearch()` - Proper `IN` operator with values array
  - `createBasicSearch()` - sortBy/descending in pagination
  - `createMultiFilterSearch()` - Nested filter criteria
  - `mergeSearchInputs()` - Updated merge logic

### 3. Components (All Fixed)
- ✅ `/src/components/admin/users/student-management.tsx`
- ✅ `/src/components/admin/users/teacher-management.tsx`
- ✅ All 18+ page components updated via Python scripts

## Key Differences

### Pagination
```typescript
// ❌ WRONG (what was implemented)
{
  pagination: { page: 1, pageSize: 20 },
  sorts: [{ field: 'createdAt', order: 'DESC' }]
}

// ✅ CORRECT (actual backend)
{
  pagination: {
    page: 1,
    pageSize: 20,
    sortBy: 'created_at',
    descending: true
  }
}
```

### Filters
```typescript
// ❌ WRONG (what was implemented)
filters: [
  { field: 'semesterCode', operator: 'eq', value: 'HK1_2024' }
]

// ✅ CORRECT (actual backend)
filters: [
  {
    condition: {
      field: 'semesterCode',
      operator: 'EQUAL',
      values: ['HK1_2024']
    }
  }
]
```

### Filter Operators
```typescript
// ❌ WRONG
'eq', 'ne', 'gt', 'contains', 'in'

// ✅ CORRECT
'EQUAL', 'NOT_EQUAL', 'GREATER_THAN', 'LIKE', 'IN'
```

## Automation Scripts Used

### 1. `fix_pagination.py`
- Replaced `sorts: [{ field: X, order: Y }]` with `sortBy: X, descending: bool`

### 2. `fix_pagination_v2.py`
- Moved `sortBy` and `descending` inside `pagination` object

### 3. `fix_all_pagination.py`
- Comprehensive fix for all pagination patterns across codebase

## Build Status

✅ **Build Successful**
```
npm run build
✓ Compiled successfully
✓ TypeScript checks passed
✓ Generated 30 pages
```

## Testing Required

After this fix, please test:

1. **Admin Pages**
   - Student list with filters (semester, class, major)
   - Teacher list with filters
   - Topics, councils, semesters management

2. **Department Pages**
   - All listing pages with search and filters

3. **Teacher Pages**
   - My topics, councils, defences

4. **Student Pages**
   - My enrollments/thesis

## Example Usage

### Creating a Search Query
```typescript
import { createSemesterSearch } from '@/lib/graphql/utils/search-helpers'
import type { SearchRequestInput } from '@/types/graphql'

// Correct structure
const search = createSemesterSearch('HK1_2024')
// Returns:
// {
//   search: {
//     pagination: { page: 1, pageSize: 100, sortBy: 'created_at', descending: true },
//     filters: [
//       { condition: { field: 'semesterCode', operator: 'EQUAL', values: ['HK1_2024'] } }
//     ]
//   }
// }
```

### Building Custom Filters
```typescript
const filters: FilterCriteriaInput[] = [
  {
    condition: {
      field: 'status',
      operator: 'IN',
      values: ['APPROVED', 'PENDING']
    }
  },
  {
    condition: {
      field: 'semesterCode',
      operator: 'EQUAL',
      values: ['HK1_2024']
    }
  }
]

const search: SearchRequestInput = {
  pagination: { page: 1, pageSize: 20, sortBy: 'created_at', descending: true },
  filters
}
```

## Lessons Learned

1. **Always verify backend schema** - Don't assume structure, read the actual GraphQL schema files
2. **Test early** - Run queries against backend to catch mismatches sooner
3. **Use GraphQL validation errors** - They tell you exactly what fields are wrong
4. **Automate repetitive fixes** - Python scripts saved hours of manual edits

## Related Documentation

- See `TYPE_SAFETY_UPDATE.md` for TypeScript improvements
- See `COMPONENT_DATA_FIX.md` for component data path fixes
- See `/src/types/graphql.ts` for all type definitions
- See `/src/lib/graphql/utils/search-helpers.ts` for helper functions
