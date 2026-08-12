import re

file_path = 'src/components/KiemTraSauTongLapGamForm.tsx'
with open('src/components/KiemTraSauLapDongCoForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Đổi tên component
content = content.replace('KiemTraSauLapDongCoForm', 'KiemTraSauTongLapGamForm')

# Sửa lại Cụm Công Đoạn mặc định
content = re.sub(
    r"value=\{formData\.cumCongDoan !== undefined \? formData\.cumCongDoan : 'Sửa chữa chi tiết, linh kiện của cụm động cơ'\}",
    r"value={formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Kiểm tra sau tổng lắp Gầm'}",
    content
)

# Thay SoPhieu mặc định
content = re.sub(
    r"value=\{formData\.soPhieu !== undefined \? formData\.soPhieu : ''\}",
    r"value={formData.soPhieu !== undefined ? formData.soPhieu : '1'}",
    content
)

# Thay SoTo mặc định
content = re.sub(
    r"value=\{formData\.soTo !== undefined \? formData\.soTo : '9'\}",
    r"value={formData.soTo !== undefined ? formData.soTo : '1'}",
    content
)

# Chèn mảng ITEMS mới
new_items = """const ITEMS: any[] = [
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 1, noiDung: 'Độ chụm bánh xe dẫn hướng, mm', yeuCau: '1,5 ÷ 3' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 2, noiDung: 'Hệ thống phanh', yeuCau: 'Hoạt động tin cậy, không bị bó kẹt' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: '-', noiDung: 'Bộ dẫn động thủy lực trợ lực chân không', yeuCau: 'Kín, làm việc tốt' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: '-', noiDung: 'Hành trình tự do bàn đạp phanh, mm', yeuCau: '8 ÷ 14' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 3, noiDung: 'Ly hợp', yeuCau: 'Đóng êm dịu, ngắt dứt khoát, không bị trượt' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: '-', noiDung: 'Ổ bi tì', yeuCau: 'Tra đủ mỡ, không có tiếng kêu bất thường' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: '-', noiDung: 'Bộ trợ lực khí nén', yeuCau: 'Kín, hoạt động tốt' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: '-', noiDung: 'Hành trình tự do bàn đạp ly hợp, mm', yeuCau: '28 ÷ 35' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 4, noiDung: 'Hộp số', yeuCau: 'Hoạt động ổn định, khong có tiếng kêu bất thường, ra vào số dễ dàng, không nhảy số' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 5, noiDung: 'Các đăng', yeuCau: 'Hoạt động ổn định, không có tiếng kêu bất thường' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 6, noiDung: 'Cầu xe', yeuCau: 'Không có độ rơ dọc trục, khớp chuyển hướng không phát ra tiếng kêu khi làm việc' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 7, noiDung: 'Hệ thống lái', yeuCau: 'Hoạt động ổn định, đánh lái, trả lái dễ dàng, không chảy dầu' },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: '-', noiDung: 'Độ rơ vành tay lái, độ', yeuCau: '≤ 10' }
];"""
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("1. Tạo thành công KiemTraSauTongLapGamForm.tsx")
