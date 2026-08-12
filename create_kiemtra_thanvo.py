import re

file_path = 'src/components/KiemTraThanVoSauSuaChuaForm.tsx'
with open('src/components/KiemTraSauTongLapGamForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Đổi tên component
content = content.replace('KiemTraSauTongLapGamForm', 'KiemTraThanVoSauSuaChuaForm')

# Sửa lại Cụm Công Đoạn mặc định
content = re.sub(
    r"value=\{formData\.cumCongDoan !== undefined \? formData\.cumCongDoan : 'Kiểm tra sau tổng lắp Gầm'\}",
    r"value={formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Kiểm tra sau sửa chữa thân, vỏ xe'}",
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
  { category: 'I. KHUNG XE', stt: 1, noiDung: 'Vệ sinh toàn bộ', yeuCau: 'Ngâm rửa sạch' },
  { category: 'I. KHUNG XE', stt: 2, noiDung: 'Độ cong vênh', yeuCau: '' },
  { category: 'I. KHUNG XE', stt: '-', noiDung: 'Các dầm dọc', yeuCau: 'Không bị biến dạng.' },
  { category: 'I. KHUNG XE', stt: '-', noiDung: 'Độ không phẳng của mặt trên của dầm dọc ở khoảng giữa khung.', yeuCau: '< 2,5mm trên chiều dài 100' },
  { category: 'I. KHUNG XE', stt: '-', noiDung: 'Sai lệch khoảng cách A và B\\n(A = khoảng cách từ trục nhíp trước bên trái đến trục nhíp sau bên phải.)\\n(B = khoảng cách từ trục nhíp trước bên phải đến trục nhíp sau bên trái.)', yeuCau: '< 7mm' },
  { category: 'I. KHUNG XE', stt: 3, noiDung: 'Các vết nứt hoặc mọt gỉ sâu. Phải được hàn táp. Vết nứt phải được khoan lỗ chặn 2 đầu, chiều dài miếng táp.', yeuCau: '≤ 200mm' },
  { category: 'I. KHUNG XE', stt: 4, noiDung: 'Các mối ghép bằng đinh tán', yeuCau: 'Phải cứng chắc. Mũ đinh tán phải ngấu chắc và không lệch rõ so với lỗ đinh.' },
  { category: 'I. KHUNG XE', stt: 5, noiDung: 'Cản trước – sau, bát, giá đỡ', yeuCau: 'Không bị biến dạng hư hỏng. Được tán hoặc bắt chặt trên khung.' },
  { category: 'I. KHUNG XE', stt: 6, noiDung: 'Móc kéo', yeuCau: 'Mở, đóng không gắt, kẹt, khi đóng phải khóa chắc, có đủ chốt, xích giữ.' },
  { category: 'I. KHUNG XE', stt: 7, noiDung: 'Sơn chống gỉ', yeuCau: 'Lớp sơn phủ kín, đều, không bong tróc.' },

  { category: 'II. Thân xe', stt: 1, noiDung: 'Vệ sinh toàn bộ', yeuCau: 'Phải sạch, khô.' },
  { category: 'II. Thân xe', stt: 2, noiDung: 'Hình dáng thân xe sau khi sửa chữa', yeuCau: '' },
  { category: 'II. Thân xe', stt: '-', noiDung: 'Các bề mặt ngoài', yeuCau: 'Độ không nhẵn ≤ 1mm' },
  { category: 'II. Thân xe', stt: '-', noiDung: 'Các chỗ vá so với phần còn lại phải phù hợp về hình dạng, liên kết, bề dầy tôn', yeuCau: 'Mối hàn phải được mài nhẵn.' },
  { category: 'II. Thân xe', stt: 3, noiDung: 'Khung kính chắn gió, kính cửa:', yeuCau: '' },
  { category: 'II. Thân xe', stt: '-', noiDung: 'Sai lệch so với dưỡng mẫu áp vào gờ lắp kính.', yeuCau: '≤ 1mm' },
  { category: 'II. Thân xe', stt: '-', noiDung: 'Gờ lắp kính', yeuCau: 'Đủ bề dày, rộng' },
  { category: 'II. Thân xe', stt: 4, noiDung: 'Khung kính lấy gió', yeuCau: 'Không rơ lỏng, khi đóng phải kín khít.' },
  { category: 'II. Thân xe', stt: 5, noiDung: 'Kính hông và cơ cấu nâng hạ', yeuCau: 'Làm việc nhẹ nhàng, hết tầm kín khít. Tay quay không rơ lỏng.' },
  { category: 'II. Thân xe', stt: 6, noiDung: 'Cửa hông, cửa hậu với khung cửa:', yeuCau: '' },
  { category: 'II. Thân xe', stt: '-', noiDung: 'Khe hở mép cửa hông với khung cửa.', yeuCau: '2 ÷ 5 mm' },
  { category: 'II. Thân xe', stt: '-', noiDung: 'Khe hở mép cửa hậu:\\n+ Theo viền bên\\n+ Theo viền đáy', yeuCau: '2 ÷ 6 mm\\n5 ÷ 9 mm' },
  { category: 'II. Thân xe', stt: 7, noiDung: 'Nắp cabô', yeuCau: '- Phải cứng vững, khi đậy nắp khe hở phải rà đều, đầy đủ móc khoá.' },
  { category: 'II. Thân xe', stt: 8, noiDung: 'Sơn chống gỉ các chỗ hàn, vá, chỗ khuất', yeuCau: '- Lớp sơn phủ kín, đều, không bong tróc.' }
];"""
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

# Sửa kết luận
content = re.sub(
    r"value=\{formData\.ketLuan !== undefined \? formData\.ketLuan : \(formData\.conclusion \|\| '.*?'\)\}",
    r"value={formData.ketLuan !== undefined ? formData.ketLuan : (formData.conclusion || 'Thân, vỏ đã được kiểm tra đúng Quy trình công nghệ.')}",
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("1. Tạo thành công KiemTraThanVoSauSuaChuaForm.tsx")
