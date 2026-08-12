import re

file_path = 'src/components/LapRapHieuChinhGamForm.tsx'
with open('src/components/EngineComponentRepairForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Đổi tên component
content = content.replace('EngineComponentRepairForm', 'LapRapHieuChinhGamForm')

# Sửa lại Cụm Công Đoạn mặc định
content = re.sub(
    r"value=\{formData\.cumCongDoan !== undefined \? formData\.cumCongDoan : 'Sửa chữa chi tiết, linh kiện của cụm động cơ'\}",
    r"value={formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Lắp ráp, hiệu chỉnh, chạy rà cụm gầm'}",
    content
)

# Thay SoPhieu mặc định
content = re.sub(
    r"value=\{formData\.soPhieu !== undefined \? formData\.soPhieu : ''\}",
    r"value={formData.soPhieu !== undefined ? formData.soPhieu : '4'}",
    content
)

# Thay SoTo mặc định
content = re.sub(
    r"value=\{formData\.soTo !== undefined \? formData\.soTo : '9'\}",
    r"value={formData.soTo !== undefined ? formData.soTo : '2'}",
    content
)

# Chèn mảng ITEMS mới
new_items = """const ITEMS: any[] = [
  { category: 'I. HỆ THỐNG LÁI :', stt: 1, noiDung: 'Độ chụm bánh trước :', yeuCau: '1,5 ÷ 3 mm' },
  { category: 'I. HỆ THỐNG LÁI :', stt: 2, noiDung: 'Độ rơ vành tay lái :', yeuCau: '≤ 10°' },
  { category: 'I. HỆ THỐNG LÁI :', stt: 3, noiDung: 'Độ ổn định khi chạy thử : đầu xe không rung lắc, không đâm lệch, tuân theo sự điều khiển của lái xe. Vòng tay lái nhẹ, êm.', yeuCau: '' },
  
  { category: 'II. HỆ THỐNG PHANH:', stt: 1, noiDung: 'Thử phanh trên đường thẳng cứng và khô ở tốc độ', yeuCau: '30 km/h' },
  { category: 'II. HỆ THỐNG PHANH:', stt: '-', noiDung: 'Xe phải dừng lại hẳn trong vòng :', yeuCau: '6m\\nKhông lệch quá 8°' },
  { category: 'II. HỆ THỐNG PHANH:', stt: '-', noiDung: 'Nhiệt độ trống phanh :', yeuCau: '≤ 70°C' },
  { category: 'II. HỆ THỐNG PHANH:', stt: 2, noiDung: 'Bàn đạp phanh:', yeuCau: '' },
  { category: 'II. HỆ THỐNG PHANH:', stt: '-', noiDung: 'Hành trình tự do (mm)', yeuCau: '8 ÷ 14' },
  { category: 'II. HỆ THỐNG PHANH:', stt: '-', noiDung: 'Hành trình toàn bộ (mm)', yeuCau: '145 ÷ 155' },
  { category: 'II. HỆ THỐNG PHANH:', stt: '-', noiDung: 'Thôi đạp bàn đạp trả nhanh về vị trí ban đầu', yeuCau: '' },
  { category: 'II. HỆ THỐNG PHANH:', stt: 3, noiDung: 'Phanh tay : Giữ được xe trên dốc 14° khi kéo cần phanh không quá 4 nấc cung răng.', yeuCau: '' },
  { category: 'II. HỆ THỐNG PHANH:', stt: 4, noiDung: 'Không rò rỉ dầu phanh trên toàn bộ hệ thống.', yeuCau: '' },

  { category: 'III. LY HỢP :', stt: 1, noiDung: 'Đóng không giật, trượt, kêu ; Mở dứt khoát, không có tiếng kêu bitê.', yeuCau: '' },
  { category: 'III. LY HỢP :', stt: 2, noiDung: 'Hành trình bàn đạp ly hợp:', yeuCau: '' },
  { category: 'III. LY HỢP :', stt: '-', noiDung: 'Toàn bộ :', yeuCau: '140 ÷ 185 mm.' },
  { category: 'III. LY HỢP :', stt: '-', noiDung: 'Tự do :', yeuCau: '28 ÷ 35 mm.' },

  { category: 'IV. TRUYỀN ĐỘNG', stt: 1, noiDung: 'Hộp số chính và phụ', yeuCau: 'Ra, vào số nhẹ nhàng, tay số không tự trả, không rung lắc. Làm việc êm ở tất cả các số. Gài cầu trước phải có tác dụng.' },
  { category: 'IV. TRUYỀN ĐỘNG', stt: 2, noiDung: 'Cầu xe', yeuCau: 'Làm việc êm, không rỉ dầu' },
  { category: 'IV. TRUYỀN ĐỘNG', stt: 3, noiDung: 'Trục các đăng', yeuCau: 'Làm việc êm' },

  { category: 'V. HỆ THỐNG TREO', stt: '-', noiDung: 'Làm việc êm, không va đập, không chảy dầu.', yeuCau: '' }
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
print("1. Tạo thành công LapRapHieuChinhGamForm.tsx")
