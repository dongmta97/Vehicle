import re

file_path = 'src/components/TayRuaLamSachCumDienForm.tsx'
with open('src/components/EngineComponentRepairForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Đổi tên component
content = content.replace('EngineComponentRepairForm', 'TayRuaLamSachCumDienForm')

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
  { category: 'I. MÁY PHÁT', stt: 1, noiDung: 'MÁY PHÁT', yeuCau: '' },
  { category: 'I. MÁY PHÁT', stt: '-', noiDung: 'Chổi than', yeuCau: 'Sạch sẽ, tiếp xúc đều với cổ góp' },
  { category: 'I. MÁY PHÁT', stt: '-', noiDung: 'Cổ góp', yeuCau: 'Sạch sẽ, tiếp xúc đều với chổi than' },
  { category: 'II. MÁY KHỞI ĐỘNG', stt: 2, noiDung: 'MÁY KHỞI ĐỘNG', yeuCau: '' },
  { category: 'II. MÁY KHỞI ĐỘNG', stt: '-', noiDung: 'Chổi than', yeuCau: 'Sạch sẽ, tiếp xúc đều với cổ góp' },
  { category: 'II. MÁY KHỞI ĐỘNG', stt: '-', noiDung: 'Cổ góp', yeuCau: 'Sạch sẽ, tiếp xúc đều với chổi than' },
  { category: 'III. BỘ CHIA ĐIỆN', stt: 3, noiDung: 'BỘ CHIA ĐIỆN', yeuCau: '' },
  { category: 'III. BỘ CHIA ĐIỆN', stt: '-', noiDung: 'Tiếp điểm', yeuCau: 'Không mòn, cháy, rỗ mặt tiếp xúc' },
  { category: 'III. BỘ CHIA ĐIỆN', stt: '-', noiDung: 'Bugi', yeuCau: 'Sạch sẽ, không bám bụi than' }
];"""
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

# Sửa kết luận
content = re.sub(
    r"value=\{formData\.ketLuan !== undefined \? formData\.ketLuan : \(formData\.conclusion \|\| ''\)\}",
    r"value={formData.ketLuan !== undefined ? formData.ketLuan : (formData.conclusion || 'Chi tiết, linh kiện của cụm, khối được tẩy rửa làm sạch đúng Quy trình công nghệ.')}",
    content
)

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
print("1. Tạo thành công TayRuaLamSachCumDienForm.tsx")
