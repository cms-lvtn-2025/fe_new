#!/usr/bin/env python3
import os
import glob

def remove_duplicate_import(filepath):
    """Remove duplicate createDetailSearch imports"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    seen_create_detail_search = False

    for line in lines:
        if 'import { createDetailSearch }' in line:
            if not seen_create_detail_search:
                new_lines.append(line)
                seen_create_detail_search = True
            # Skip duplicate
        else:
            new_lines.append(line)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

    print(f"Processed: {filepath}")

# Find all detail pages
patterns = [
    '/home/thaily/code/lvtn/FE_main/app/admin/*/[id]/page.tsx',
    '/home/thaily/code/lvtn/FE_main/app/department/*/[id]/page.tsx',
    '/home/thaily/code/lvtn/FE_main/app/teacher/*/[id]/page.tsx',
    '/home/thaily/code/lvtn/FE_main/app/student/*/[id]/page.tsx',
]

for pattern in patterns:
    for filepath in glob.glob(pattern):
        remove_duplicate_import(filepath)

print("Done!")
