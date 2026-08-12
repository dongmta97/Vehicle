import re

file_path = 'src/components/TayRuaLamSachCumGamForm.tsx'
with open('src/components/EngineComponentRepairForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Đổi tên component
content = content.replace('EngineComponentRepairForm', 'TayRuaLamSachCumGamForm')

# Sửa lại Cụm Công Đoạn mặc định
content = re.sub(
    r"value=\{formData\.cumCongDoan !== undefined \? formData\.cumCongDoan : 'Sửa chữa chi tiết, linh kiện của cụm động cơ'\}",
    r"value={formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Tẩy rửa, làm sạch chi tiết'}",
    content
)

# Thay SoPhieu mặc định
content = re.sub(
    r"value=\{formData\.soPhieu !== undefined \? formData\.soPhieu : ''\}",
    r"value={formData.soPhieu !== undefined ? formData.soPhieu : '2'}",
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
  { category: 'I. TẨY RỬA LÀM SẠCH CHI TIẾT', stt: 1, noiDung: 'Hộp số', yeuCau: 'Thay dầu, tẩy rửa làm sạch các mạt trong hộp số' },
  { category: 'I. TẨY RỬA LÀM SẠCH CHI TIẾT', stt: 2, noiDung: 'Hệ thống treo', yeuCau: '' },
  { category: 'I. TẨY RỬA LÀM SẠCH CHI TIẾT', stt: '-', noiDung: 'Các bó nhíp', yeuCau: 'Sạch sẽ, không han rỉ\\nThoa lớp mỡ chì mỏng sau khi vệ sinh, làm sạch' },
  { category: 'I. TẨY RỬA LÀM SẠCH CHI TIẾT', stt: 3, noiDung: 'Bơm cái, bơm con', yeuCau: 'Thay dầu phanh, súc rửa sạch sẽ.' },
  { category: 'I. TẨY RỬA LÀM SẠCH CHI TIẾT', stt: 4, noiDung: 'Cầu xe', yeuCau: 'Thay dầu, súc rửa sạch sẽ' },
  { category: 'I. TẨY RỬA LÀM SẠCH CHI TIẾT', stt: 5, noiDung: 'Vòng bi moay ơ, ổ bi kim chữ thập, rãnh then hoa, ổ bi tỳ ly hợp', yeuCau: 'Tẩy rửa, tra mỡ dầy đủ' },
  { category: 'I. TẨY RỬA LÀM SẠCH CHI TIẾT', stt: 6, noiDung: 'Bề mặt tang trống, má phanh', yeuCau: 'Làm sạch, tẩy các vết ăn mòn không đều' },
];"""
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("1. Tạo thành công TayRuaLamSachCumGamForm.tsx")
