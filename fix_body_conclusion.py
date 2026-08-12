import re
import os

file_path = 'src/components/BodyInspectionBeforeRepairForm.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update conclusion
content = content.replace(
    "conclusion: 'Cụm thân, vỏ xe đã được kiểm tra đúng Quy trình công nghệ.'",
    "conclusion: 'Cụm thân, vỏ xe.....................................................đã được kiểm tra đúng Quy trình công nghệ.'"
)
content = content.replace(
    "placeholder=\"Cụm thân, vỏ xe đã được kiểm tra đúng Quy trình công nghệ.\"",
    "placeholder=\"Cụm thân, vỏ xe.....................................................đã được kiểm tra đúng Quy trình công nghệ.\""
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ Updated Body Inspection Conclusion")
