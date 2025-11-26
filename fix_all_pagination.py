#!/usr/bin/env python3
"""
Fix all pagination structures comprehensively
"""
import re
import os

def fix_pagination_comprehensive(content):
    """
    Fix two patterns:
    1. pagination: { page: X, pageSize: Y }, sortBy: 'Z', descending: bool,
    2. pagination: { page: X, pageSize: Y\n    }, sortBy: 'Z', descending: bool,
    """
    # Pattern 1: Same line closing brace
    pattern1 = r"(pagination:\s*\{[^}]+)\},\s*sortBy:\s*'(\w+)',\s*descending:\s*(true|false),"
    def replacement1(match):
        pagination_content = match.group(1)
        sort_field = match.group(2)
        descending_value = match.group(3)
        return f"{pagination_content}, sortBy: '{sort_field}', descending: {descending_value} }},"
    content = re.sub(pattern1, replacement1, content)

    # Pattern 2: Multi-line with closing brace on next line
    pattern2 = r"(pagination:\s*\{\s*page:\s*\w+,\s*pageSize[^\n]*)\n(\s+)\},\s*sortBy:\s*'(\w+)',\s*descending:\s*(true|false),"
    def replacement2(match):
        pagination_content = match.group(1)
        indent = match.group(2)
        sort_field = match.group(3)
        descending_value = match.group(4)
        return f"{pagination_content},\n{indent}sortBy: '{sort_field}',\n{indent}descending: {descending_value},\n{indent}}},"
    content = re.sub(pattern2, replacement2, content)

    return content

def process_file(filepath):
    """Process a single file"""
    try:
        if not os.path.exists(filepath):
            print(f"- Skip (not found): {filepath}")
            return False

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = fix_pagination_comprehensive(content)

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
    # Find all .tsx files
    files = []
    for root, dirs, filenames in os.walk('app'):
        for filename in filenames:
            if filename.endswith('.tsx'):
                files.append(os.path.join(root, filename))

    fixed_count = 0
    for file in sorted(files):
        if process_file(file):
            fixed_count += 1

    print(f"\n✓ Fixed {fixed_count} file(s)")
