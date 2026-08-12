import re

file_path = 'src/components/TongThaoCumDienForm.tsx'
with open('src/components/EngineComponentRepairForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Đổi tên component
content = content.replace('EngineComponentRepairForm', 'TongThaoCumDienForm')

# Sửa lại Cụm Công Đoạn mặc định
content = re.sub(
    r"value=\{formData\.cumCongDoan !== undefined \? formData\.cumCongDoan : 'Sửa chữa chi tiết, linh kiện của cụm động cơ'\}",
    r"value={formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Tổng tháo hệ thống điện'}",
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
  { category: 'I. Hệ thống đèn tín hiệu, chiếu sáng', stt: 1, noiDung: 'Đèn các loại', yeuCau: 'Không bị nứt vỡ, mờ đục, nước vào' },
  { category: 'I. Hệ thống đèn tín hiệu, chiếu sáng', stt: 2, noiDung: 'Khóa đèn', yeuCau: 'Hoạt động ổn định' },
  { category: 'I. Hệ thống đèn tín hiệu, chiếu sáng', stt: 3, noiDung: 'Bóng đèn', yeuCau: 'Không cháy, đủ độ sáng' },
  { category: 'I. Hệ thống đèn tín hiệu, chiếu sáng', stt: 4, noiDung: 'Bảng đồng hồ, đèn cảnh báo', yeuCau: 'Đúng chủng loại, đồng bộ với bảng đồng hồ tổng hợp' },
  { category: 'I. Hệ thống đèn tín hiệu, chiếu sáng', stt: 5, noiDung: 'Dây điện', yeuCau: 'Đúng kích cỡ. màu dây, không chạm chập' },
  { category: 'I. Hệ thống đèn tín hiệu, chiếu sáng', stt: 6, noiDung: 'Khuyết đầu dây + rắc cắm', yeuCau: 'Không rơ lỏng, móp méo' },
  { category: 'I. Hệ thống đèn tín hiệu, chiếu sáng', stt: 7, noiDung: 'Chổi gạt nước', yeuCau: 'Tỳ sát vào mặt kính, hoạt động linh hoạt' },
  { category: 'I. Hệ thống đèn tín hiệu, chiếu sáng', stt: 8, noiDung: 'Mô tơ gạt nước', yeuCau: 'Hoạt động linh hoạt' },
  { category: 'I. Hệ thống đèn tín hiệu, chiếu sáng', stt: 9, noiDung: 'Cảm biến nhiệt độ nước', yeuCau: 'Hoạt động linh hoạt' },
  { category: 'I. Hệ thống đèn tín hiệu, chiếu sáng', stt: 10, noiDung: 'Cảm biến báo áp suất dầu', yeuCau: 'Hoạt động linh hoạt' },
  { category: 'I. Hệ thống đèn tín hiệu, chiếu sáng', stt: 11, noiDung: 'Còi điện', yeuCau: 'Đủ âm lượng, không nứt, vỡ' },
  { category: 'I. Hệ thống đèn tín hiệu, chiếu sáng', stt: 12, noiDung: 'Tay gạt xin đường', yeuCau: 'Hoạt động ổng định' },
  { category: 'I. Hệ thống đèn tín hiệu, chiếu sáng', stt: 13, noiDung: 'Bơm nước rửakính', yeuCau: 'Không tắc, phun ổn định' },
  
  { category: 'II. Hệ thống điện động cơ', stt: 1, noiDung: 'Máy phát điện', yeuCau: 'Chổi than không mòn cháy, các cuộn dây, thép từ không bị cháy, dàn đi ốt không thủng, tiết chế hoạt động tốt' },
  { category: 'II. Hệ thống điện động cơ', stt: 2, noiDung: 'Máy khởi động', yeuCau: 'Các cuộn dây, thép từ không bị đứt, chập cháy, bánh răng khởi động không bị sứt mẻ, hoạt động linh hoạt, ổn định' },
  { category: 'II. Hệ thống điện động cơ', stt: 3, noiDung: 'Bugi', yeuCau: 'Không nứt vớ, không mòn điện cực, đánh lửa tốt' },
  { category: 'II. Hệ thống điện động cơ', stt: 4, noiDung: 'Bình điện', yeuCau: 'Không nứt vỡ, không mòn điện cực' },
  { category: 'II. Hệ thống điện động cơ', stt: 5, noiDung: 'Khóa điện', yeuCau: 'Hoạt động ổn định' }
];"""
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

# Fix input value bugs
content = re.sub(
    r"value=\{formData\.tenTBKT !== undefined \? formData\.tenTBKT : formData\.vehicleName\}",
    r"value={formData.tenTBKT !== undefined ? formData.tenTBKT : (formData.vehicleName || \"\")}",
    content
)
content = re.sub(
    r"value=\{formData\.soHieu !== undefined \? formData\.soHieu : formData\.vehicleNumber\}",
    r"value={formData.soHieu !== undefined ? formData.soHieu : (formData.vehicleNumber || \"\")}",
    content
)
content = re.sub(
    r"value=\{formData\.soXX !== undefined \? formData\.soXX : formData\.xxNumber1\}",
    r"value={formData.soXX !== undefined ? formData.soXX : (formData.xxNumber1 || \"\")}",
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("1. Tạo thành công TongThaoCumDienForm.tsx")
