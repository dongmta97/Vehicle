import re
import os

file_path = 'src/components/BodyInspectionBeforeRepairForm.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace BODY_INSPECTION_ITEMS
new_items = """const BODY_INSPECTION_ITEMS = [
  { id: 1101, category: '', stt: '1', content: 'Kiểm tra vỏ xe, các mối hàn', unit: '-', requirement: 'Vỏ xe không bập bùng;\\nKhông có rỗ mọt trên toàn xe;\\nMài phẳng mối hàn.' },
  { id: 1102, category: '', stt: '2', content: 'Kiểm tra hình dáng xe', unit: '-', requirement: 'Hình dạng xe phải hài hòa, cân đối.\\nĐộ không đồng phẳng ≤1,5mm;\\nTheo mẫu xe nguyên thuỷ mà TCN qui định.' },
  { id: 1103, category: '', stt: '3', content: 'Khóa cửa, tay nắm, cơ cấu nâng hạ kính', unit: '-', requirement: 'Đầy đủ, đồng bộ, hoạt động ổn định' }
];"""

content = re.sub(r'const BODY_INSPECTION_ITEMS = \[.*?\];', new_items.replace('\\', '\\\\'), content, flags=re.DOTALL)

# Update toSC
content = content.replace(
    '<p className="text-base m-0 leading-tight">Tổ S/C Máy, gầm</p>',
    '<p className="text-base m-0 leading-tight">Tổ S/C GCCK</p>'
)

# Update PHIẾU KIỂM TRA
content = content.replace(
    '<h1 className="text-xl font-bold uppercase m-0 leading-tight mb-2">PHIẾU KIỂM TRA: Số 1</h1>',
    '<h1 className="text-xl font-bold uppercase m-0 leading-tight mb-2">PHIẾU KIỂM TRA: Số 4</h1>'
)

# Update resolvedStageName
content = content.replace(
    "const resolvedStageName = stageName || 'Kiểm tra thân vỏ trước sửa chữa';",
    "const resolvedStageName = stageName || 'Kiểm tra thân vỏ trước khi sửa chữa';"
)

# Update conclusion
content = content.replace(
    "conclusion: 'Cụm thân vỏ đã được kiểm tra đúng Quy trình công nghệ.'",
    "conclusion: 'Cụm thân, vỏ xe.....................................................đã được kiểm tra đúng Quy trình công nghệ.'"
)
content = content.replace(
    "placeholder=\"Cụm thân vỏ đã được kiểm tra đúng Quy trình công nghệ.\"",
    "placeholder=\"Cụm thân, vỏ xe.....................................................đã được kiểm tra đúng Quy trình công nghệ.\""
)

# Render item.stt or index + 1
content = content.replace("{index + 1}", "{item.stt || (index + 1)}")

# Render whitespace-pre-line
content = content.replace(
    '<span className="text-right sm:text-center text-stone-800">{item.unit}</span>',
    '<span className="text-right sm:text-center text-stone-800 whitespace-pre-line">{item.unit}</span>'
)
content = content.replace(
    '<span className="text-right sm:text-center text-stone-800 font-medium sm:font-normal">{item.requirement}</span>',
    '<span className="text-right sm:text-center text-stone-800 font-medium sm:font-normal whitespace-pre-line">{item.requirement}</span>'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ Updated Body Inspection Form")
