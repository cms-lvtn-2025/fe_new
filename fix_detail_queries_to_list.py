#!/usr/bin/env python3
"""
Script to update all detail queries to use list queries with search filter
"""

import re
import os

# Mapping của các queries cần sửa
QUERY_MAPPINGS = {
    # Admin
    'GET_STUDENT_DETAIL': {
        'old_data_path': '?.affair?.studentDetail',
        'new_data_path': '?.affair?.students?.data?.[0]',
    },
    'GET_TEACHER_DETAIL': {
        'old_data_path': '?.affair?.teacherDetail',
        'new_data_path': '?.affair?.teachers?.data?.[0]',
    },
    'GET_TOPIC_DETAIL': {
        'old_data_path': '?.affair?.topicDetail',
        'new_data_path': '?.affair?.topics?.data?.[0]',
    },
    'GET_COUNCIL_DETAIL': {
        'old_data_path': '?.affair?.councilDetail',
        'new_data_path': '?.affair?.councils?.data?.[0]',
    },
    # Department
    'GET_DEPARTMENT_STUDENT_DETAIL': {
        'old_data_path': '?.department?.studentDetail',
        'new_data_path': '?.department?.students?.data?.[0]',
    },
    'GET_DEPARTMENT_TEACHER_DETAIL': {
        'old_data_path': '?.department?.teacherDetail',
        'new_data_path': '?.department?.teachers?.data?.[0]',
    },
    'GET_DEPARTMENT_TOPIC_DETAIL': {
        'old_data_path': '?.department?.topicDetail',
        'new_data_path': '?.department?.topics?.data?.[0]',
    },
    'GET_DEPARTMENT_COUNCIL_DETAIL': {
        'old_data_path': '?.department?.councilDetail',
        'new_data_path': '?.department?.councils?.data?.[0]',
    },
    # Teacher
    'GET_TOPIC_COUNCIL_DETAIL': {
        'old_data_path': '?.supervisor?.topicCouncilDetail',
        'new_data_path': '?.supervisor?.topicCouncils?.data?.[0]',
    },
    'GET_DEFENCE_DETAIL': {
        'old_data_path': '?.councilMember?.defenceDetail',
        'new_data_path': '?.councilMember?.defences?.data?.[0]',
    },
    # Student
    'GET_MY_ENROLLMENT_DETAIL': {
        'old_data_path': '?.student?.enrollmentDetail',
        'new_data_path': '?.student?.enrollments?.data?.[0]',
    },
}

def fix_detail_page(file_path):
    """Fix a single detail page file"""
    print(f"Processing: {file_path}")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Add createDetailSearch import if not present
    if 'createDetailSearch' not in content:
        # Find the line with useQuery import
        content = re.sub(
            r"(import \{ useQuery \} from '@apollo/client/react')",
            r"import { useQuery } from '@apollo/client/react'\nimport { createDetailSearch } from '@/lib/graphql/utils/search-helpers'",
            content
        )

    # 2. Fix useQuery variables for each query type
    for query_name, mapping in QUERY_MAPPINGS.items():
        if query_name in content:
            # Fix variables: { id: xxx } -> { search: createDetailSearch(xxx) }
            content = re.sub(
                rf"variables: \{{\s*id:\s*(\w+)\s*\}}",
                r"variables: { search: createDetailSearch(\1) }",
                content
            )

            # Fix data extraction path
            old_path = mapping['old_data_path'].replace('?', r'\?')
            new_path = mapping['new_data_path']
            content = re.sub(
                rf"\(data as any\){old_path}",
                f"(data as any){new_path}",
                content
            )

    # Only write if content changed
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ Updated: {file_path}")
        return True
    else:
        print(f"  ⏭️  No changes needed: {file_path}")
        return False

def main():
    """Main function"""
    # List of detail pages to fix
    detail_pages = [
        'app/admin/students/[id]/page.tsx',  # Already done
        'app/admin/teachers/[id]/page.tsx',
        'app/admin/topics/[id]/page.tsx',
        'app/admin/councils/[id]/page.tsx',
        'app/department/students/[id]/page.tsx',
        'app/department/teachers/[id]/page.tsx',
        'app/department/topics/[id]/page.tsx',
        'app/department/councils/[id]/page.tsx',
        'app/teacher/topics/[id]/page.tsx',
        'app/teacher/councils/[id]/page.tsx',
        'app/student/thesis/[id]/page.tsx',
    ]

    base_dir = '/home/thaily/code/lvtn/FE_main'
    updated_count = 0

    for page in detail_pages:
        file_path = os.path.join(base_dir, page)
        if os.path.exists(file_path):
            if fix_detail_page(file_path):
                updated_count += 1
        else:
            print(f"❌ File not found: {file_path}")

    print(f"\n✅ Updated {updated_count}/{len(detail_pages)} files")

if __name__ == '__main__':
    main()
