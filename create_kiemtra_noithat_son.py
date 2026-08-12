import re

file_path = 'src/components/KiemTraNoiThatSonSauSuaChuaForm.tsx'
with open('src/components/KiemTraThanVoSauSuaChuaForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Đổi tên component
content = content.replace('KiemTraThanVoSauSuaChuaForm', 'KiemTraNoiThatSonSauSuaChuaForm')

# Sửa lại Cụm Công Đoạn mặc định
content = re.sub(
    r"value=\{formData\.cumCongDoan !== undefined \? formData\.cumCongDoan : 'Kiểm tra sau sửa chữa thân, vỏ xe'\}",
    r"value={formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Kiểm tra sau sửa chữa nội thất, sơn'}",
    content
)

# Thay SoPhieu mặc định (KiemTraThanVoSauSuaChuaForm was Phiếu 1, we want 2)
content = re.sub(
    r"value=\{formData\.soPhieu !== undefined \? formData\.soPhieu : '1'\}",
    r"value={formData.soPhieu !== undefined ? formData.soPhieu : '2'}",
    content
)

# Thay SoTo mặc định
content = re.sub(
    r"value=\{formData\.soTo !== undefined \? formData\.soTo : '2'\}",
    r"value={formData.soTo !== undefined ? formData.soTo : '1'}",
    content
)

# Chèn mảng ITEMS mới
new_items = """const ITEMS: any[] = [
  { category: 'I. NỘI THẤT', stt: 1, noiDung: 'Nệm ghế', yeuCau: 'Đủ chiều dầy, đúng màu và qui cách; đường may chắc ; đều.' },
  { category: 'I. NỘI THẤT', stt: 2, noiDung: 'Mui', yeuCau: 'Căng phẳng; vừa vặn; khoen cài; dây buộc phải chắc; đúng vị trí' },
  { category: 'I. NỘI THẤT', stt: 3, noiDung: 'Táp pi', yeuCau: 'Phủ kín và áp sát sàn xe.' },
  { category: 'I. NỘI THẤT', stt: 4, noiDung: 'Gương chiếu hậu', yeuCau: 'Trong sáng, phản chiếu rõ và xa, giá gương chắc chắn.' },
  { category: 'I. NỘI THẤT', stt: 5, noiDung: 'Trang bị đầy đủ', yeuCau: 'Tấm che nắng, đệm cao su ghế tựa sau.' },
  { category: 'I. NỘI THẤT', stt: 6, noiDung: 'La phông', yeuCau: 'Phẳng, không rách, sạch sẽ, kín các mép.' },
  { category: 'II. SƠN', stt: 1, noiDung: 'Kiểm tra bề mặt sơn', yeuCau: 'Bề mặt sơn phải mịn, phủ đều và không có khuyết tật' },
  { category: 'II. SƠN', stt: 2, noiDung: 'Kiểm tra độ bám dính và chiều dày sơn.', yeuCau: 'Kiển tra mẫu thử và thiết bị đo theo quy định của TCN.' }
];"""
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

# Sửa kết luận
content = re.sub(
    r"value=\{formData\.ketLuan !== undefined \? formData\.ketLuan : \(formData\.conclusion \|\| '.*?'\)\}",
    r"value={formData.ketLuan !== undefined ? formData.ketLuan : (formData.conclusion || 'Nội thất, sơn đã được kiểm tra đúng Quy trình công nghệ.')}",
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("1. Tạo thành công KiemTraNoiThatSonSauSuaChuaForm.tsx")
