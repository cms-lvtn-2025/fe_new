#!/usr/bin/env python3
"""
Fix old data paths to use namespace-based structure
"""
import re
import os

def fix_data_paths(content):
    """
    Replace old flat query paths with namespace-based paths:
    - getAllSemesters?.data -> affair.semesters?.data
    - getAllMajors?.data -> affair.majors?.data
    - getAllTopics?.data -> affair.topics?.data
    - getAllCouncils?.data -> affair.councils?.data
    - getListStudents?.data -> affair.students?.data
    - getListTeachers?.data -> affair.teachers?.data
    """
    replacements = [
        (r'\bgetAllSemesters\?\.data\b', 'affair?.semesters?.data'),
        (r'\bgetAllSemesters\?\.total\b', 'affair?.semesters?.total'),
        (r'\bgetAllMajors\?\.data\b', 'affair?.majors?.data'),
        (r'\bgetAllMajors\?\.total\b', 'affair?.majors?.total'),
        (r'\bgetAllTopics\?\.data\b', 'affair?.topics?.data'),
        (r'\bgetAllTopics\?\.total\b', 'affair?.topics?.total'),
        (r'\bgetAllCouncils\?\.data\b', 'affair?.councils?.data'),
        (r'\bgetAllCouncils\?\.total\b', 'affair?.councils?.total'),
        (r'\bgetAllFaculties\?\.data\b', 'affair?.faculties?.data'),
        (r'\bgetAllFaculties\?\.total\b', 'affair?.faculties?.total'),
        (r'\bgetListStudents\?\.data\b', 'affair?.students?.data'),
        (r'\bgetListStudents\?\.total\b', 'affair?.students?.total'),
        (r'\bgetListTeachers\?\.data\b', 'affair?.teachers?.data'),
        (r'\bgetListTeachers\?\.total\b', 'affair?.teachers?.total'),
    ]

    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)

    return content

def process_file(filepath):
    """Process a single file"""
    try:
        if not os.path.exists(filepath):
            return False

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = fix_data_paths(content)

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✓ Fixed: {filepath}")
            return True
        else:
            print(f"- No changes: {filepath}")
            return False
    except Exception as e:
        print(f"✗ Error processing {filepath}: {e}")
        return False

if __name__ == '__main__':
    files = [
        'app/admin/councils/page.tsx',
        'app/department/councils/[id]/page.tsx',
        'app/admin/topics/page.tsx',
        'app/admin/majors/page.tsx',
        'app/admin/defences/page.tsx',
        'app/admin/analytics/page.tsx',
    ]

    fixed_count = 0
    for file in files:
        if process_file(file):
            fixed_count += 1

    print(f"\n✓ Fixed {fixed_count} file(s)")
