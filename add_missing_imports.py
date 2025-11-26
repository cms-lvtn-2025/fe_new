#!/usr/bin/env python3
"""
Add missing createDetailSearch imports to detail pages
"""

import re
import os

def add_import_if_needed(file_path):
    """Add createDetailSearch import if file uses it but doesn't import"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if file uses createDetailSearch but doesn't import it
    if 'createDetailSearch' in content and 'import.*createDetailSearch' not in content:
        # Find the line with useQuery import
        pattern = r"(import \{ [^\}]*useQuery[^\}]* \} from '@apollo/client/react')"
        replacement = r"\1\nimport { createDetailSearch } from '@/lib/graphql/utils/search-helpers'"

        new_content = re.sub(pattern, replacement, content)

        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ Added import to: {file_path}")
            return True
        else:
            print(f"⚠️  Could not add import to: {file_path}")
            return False
    else:
        print(f"⏭️  Skipped (already has import or doesn't use it): {file_path}")
        return False

def main():
    base_dir = '/home/thaily/code/lvtn/FE_main/app'
    detail_pages = []

    # Find all [id]/page.tsx files
    for root, dirs, files in os.walk(base_dir):
        if '[id]' in root and 'page.tsx' in files:
            detail_pages.append(os.path.join(root, 'page.tsx'))

    print(f"Found {len(detail_pages)} detail pages\n")

    updated_count = 0
    for page in detail_pages:
        if add_import_if_needed(page):
            updated_count += 1

    print(f"\n✅ Added imports to {updated_count}/{len(detail_pages)} files")

if __name__ == '__main__':
    main()
