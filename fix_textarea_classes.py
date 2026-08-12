import os
import re

# 1. Update font-serif and p-0 to py-1 in MilitaryInspectionForm.tsx and others
components_dir = 'src/components'
count = 0

for root, dirs, files in os.walk(components_dir):
    for filename in files:
        if filename.endswith('.tsx'):
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Remove font-serif from AutoResizeTextarea classNames, replace p-0 with py-1
            # We will use regex to find <AutoResizeTextarea ... className="..." />
            
            # Since it's hard to precisely target just AutoResizeTextarea classNames with regex,
            # we'll look for strings like: className="w-full bg-transparent border-none focus:ring-0 resize-none p-0 whitespace-pre-wrap font-serif"
            
            content = content.replace(
                'className="w-full bg-transparent border-none focus:ring-0 resize-none p-0 whitespace-pre-wrap font-serif"',
                'className="w-full bg-transparent border-none focus:ring-0 resize-none py-1 whitespace-pre-wrap"'
            )
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                count += 1
                print(f"Updated {filename}")

print(f"✅ Đã cập nhật className cho AutoResizeTextarea trong {count} file!")
