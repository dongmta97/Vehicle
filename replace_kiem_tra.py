import re

file_path = 'src/components/KiemTraSauLapDongCoForm.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace component name
content = content.replace('EngineComponentRepairForm', 'KiemTraSauLapDongCoForm')
content = content.replace('Tên TBKT: ', 'Tên TBKT: ')

# Replace ITEMS
new_items = """const ITEMS: any[] = [
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 1, noiDung: "Áp suất buồng đốt cuối kỳ nén, kPa (kgf/cm²)", yeuCau: "≥ 700 (7,0)" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 2, noiDung: "Chênh lệch áp suất giữa các buồng đốt, kPa (kgf/cm²)", yeuCau: "≤ 100 (1,0)" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 3, noiDung: "Số vòng quay không tải nhỏ nhất, v/ph", yeuCau: "700 ÷ 750" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 4, noiDung: "Số vòng quay lớn nhất, v/ph", yeuCau: "≥ 4000" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 5, noiDung: "Áp suất dầu bôi trơn nhỏ nhất, (kgf/cm²)", yeuCau: "≥ 60 (0,6)" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 6, noiDung: "Áp suất dầu bôi trơn lớn nhất, (kgf/cm²)", yeuCau: "450 ÷ 500 (4,5 ÷ 5,0)" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 7, noiDung: "Độ võng của dây đai dẫn động máy phát và bơm nước khi ấn lực 40 N, mm", yeuCau: "8 ÷ 12" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 8, noiDung: "Bơm xăng, bơm nước, bơm dầu", yeuCau: "Đúng chủng loại, hoạt động ổn định, không có tiếng kêu lạ" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 9, noiDung: "Két làm mát", yeuCau: "Đúng chủng loại, không móp méo, dập các cánh tản nhiệt" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 10, noiDung: "Hệ thống đường ống nước, dầu, cao su chân máy, chân két mát, dây đai các loại", yeuCau: "Không nứt, vỡ, lão hóa" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 11, noiDung: "Hệ thống phân phối khí", yeuCau: "Đúng chủng loại, hoạt động ổn định, tin cậy" }
];"""

# Replace the ITEMS block
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated KiemTraSauLapDongCoForm.tsx")
