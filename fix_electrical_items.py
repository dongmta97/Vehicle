import re
import os

file_path = 'src/components/EngineInspectionBeforeRepairForm.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace ELECTRICAL_INSPECTION_ITEMS
new_items = """const ELECTRICAL_INSPECTION_ITEMS = [
  { id: 701, category: '', stt: '1', content: "Máy phát", unit: "", requirement: "Hoạt động ổn định, vỏ không móp méo, có tiếng kêu lạ" },
  { id: 702, category: '', stt: '-', content: "Điện áp khi khởi động", unit: "V", requirement: "≥10,5" },
  { id: 703, category: '', stt: '-', content: "Điện áp tại vòng quay lớn nhất", unit: "V", requirement: "13,6÷14,7" },
  { id: 704, category: '', stt: '2', content: "Máy khởi động", unit: "", requirement: "Hoạt động ổn định, vỏ không móp méo, có tiếng kêu lạ" },
  { id: 705, category: '', stt: '3', content: "Hệ thống đèn tín hiệu, chiếu sáng, còi", unit: "", requirement: "Đúng chủng loại, hoạt động ổn định, tin cậy" },
  { id: 706, category: '', stt: '4', content: "Hệ thống cảm biến, đồng hồ", unit: "", requirement: "Đúng chủng loại, hoạt động ổn định, tin cậy" },
  { id: 707, category: '', stt: '5', content: "Hệ thống gạt mưa, bơm nước rửa kính", unit: "", requirement: "Đúng chủng loại, hoạt động ổn định, tin cậy" },
  { id: 708, category: '', stt: '6', content: "Bó dây điện", unit: "", requirement: "Không vỡ, nứt, chạm chập" },
  { id: 709, category: '', stt: '7', content: "Hệ thống đánh lửa", unit: "", requirement: "Đúng chủng loại, hoạt động ổn định, tin cậy" },
  { id: 710, category: '', stt: '8', content: "Bình điện, khóa điện", unit: "", requirement: "Đầy đủ, không nứt vỡ, hoạt động ổn định" }
];"""

content = re.sub(r'const ELECTRICAL_INSPECTION_ITEMS = \[.*?\];', new_items, content, flags=re.DOTALL)

# Update toSC
content = content.replace(
    '<p className="text-base m-0 leading-tight">Tổ S/C Máy, gầm</p>',
    '<p className="text-base m-0 leading-tight">{templateType === \'ELECTRICAL_PRE_REPAIR\' ? \'Tổ S/C Điện\' : \'Tổ S/C Máy, gầm\'}</p>'
)

# Update PHIẾU KIỂM TRA
content = content.replace(
    '<h1 className="text-xl font-bold uppercase m-0 leading-tight mb-2">PHIẾU KIỂM TRA: Số {templateType === \'CHASSIS_PRE_REPAIR\' ? \'2\' : \'1\'}</h1>',
    '<h1 className="text-xl font-bold uppercase m-0 leading-tight mb-2">PHIẾU KIỂM TRA: Số {templateType === \'ELECTRICAL_PRE_REPAIR\' ? \'3\' : templateType === \'CHASSIS_PRE_REPAIR\' ? \'2\' : \'1\'}</h1>'
)

# Update resolvedStageName fallback just in case
content = content.replace(
    "const resolvedStageName = stageName || 'Kiểm tra động cơ trước khi sửa chữa';",
    "const resolvedStageName = stageName || (templateType === 'ELECTRICAL_PRE_REPAIR' ? 'Kiểm tra phần điện trước khi sửa chữa' : templateType === 'CHASSIS_PRE_REPAIR' ? 'Kiểm tra phần gầm trước khi sửa chữa' : 'Kiểm tra động cơ trước khi sửa chữa');"
)

# Update conclusion states
old_conclusion = "conclusion: templateType === 'CHASSIS_PRE_REPAIR' ? 'Phần gầm trước khi vào sửa chữa đã được kiểm tra đúng Quy trình công nghệ.' : 'Cụm động cơ đã được kiểm tra đúng Quy trình công nghệ.'"
new_conclusion = "conclusion: templateType === 'ELECTRICAL_PRE_REPAIR' ? 'Phần điện đã được kiểm tra đúng Quy trình công nghệ.' : templateType === 'CHASSIS_PRE_REPAIR' ? 'Phần gầm trước khi vào sửa chữa đã được kiểm tra đúng Quy trình công nghệ.' : 'Cụm động cơ đã được kiểm tra đúng Quy trình công nghệ.'"

content = content.replace(old_conclusion, new_conclusion)

# Update conclusion placeholder
old_placeholder = "placeholder={templateType === 'CHASSIS_PRE_REPAIR' ? 'Phần gầm trước khi vào sửa chữa đã được kiểm tra đúng Quy trình công nghệ.' : 'Cụm động cơ đã được kiểm tra đúng Quy trình công nghệ.'}"
new_placeholder = "placeholder={templateType === 'ELECTRICAL_PRE_REPAIR' ? 'Phần điện đã được kiểm tra đúng Quy trình công nghệ.' : templateType === 'CHASSIS_PRE_REPAIR' ? 'Phần gầm trước khi vào sửa chữa đã được kiểm tra đúng Quy trình công nghệ.' : 'Cụm động cơ đã được kiểm tra đúng Quy trình công nghệ.'}"

content = content.replace(old_placeholder, new_placeholder)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ Updated Electrical Inspection Form")
