#!/usr/bin/env python3
"""
Fix pagination structure: Replace sorts array with sortBy/descending fields
"""
import re
import sys

def fix_pagination(content):
    """
    Replace patterns like:
      sorts: [{ field: 'createdAt', order: 'DESC' }],
    With:
      sortBy: 'created_at', descending: true,
    """
    # Pattern to match sorts array with various field names and orders
    pattern = r"sorts:\s*\[\s*\{\s*field:\s*['\"](\w+)['\"]\s*,\s*order:\s*['\"](\w+)['\"]\s*\}\s*\]\s*,"

    def replacement(match):
        field = match.group(1)
        order = match.group(2)
        descending = 'true' if order.upper() == 'DESC' else 'false'
        return f"sortBy: '{field}', descending: {descending},"

    return re.sub(pattern, replacement, content)

def process_file(filepath):
    """Process a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = fix_pagination(content)

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
        'app/teacher/defences/page.tsx',
        'app/teacher/topics/page.tsx',
        'app/teacher/councils/page.tsx',
        'app/teacher/submit-topic/page.tsx',
        'app/department/defences/page.tsx',
        'app/department/teachers/page.tsx',
        'app/department/students/page.tsx',
        'app/department/topics/page.tsx',
        'app/department/councils/[id]/page.tsx',
        'app/department/councils/page.tsx',
        'app/admin/defences/page.tsx',
        'app/admin/analytics/page.tsx',
        'app/admin/majors/page.tsx',
        'app/admin/topics/page.tsx',
        'app/admin/councils/page.tsx',
        'app/admin/faculties/page.tsx',
        'app/student/thesis/page.tsx',
        'app/admin/semesters/page.tsx',
        'src/components/examples/TypeSafeSemesterList.tsx',
    ]

    fixed_count = 0
    for file in files:
        if process_file(file):
            fixed_count += 1

    print(f"\n✓ Fixed {fixed_count} file(s)")
