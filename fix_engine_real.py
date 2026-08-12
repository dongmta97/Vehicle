import re
import os

file_path = 'src/components/EngineInspectionBeforeRepairForm.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Thay mảng DEFAULT_INSPECTION_ITEMS
new_items = """const DEFAULT_INSPECTION_ITEMS = [
  { id: 1, content: "Áp suất buồng đốt cuối kỳ nén", unit: "kPa\\n(kgf/cm2)", requirement: "≥700 (7,0)" },
  { id: 2, content: "Chênh lệch áp suất giữa các buồng đốt", unit: "kPa\\n(kgf/cm2)", requirement: "≤100 (1,0)" },
  { id: 3, content: "Số vòng quay không tải nhỏ nhất", unit: "v/ph", requirement: "700÷750" },
  { id: 4, content: "Số vòng quay lớn nhất", unit: "v/ph", requirement: "≥4000" },
  { id: 5, content: "Áp suất dầu bôi trơn nhỏ nhất", unit: "(kgf/cm2)", requirement: "≥60 (0,6)" },
  { id: 6, content: "Áp suất dầu bôi trơn lớn nhất", unit: "(kgf/cm2)", requirement: "Từ 450-500\\n(4,5÷5,0)" },
  { id: 7, content: "Độ võng của dây đai dẫn động máy phát và bơm nước khi ấn lực 40 N", unit: "mm", requirement: "8÷12" },
  { id: 8, content: "Bơm xăng, bơm nước, bơm dầu", unit: "", requirement: "Đúng chủng loại, hoạt động ổn định, không có tiếng kêu lạ" },
  { id: 9, content: "Két làm mát", unit: "", requirement: "Đúng chủng loại, không móp méo, dập các cánh tản nhiệt" },
  { id: 10, content: "Hệ thống đường ống nước, dầu, cao su chân máy, chân két mát, dây đai các loại", unit: "", requirement: "Không nứt, vỡ, lão hóa" },
  { id: 11, content: "Hệ thống phân phối khí", unit: "", requirement: "Đúng chủng lọa, hoạt động ổn định, tin cậy" },
  { id: 12, content: "Tình trạng các doăng phớt, chảy dầu", unit: "", requirement: "Không bị chảy dầu" }
];"""

content = re.sub(r'const DEFAULT_INSPECTION_ITEMS = \[.*?\];', new_items.replace('\\', '\\\\'), content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
