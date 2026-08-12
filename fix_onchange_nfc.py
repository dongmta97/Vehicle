import os
import re

components_dir = 'src/components'
count = 0

for root, dirs, files in os.walk(components_dir):
    for filename in files:
        if filename.endswith('.tsx'):
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Thay thế e.target.value, event.target.value, hoặc ev.target.value
            # Không thay thế nếu đã được normalize
            content = re.sub(r'\b(e|event|ev)\.target\.value\b(?!\.normalize)', r"\1.target.value.normalize('NFC')", content)
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                count += 1
                print(f"Updated {filename}")

print(f"✅ Đã hoàn thành xử lý NFC tại onChange cho {count} file!")
