import re

file_path = 'src/components/XuLyBeMatThanVoForm.tsx'
with open('src/components/EngineComponentRepairForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Đổi tên component
content = content.replace('EngineComponentRepairForm', 'XuLyBeMatThanVoForm')

# Sửa lại Cụm Công Đoạn mặc định
content = re.sub(
    r"value=\{formData\.cumCongDoan !== undefined \? formData\.cumCongDoan : 'Sửa chữa chi tiết, linh kiện của cụm động cơ'\}",
    r"value={formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Xử lý bề mặt thân, vỏ xe'}",
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
  { category: 'I. NỘI DUNG SỬA CHỮA', stt: 1, noiDung: 'Vệ sinh bề mặt', yeuCau: 'Các bề mặt sạch sẽ' },
  { category: 'I. NỘI DUNG SỬA CHỮA', stt: 2, noiDung: 'Các vết nứt hoặc mọt gỉ sâu', yeuCau: 'Hàn táp, vết nứt phải được khoan lỗ chặn 2 đầu' }
];"""
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

# Sửa kết luận
content = re.sub(
    r"value=\{formData\.ketLuan !== undefined \? formData\.ketLuan : \(formData\.conclusion \|\| ''\)\}",
    r"value={formData.ketLuan !== undefined ? formData.ketLuan : (formData.conclusion || 'Thân, vỏ xe được xử lý bề mặt đúng Quy trình công nghệ.')}",
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
print("1. Tạo thành công XuLyBeMatThanVoForm.tsx")
