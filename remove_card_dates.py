import os
import re

target_dir = 'src/components/'
updated_files = 0

# 1. DamageProtocolList.tsx
# pattern:
# <span className="flex items-center gap-1 font-sans">
#   <Calendar className="h-3 w-3 inline text-stone-400" />
#   {formatDateString(protocol.createdDate)}
# </span>
pattern1 = re.compile(r'<span[^>]*>\s*<Calendar[^>]*/>\s*\{formatDateString[^}]*\}\s*</span>', re.MULTILINE)

# 2. ReceptionTab.tsx
# pattern:
# <span>{file.uploadedAt}</span>
pattern2 = re.compile(r'<span>•</span>\s*<span>\{file\.uploadedAt\}</span>', re.MULTILINE)

# 3. UserManagement.tsx
# pattern:
# <div className="flex items-center gap-1.5">
#   <Calendar className="h-3 w-3" />
#   <span>{formatVNTime(user.createdAt) || "Không rõ"}</span>
# </div>
pattern3 = re.compile(r'<div[^>]*>\s*<Calendar[^>]*/>\s*<span>\{formatVNTime\(user\.createdAt\).*?</span>\s*</div>', re.MULTILINE)

# 4. HistoryTimeline.tsx
# pattern:
# <span className="text-xs bg-stone-200/85 text-stone-700 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
#   <Calendar className="h-3 w-3" />
#   {formatDateString(log.receiveDate)}
# </span>
# (But wait, receiveDate is not a creation date, it's the date of the log. Let's NOT touch this unless we are sure. "Thời gian tạo (system creation time)")

for root, _, files in os.walk(target_dir):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            original_content = content
            
            content = pattern1.sub('', content)
            
            # For ReceptionTab, uploadedAt is system time
            if 'ReceptionTab.tsx' in file:
                content = pattern2.sub('', content)
                
            # For UserManagement, createdAt is system time
            if 'UserManagement.tsx' in file:
                content = pattern3.sub('', content)
                # Also remove the header <th className="py-2 sm:py-3 px-1 sm:px-4">Ngày tạo</th>
                content = re.sub(r'<th[^>]*>Ngày tạo</th>', '', content)

            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Cleaned remaining card dates from {file}")
                updated_files += 1

print(f"\n🎉 HOÀN TẤT! Đã dọn dẹp thành công {updated_files} files.")
