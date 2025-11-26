#!/usr/bin/env python3
"""
Fix pagination structure v2: Move sortBy/descending inside pagination object
"""
import re
import sys

def fix_pagination_v2(content):
    """
    Fix patterns like:
      pagination: { page: 1, pageSize: 100 }, sortBy: 'created_at', descending: true,
    To:
      pagination: { page: 1, pageSize: 100, sortBy: 'created_at', descending: true },
    """
    # Pattern to match pagination with sortBy/descending outside
    pattern = r"(pagination:\s*\{[^}]+)\},\s*sortBy:\s*'(\w+)',\s*descending:\s*(true|false),"

    def replacement(match):
        pagination_content = match.group(1)
        sort_field = match.group(2)
        descending_value = match.group(3)
        return f"{pagination_content}, sortBy: '{sort_field}', descending: {descending_value} }},"

    return re.sub(pattern, replacement, content)

def process_file(filepath):
    """Process a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = fix_pagination_v2(content)

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
        'app/teacher/submit-topic/page.tsx',
        'app/admin/defences/page.tsx',
        'app/admin/councils/page.tsx',
        'app/admin/analytics/page.tsx',
        'app/admin/topics/page.tsx',
        'app/admin/majors/page.tsx',
        'app/department/councils/[id]/page.tsx',
        'app/department/teachers/page.tsx',
    ]

    fixed_count = 0
    for file in files:
        if process_file(file):
            fixed_count += 1

    print(f"\n✓ Fixed {fixed_count} file(s)")
