import os
import re

target_dir = 'src/components/'
updated_files = 0

# Patterns to remove:
# 1. Cập nhật lần cuối block
pattern1 = re.compile(r'\{formData\.updatedAt && \(\s*<div[^>]*>\s*Cập nhật lần cuối: \{formData\.updatedAt\} \{formData\.updatedBy && `bởi \$\{formData\.updatedBy\}`\}\s*</div>\s*\)\}', re.MULTILINE)

# 2. N.Tạo: in OperationsTab.tsx
pattern2 = re.compile(r'<span[^>]*>\s*N\.Tạo: \{form\.createdAt \? formatVNTime\(form\.createdAt\) : \'\'\}\s*</span>', re.MULTILINE)

# 3. {formatVietnamDate(form.createdAt)} in RepairRecordsTab.tsx
pattern3 = re.compile(r'<span[^>]*>\s*\{formatVietnamDate\(form\.createdAt\)\}\s*</span>', re.MULTILINE)

# 4. Lưu lúc: in InspectionTab.tsx
pattern4 = re.compile(r'<div[^>]*>\s*Lưu lúc: \{formatVNTime\(form\.updatedAt\) \|\| "Không rõ"\}\s*</div>', re.MULTILINE)

# 5. Any other standard Cập nhật lần cuối: block that might vary slightly
pattern5 = re.compile(r'\{[a-zA-Z_0-9]+\.updatedAt && \(\s*<div[^>]*>\s*Cập nhật lần cuối:.*?</div>\s*\)\}', re.MULTILINE | re.DOTALL)

for root, _, files in os.walk(target_dir):
    for file in files:
        if file.endswith('.tsx') and ('Form' in file or 'Protocol' in file or 'Tab' in file):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            original_content = content
            
            content = pattern1.sub('', content)
            content = pattern2.sub('', content)
            content = pattern3.sub('', content)
            content = pattern4.sub('', content)
            content = pattern5.sub('', content)

            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Cleaned system dates from {file}")
                updated_files += 1

print(f"\n🎉 HOÀN TẤT! Đã dọn dẹp thành công {updated_files} files.")
