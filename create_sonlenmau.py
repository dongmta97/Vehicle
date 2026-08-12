import re

file_path = 'src/components/SonLenMauForm.tsx'
with open('src/components/TayRuaLamSachBeMatSonForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Đổi tên component
content = content.replace('TayRuaLamSachBeMatSonForm', 'SonLenMauForm')

# Sửa lại Cụm Công Đoạn mặc định
content = re.sub(
    r"value=\{formData\.cumCongDoan !== undefined \? formData\.cumCongDoan : 'Tẩy rửa, làm sạch bề mặt sơn'\}",
    r"value={formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Sơn lên màu'}",
    content
)

# Thay SoPhieu mặc định
content = re.sub(
    r"value=\{formData\.soPhieu !== undefined \? formData\.soPhieu : '2'\}",
    r"value={formData.soPhieu !== undefined ? formData.soPhieu : '4'}",
    content
)

# Thay SoTo mặc định
content = re.sub(
    r"value=\{formData\.soTo !== undefined \? formData\.soTo : '1'\}",
    r"value={formData.soTo !== undefined ? formData.soTo : '2'}",
    content
)

# Chèn mảng ITEMS mới
new_items = """const ITEMS: any[] = [
  { category: 'I. SƠN MÀU', stt: 1, noiDung: 'Sơn màu tất cả các cụm, vị trí màu theo quy định.', yeuCau: '- Màu sơn phải đồng nhất, phủ đều và không có khuyết tật sơn; - Khung, sàn, gầm, kèo mui, giá dự phòng, cản sơn màu đen; - Khoang máy sơn màu quân đội.' },
  { category: 'II. MÀU SƠN ÁO', stt: 1, noiDung: 'Sơn phủ màu quân đội lớp áo theo quy định và theo yêu cầu của khách hàng.', yeuCau: '- Lớp sơn phải mịn, phủ đều, bám chắc và không có khuyết tật sơn; - Màu sơn phải đồng nhất.' },
  { category: 'III. TRANG TRÍ VÀ LÀM ĐẸP', stt: 1, noiDung: 'Kẻ viền, vạch, dán decal trang trí theo yêu cầu của khách hàng', yeuCau: '- Đảm bảo thẩm mỹ; - Lau sạch sơn bám dính ở những chi tiết và vị trí không được phép sơn.' },
  { category: 'III. TRANG TRÍ VÀ LÀM ĐẸP', stt: 2, noiDung: 'Sơn, kẻ biển số đảm bảo rõ ràng, sắc nét.', yeuCau: '- Theo quy định của TCN ( Nền đỏ, chữ trắng).' },
  { category: 'III. TRANG TRÍ VÀ LÀM ĐẸP', stt: 3, noiDung: 'Sơn dặm những chỗ trầy xước sau khi chạy thử.', yeuCau: '- Đảm bảo kỹ thuật. - Đồng nhất về màu sắc.' },
  { category: 'IV. KIỂM TRA - XUẤT XƯỞNG.', stt: 1, noiDung: 'Kiểm tra bề mặt sơn', yeuCau: '- Bề mặt sơn phải mịn, phủ đều và không có khuyết tật sơn.' },
  { category: 'IV. KIỂM TRA - XUẤT XƯỞNG.', stt: 2, noiDung: 'Kiểm tra độ bám dính và chiều dày sơn.', yeuCau: '- Kiển tra mẫu thử và thiết bị đo theo quy định của TCN.' },
  { category: 'IV. KIỂM TRA - XUẤT XƯỞNG.', stt: 3, noiDung: 'Kiểm tra tính đồng bộ', yeuCau: '- Phải lắp đầy đủ các bộ phận và chi tiết theo xe đảm bảo tính thẩm mỹ, hài hòa.' }
];"""
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

# Sửa kết luận
content = re.sub(
    r"value=\{formData\.ketLuan !== undefined \? formData\.ketLuan : \(formData\.conclusion \|\| '.*?'\)\}",
    r"value={formData.ketLuan !== undefined ? formData.ketLuan : (formData.conclusion || 'Thân, vỏ xe được sơn lên màu đúng Quy trình công nghệ.')}",
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("1. Tạo thành công SonLenMauForm.tsx")
