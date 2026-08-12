import re

file_path = 'src/components/ChongGiVaTaoBeMatSonForm.tsx'
with open('src/components/TayRuaLamSachBeMatSonForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Đổi tên component
content = content.replace('TayRuaLamSachBeMatSonForm', 'ChongGiVaTaoBeMatSonForm')

# Sửa lại Cụm Công Đoạn mặc định
content = re.sub(
    r"value=\{formData\.cumCongDoan !== undefined \? formData\.cumCongDoan : 'Tẩy rửa, làm sạch bề mặt sơn'\}",
    r"value={formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Chống gỉ và tạo bề mặt sơn'}",
    content
)

# Thay SoPhieu mặc định
content = re.sub(
    r"value=\{formData\.soPhieu !== undefined \? formData\.soPhieu : '2'\}",
    r"value={formData.soPhieu !== undefined ? formData.soPhieu : '3'}",
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
  { category: 'I. SƠN CHỐNG GỈ', stt: 1, noiDung: 'Sơn phủ lớp sơn chống gỉ. Sơn không chảy thành vệt, nhăn dúm hoặc đóng cục', yeuCau: '- Sơn trên toàn bộ bề mặt kim loại cần bảo vệ.' },
  { category: 'I. SƠN CHỐNG GỈ', stt: 2, noiDung: 'Sấy khô: Sấy khô tự nhiên hoặc trong buồng sấy.', yeuCau: '- Sấy tự nhiên: 4h ÷ 6h; - Sấy trong buồng sấy: Thơi gian 30’ ÷ 40’ với nhiệt độ 60° ÷ 70°C.' },
  { category: 'II. TRÁT MATÍT', stt: 1, noiDung: 'Trát thô để lấy phẳng bề mặt cần sơn, trát theo từng lớp, lớp trước khô mới được trát lớp sau.', yeuCau: 'Chiều dày mỗi lớp trát ≤ 0,5 mm. Chiều dày toàn bộ lớp trát ≤ 2,5mm. Matít phải bám chắc.' },
  { category: 'II. TRÁT MATÍT', stt: 2, noiDung: 'Sấy khô tự nhiên', yeuCau: '2h' },
  { category: 'II. TRÁT MATÍT', stt: 3, noiDung: 'Xả khô:', yeuCau: 'Bề mặt xả phải phẳng, độ không đồng phẳng ≤ 0,25mm.' },
  { category: 'II. TRÁT MATÍT', stt: 4, noiDung: 'Sơn lót sau lớp trát, xả thô.', yeuCau: 'Sơn không chảy thành cục, nhăn, dúm hoặc đóng cục; Sơn phải phủ đều trên toàn bề mặt.' },
  { category: 'II. TRÁT MATÍT', stt: 5, noiDung: 'Trát tinh', yeuCau: 'Ma tít phải bám chắc và phải lấp những lỗ nhỏ, vết xước sau khi sơn lót; Chiều dày lớp trát ≤ 1mm.' },
  { category: 'II. TRÁT MATÍT', stt: 6, noiDung: 'Sấy khô tự nhiên hoặc trong buồng sấy', yeuCau: 'Sấy tự nhiên: 4h ÷ 6h; Hoặc sấy trong buồng sấy 30’ ÷ 40’ với nhiệt độ 60° ÷ 70°C.' },
  { category: 'II. TRÁT MATÍT', stt: 7, noiDung: 'Xả nước', yeuCau: 'Bề mặt phải phẳng, mịn, nhẵn.' },
  { category: 'II. TRÁT MATÍT', stt: 8, noiDung: 'Sơn lót sau mỗi lớp trát, xả tinh', yeuCau: 'Sơn không chảy thành vệt, nhăn, dúm hoặc đóng cục; Sơn phải phủ đều trên toàn bề mặt.' },
  { category: 'II. TRÁT MATÍT', stt: 9, noiDung: 'Sấy khô tự nhiên hoặc trong buồng sấy', yeuCau: 'Sấy tự nhiên: 1h ÷ 2h; Hoặc sấy trong buồng sấy 15’ ÷ 20’ với nhiệt độ 60° ÷ 70°C.' }
];"""
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

# Sửa kết luận
content = re.sub(
    r"value=\{formData\.ketLuan !== undefined \? formData\.ketLuan : \(formData\.conclusion \|\| '.*?'\)\}",
    r"value={formData.ketLuan !== undefined ? formData.ketLuan : (formData.conclusion || 'Thân, vỏ xe được chống gỉ và tạo bề mặt sơn đúng Quy trình công nghệ.')}",
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("1. Tạo thành công ChongGiVaTaoBeMatSonForm.tsx")
