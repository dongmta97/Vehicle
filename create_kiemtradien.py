import re

file_path = 'src/components/KiemTraSauTongLapDienForm.tsx'
with open('src/components/KiemTraSauTongLapGamForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Đổi tên component
content = content.replace('KiemTraSauTongLapGamForm', 'KiemTraSauTongLapDienForm')

# Sửa lại Cụm Công Đoạn mặc định
content = re.sub(
    r"value=\{formData\.cumCongDoan !== undefined \? formData\.cumCongDoan : 'Kiểm tra sau tổng lắp Gầm'\}",
    r"value={formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Kiểm tra sau tổng lắp hệ thống điện'}",
    content
)

# Chèn mảng ITEMS mới
new_items = """const ITEMS: any[] = [
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 1, noiDung: 'Máy phát', yeuCau: 'Hoạt động ổn định, vỏ không móp méo, có tiếng kêu lạ' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: '-', noiDung: 'Điện áp khi khởi động (V)', yeuCau: '≥10,5' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: '-', noiDung: 'Điện áp tại vòng quay lớn nhất (V)', yeuCau: '13,6÷14,7' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 2, noiDung: 'Máy khởi động', yeuCau: 'Hoạt động ổn định, vỏ không móp méo, có tiếng kêu lạ' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 3, noiDung: 'Hệ thống đèn tín hiệu, chiếu sáng, còi', yeuCau: 'Đúng chủng loại, hoạt động ổn định, tin cậy' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 4, noiDung: 'Hệ thống cảm biến, đồng hồ', yeuCau: 'Đúng chủng loại, hoạt động ổn định, tin cậy' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 5, noiDung: 'Hệ thống gạt mưa, bơm nước rửa kính', yeuCau: 'Đúng chủng loại, hoạt động ổn định, tin cậy' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 6, noiDung: 'Bó dây điện', yeuCau: 'Không vỡ, nứt, chạm chập' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 7, noiDung: 'Hệ thống đánh lửa', yeuCau: 'Đúng chủng loại, hoạt động ổn định, tin cậy' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 8, noiDung: 'Bình điện, khóa điện', yeuCau: 'Đầy đủ, không nứt vỡ, hoạt động ổn định' }
];"""
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("1. Tạo thành công KiemTraSauTongLapDienForm.tsx")
