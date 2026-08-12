import re

file_path = 'src/components/TayRuaLamSachBeMatSonForm.tsx'
with open('src/components/EngineComponentRepairForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Đổi tên component
content = content.replace('EngineComponentRepairForm', 'TayRuaLamSachBeMatSonForm')

# Sửa lại Cụm Công Đoạn mặc định
content = re.sub(
    r"value=\{formData\.cumCongDoan !== undefined \? formData\.cumCongDoan : 'Sửa chữa chi tiết, linh kiện của cụm động cơ'\}",
    r"value={formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Tẩy rửa, làm sạch bề mặt sơn'}",
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
  { category: 'I. KIỂM TRA LÀM SẠCH', stt: 1, noiDung: 'Kiểm tra đồng: Xe phải cứng chắc, mối hàn phải phẳng, ngấu đều.', yeuCau: '- Vỏ xe không bập bùng;\\n- Không có rỗ mọt trên toàn xe;\\n- Mài phẳng mối hàn.' },
  { category: 'I. KIỂM TRA LÀM SẠCH', stt: 2, noiDung: 'Làm sạch xe.', yeuCau: '- Làm sạch đất, dầu mơ;\\n- Làm sạch xỉ hàn.' },
  { category: 'I. KIỂM TRA LÀM SẠCH', stt: 3, noiDung: 'Kiểm tra hình dáng : Hình dạng xe phải hài hoa, cân đối.', yeuCau: '- Độ không đồng phẳng ≤1,5mm;\\n- Theo mẫu xe nguyên thuỷ mà TCN qui định.' },
  { category: 'II. MÀI VÀ LÀM SẠCH BỀ MẶT', stt: 1, noiDung: 'Mài sạch lớp sơn cũ', yeuCau: '- Mài đến lớp kim loại.' },
  { category: 'II. MÀI VÀ LÀM SẠCH BỀ MẶT', stt: 2, noiDung: 'Chà nhám bề mặt trước khi sơn', yeuCau: '- Bề mặt cần sơn không còn bụi mài.' },
  { category: 'III. ĐỒNG BỘ', stt: 1, noiDung: 'Phải có đủ bộ phận chi tiết đồng bộ theo xe.', yeuCau: '- Nắp che hộp số, ghế …v.v..' },
  { category: 'III. ĐỒNG BỘ', stt: 2, noiDung: 'Xử lý bề mặt không sơn.', yeuCau: '- Bôi mỡ công nghiệp, quấn băng dính vào những chi tiết, vị trí không sơn.' }
];"""
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

# Sửa kết luận
content = re.sub(
    r"value=\{formData\.ketLuan !== undefined \? formData\.ketLuan : \(formData\.conclusion \|\| ''\)\}",
    r"value={formData.ketLuan !== undefined ? formData.ketLuan : (formData.conclusion || 'Thân, vỏ xe được tẩy rửa làm sạch đúng Quy trình công nghệ.')}",
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
print("1. Tạo thành công TayRuaLamSachBeMatSonForm.tsx")
