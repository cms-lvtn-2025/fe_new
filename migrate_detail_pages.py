#!/usr/bin/env python3
"""
Migrate detail pages from sessionStorage to GraphQL queries
"""
import re
import os

def migrate_admin_student_detail(filepath):
    """Migrate admin student detail page"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Already migrated - skip
    if 'useQuery' in content and 'GET_STUDENT_DETAIL' in content:
        return False

    # Add imports
    content = re.sub(
        r"import React, \{ useEffect, useState \} from 'react'",
        "import React from 'react'",
        content
    )

    content = re.sub(
        r"(import React from 'react'\n)(import \{ useParams, useRouter \} from 'next/navigation')",
        r"\1\2\nimport { useQuery } from '@apollo/client/react'\nimport { GET_STUDENT_DETAIL } from '@/lib/graphql/queries/admin'",
        content
    )

    # Replace useState/useEffect logic
    old_logic = r"  const \[student, setStudent\] = useState<StudentDetail \| null>\(null\)\s+const \[isLoading, setIsLoading\] = useState\(true\)\s+useEffect\(\(\) => \{[^}]+sessionStorage\.getItem\('studentDetailData'\)[^}]+\}, \[\]\)"
    new_logic = """  const studentId = params.id as string

  const { data, loading, error } = useQuery(GET_STUDENT_DETAIL, {
    variables: { id: studentId },
    skip: !studentId,
  })"""

    content = re.sub(old_logic, new_logic, content, flags=re.DOTALL)

    # Update conditional renders
    content = re.sub(
        r"if \(isLoading\)",
        "if (loading)",
        content
    )

    # Add error handling
    if_student_check = r"(if \(loading\) \{[^}]+\}\s+\})\s+(if \(!student\))"
    error_block = r"""\1

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">Lỗi khi tải dữ liệu</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
          <button onClick={() => router.push('/admin/users')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">Quay lại</button>
        </div>
      </div>
    )
  }

  const student = (data as any)?.affair?.studentDetail

  \2"""

    content = re.sub(if_student_check, error_block, content, flags=re.DOTALL)

    # Remove backUrl usage
    content = re.sub(
        r"router\.push\(student\.backUrl \|\| '/admin/users'\)",
        "router.push('/admin/users')",
        content
    )

    # Fix MSSV display
    content = re.sub(
        r"MSSV: \{student\.id\}",
        "MSSV: {student.mssv || student.id}",
        content
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return True

# For now, only do admin/students/[id] as proof of concept
# We already manually edited this file, so this is just the pattern

print("Migration script ready - to be executed after manual review")
print("Pattern established - can extend to other detail pages")
