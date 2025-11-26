#!/usr/bin/env python3
"""
Migrate all remaining detail pages from sessionStorage to GraphQL queries
"""
import re

# Department Teachers
def migrate_department_teachers():
    file_path = 'app/department/teachers/[id]/page.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update imports
    content = re.sub(
        r"import React, \{ useEffect, useState \} from 'react'",
        "import React from 'react'",
        content
    )
    content = re.sub(
        r"(import React from 'react'\n)(import \{ useParams, useRouter \} from 'next/navigation')",
        r"\1\2\nimport { useQuery } from '@apollo/client/react'\nimport { GET_DEPARTMENT_TEACHER_DETAIL } from '@/lib/graphql/queries/department'",
        content
    )

    # Replace state/useEffect with useQuery
    content = re.sub(
        r"  const \[teacher, setTeacher\] = useState<TeacherDetail \| null>\(null\)\s+const \[isLoading, setIsLoading\] = useState\(true\)\s+useEffect\(\(\) => \{[^}]+sessionStorage\.getItem\('teacherDetailData'\)[^}]+\}, \[\]\)",
        """  const teacherId = params.id as string

  const { data, loading, error } = useQuery(GET_DEPARTMENT_TEACHER_DETAIL, {
    variables: { id: teacherId },
    skip: !teacherId,
  })""",
        content,
        flags=re.DOTALL
    )

    # Update conditional renders
    content = re.sub(r"if \(isLoading\)", "if (loading)", content)

    # Add error handling and data extraction
    not_found_pattern = r"(if \(loading\) \{[^}]+\}\s+\})\s+(if \(!teacher\))"
    error_and_extract = r"""\1

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">Lỗi khi tải dữ liệu</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
          <button onClick={() => router.push('/department/teachers')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">Quay lại</button>
        </div>
      </div>
    )
  }

  const teacher = (data as any)?.department?.teacherDetail

  \2"""
    content = re.sub(not_found_pattern, error_and_extract, content, flags=re.DOTALL)

    # Fix not found message
    content = re.sub(
        r"Vui lòng quay lại và chọn giảng viên để xem chi tiết",
        "Giảng viên với ID {teacherId} không tồn tại",
        content
    )

    # Fix backUrl
    content = re.sub(
        r"router\.push\(teacher\.backUrl \|\| '/department/teachers'\)",
        "router.push('/department/teachers')",
        content
    )

    # Fix map type annotations
    content = re.sub(
        r"teacher\.roles\.map\(\(role\) =>",
        "teacher.roles.map((role: any) =>",
        content
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ Migrated {file_path}")

# Department Topics
def migrate_department_topics():
    file_path = 'app/department/topics/[id]/page.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already migrated
    if 'useQuery' in content and 'GET_DEPARTMENT_TOPIC_DETAIL' in content:
        print(f"⏭️  Skipping {file_path} (already migrated)")
        return

    # Update imports - remove useEffect, useState, add useQuery
    content = re.sub(
        r"import React, \{ useEffect, useState \} from 'react'",
        "import React from 'react'",
        content
    )
    content = re.sub(
        r"(import React from 'react'\n)(import \{ useParams, useRouter \} from 'next/navigation')",
        r"\1\2\nimport { useQuery } from '@apollo/client/react'\nimport { GET_DEPARTMENT_TOPIC_DETAIL } from '@/lib/graphql/queries/department'",
        content
    )

    # Replace sessionStorage logic - more flexible pattern
    old_logic_pattern = r"  const \[topic, setTopic\] = useState[^}]+\}\)\s+const \[isLoading, setIsLoading\] = useState\(true\)\s+useEffect\(\(\) => \{[^}]+sessionStorage[^}]+\}, \[\]\)"
    new_logic = """  const topicId = params.id as string

  const { data, loading, error } = useQuery(GET_DEPARTMENT_TOPIC_DETAIL, {
    variables: { id: topicId },
    skip: !topicId,
  })"""
    content = re.sub(old_logic_pattern, new_logic, content, flags=re.DOTALL)

    # Update loading check
    content = re.sub(r"if \(isLoading\)", "if (loading)", content)

    # Add error handling - insert before !topic check
    error_block = """
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">Lỗi khi tải dữ liệu</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
          <button onClick={() => router.push('/department/topics')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">Quay lại</button>
        </div>
      </div>
    )
  }

  const topic = (data as any)?.department?.topicDetail
"""

    # Find position after loading check and before !topic check
    content = re.sub(
        r"(if \(loading\) \{[^}]+\}\s+\})\s+(if \(!topic\))",
        r"\1" + error_block + r"\n  \2",
        content,
        flags=re.DOTALL
    )

    # Fix not found message
    content = re.sub(
        r"Vui lòng quay lại và chọn đề tài để xem chi tiết",
        "Đề tài với ID {topicId} không tồn tại",
        content
    )

    # Fix backUrl references
    content = re.sub(
        r"router\.push\(topic\.backUrl \|\| '/department/topics'\)",
        "router.push('/department/topics')",
        content
    )

    # Remove all sessionStorage writes
    content = re.sub(
        r"sessionStorage\.setItem\('[^']+', JSON\.stringify\([^)]+\)\)\s+",
        "",
        content
    )

    # Simplify navigation handlers
    content = re.sub(
        r"const handleStudentClick = \(enrollment: any\) => \{[^}]+router\.push\([^)]+\)\s+\}",
        "const handleStudentClick = (enrollment: any) => {\n    router.push(`/department/students/${enrollment.studentCode}`)\n  }",
        content,
        flags=re.DOTALL
    )

    content = re.sub(
        r"const handleTeacherClick = \(teacher: any\) => \{[^}]+router\.push\([^)]+\)\s+\}",
        "const handleTeacherClick = (teacher: any) => {\n    router.push(`/department/teachers/${teacher.id}`)\n  }",
        content,
        flags=re.DOTALL
    )

    # Fix map callbacks - add type annotations
    content = re.sub(r"\.topicCouncils\.map\(\(tc\) =>", ".topicCouncils.map((tc: any) =>", content)
    content = re.sub(r"\.supervisors\.map\(\(sup\) =>", ".supervisors\.map((sup: any) =>", content)
    content = re.sub(r"\.files\.map\(\(file\) =>", ".files.map((file: any) =>", content)
    content = re.sub(r"\.enrollments\.map\(\(enr: any\)", ".enrollments.map((enr: any)", content)  # Already has type

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ Migrated {file_path}")

# Department Councils - similar to admin councils
def migrate_department_councils():
    file_path = 'app/department/councils/[id]/page.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already migrated
    if 'useQuery' in content and 'GET_DEPARTMENT_COUNCIL_DETAIL' in content:
        print(f"⏭️  Skipping {file_path} (already migrated)")
        return

    # Similar pattern to admin councils - keep mutations, add query
    # Add import
    if 'import { useQuery, useMutation }' not in content:
        content = re.sub(
            r"import \{ useMutation \} from '@apollo/client/react'",
            "import { useQuery, useMutation } from '@apollo/client/react'\nimport { GET_DEPARTMENT_COUNCIL_DETAIL } from '@/lib/graphql/queries/department'",
            content
        )

    # Remove sessionStorage logic, add useQuery
    content = re.sub(
        r"  const \[council, setCouncil\] = useState[^}]+\}\)\s+const \[isLoading, setIsLoading\] = useState\(true\)[^}]+useEffect\(\(\) => \{[^}]+sessionStorage[^}]+\}, \[\]\)",
        """  const councilId = params.id as string
  const [isAssignTopicsDialogOpen, setIsAssignTopicsDialogOpen] = useState(false)
  const [timeStart, setTimeStart] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  const { data, loading, error } = useQuery(GET_DEPARTMENT_COUNCIL_DETAIL, {
    variables: { id: councilId },
    skip: !councilId,
  })

  useEffect(() => {
    const council = (data as any)?.department?.councilDetail
    if (council?.timeStart) {
      const date = new Date(council.timeStart)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      setTimeStart(`${year}-${month}-${day}T${hours}:${minutes}`)
    }
  }, [data])""",
        content,
        flags=re.DOTALL
    )

    # Add useEffect import if not present
    if 'import React, { useState }' in content:
        content = re.sub(
            r"import React, \{ useState \}",
            "import React, { useState, useEffect }",
            content
        )

    # Update loading check
    content = re.sub(r"if \(isLoading\)", "if (loading)", content)

    # Add error handling and data extraction
    error_block = """
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">Lỗi khi tải dữ liệu</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
          <button onClick={() => router.push('/department/councils')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">Quay lại</button>
        </div>
      </div>
    )
  }

  const council = (data as any)?.department?.councilDetail
"""

    content = re.sub(
        r"(if \(loading\) \{[^}]+\}\s+\})\s+(if \(!council\))",
        r"\1" + error_block + r"\n  \2",
        content,
        flags=re.DOTALL
    )

    # Fix not found message
    content = re.sub(
        r"Vui lòng quay lại và chọn hội đồng để xem chi tiết",
        "Hội đồng với ID {councilId} không tồn tại",
        content
    )

    # Fix backUrl
    content = re.sub(
        r"router\.push\(council\.backUrl \|\| '/department/councils'\)",
        "router.push('/department/councils')",
        content
    )
    content = re.sub(
        r"router\.push\(council\?\.backUrl \|\| '/department/councils'\)",
        "router.push('/department/councils')",
        content
    )

    # Simplify handlers - remove sessionStorage
    content = re.sub(
        r"const handleTopicClick = \([^)]+\) => \{[^}]+sessionStorage[^}]+\}",
        """const handleTopicClick = (topicCode: string) => {
    router.push(`/department/topics/${topicCode}`)
  }""",
        content,
        flags=re.DOTALL
    )

    content = re.sub(
        r"const handleStudentClick = \([^)]+\) => \{[^}]+sessionStorage[^}]+\}",
        """const handleStudentClick = (enrollment: any) => {
    router.push(`/department/students/${enrollment.studentCode}`)
  }""",
        content,
        flags=re.DOTALL
    )

    content = re.sub(
        r"const handleTeacherClick = \([^)]+\) => \{[^}]+sessionStorage[^}]+\}",
        """const handleTeacherClick = (teacher: any) => {
    router.push(`/department/teachers/${teacher.id}`)
  }""",
        content,
        flags=re.DOTALL
    )

    # Fix handleTopicClick calls
    content = re.sub(
        r"handleTopicClick\(topicCouncil\.topicCode, topicCouncil\)",
        "handleTopicClick(topicCouncil.topicCode)",
        content
    )

    # Add type annotations
    content = re.sub(r"\.defences\.map\(\(defence\) =>", ".defences.map((defence: any) =>", content)
    content = re.sub(r"\.topicCouncils\.map\(\(topicCouncil, index\) =>", ".topicCouncils.map((topicCouncil: any, index: number) =>", content)
    content = re.sub(r"\.supervisors\.map\(\(sup\) =>", ".supervisors.map((sup: any) =>", content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ Migrated {file_path}")

if __name__ == '__main__':
    print("🚀 Migrating department detail pages...")
    migrate_department_teachers()
    migrate_department_topics()
    migrate_department_councils()
    print("✅ Department pages migration complete!")
