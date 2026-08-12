import re

file_path = 'src/components/ThuNghiemTongTheForm.tsx'
with open('src/components/PhieuTongLapTrangBiKyThuatForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Đổi tên component
content = content.replace('PhieuTongLapTrangBiKyThuatForm', 'ThuNghiemTongTheForm')

# Sửa Tổ mặc định
content = re.sub(
    r"value=\{formData\.toSC !== undefined \? formData\.toSC : 'Tổ S/C Máy, gầm, điện, GCCK'\}",
    r"value={formData.toSC !== undefined ? formData.toSC : 'Tổ S/C Máy, gầm, điện'}",
    content
)

# Sửa lại Cụm Công Đoạn thành Sản phẩm thử nghiệm
content = re.sub(
    r"value=\{formData\.cumCongDoan !== undefined \? formData\.cumCongDoan : 'Tổng lắp trang thiết bị kỹ thuật'\}",
    r"value={formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Thử nghiệm tổng thể TBKT'}",
    content
)
content = content.replace('Cụm - Công đoạn:', 'Sản phẩm thử nghiệm:')
content = content.replace('PHIẾU KIỂM TRA:', 'PHIẾU THỬ NGHIỆM SẢN PHẨM:')

# Thay SoPhieu mặc định
content = re.sub(
    r"value=\{formData\.soPhieu !== undefined \? formData\.soPhieu : '2'\}",
    r"value={formData.soPhieu !== undefined ? formData.soPhieu : '1'}",
    content
)

# Thay SoTo mặc định
content = re.sub(
    r"value=\{formData\.soTo !== undefined \? formData\.soTo : '12'\}",
    r"value={formData.soTo !== undefined ? formData.soTo : '3'}",
    content
)

# Xoá Tổ trưởng
content = re.sub(
    r'<div className="text-center flex flex-col items-center">.*?<p className="font-bold text-\[15px\] mb-12">TỔ TRƯỞNG</p>.*?</div>',
    '',
    content,
    flags=re.DOTALL
)

# Đổi column header from 4 back to 3 since we removed To Truong
content = content.replace('<div className="grid grid-cols-4 gap-4 mt-4">', '<div className="grid grid-cols-3 gap-4 mt-4">')

# Chèn mảng ITEMS mới
new_items = """const ITEMS: any[] = [
  { category: '', stt: 1, noiDung: 'Áp suất buồng đốt cuối kỳ nén các xy lanh động cơ, kPa (kgf/cm2), không nhỏ hơn', yeuCau: '700 (7,0)' },
  { category: '', stt: 2, noiDung: 'Chênh lệch áp suất giữa các xy lanh, kPa (kgf/cm2), không lớn hơn', yeuCau: '100 (1,0)' },
  { category: '', stt: 3, noiDung: 'Số vòng quay không tải nhỏ nhất, r/min, trong khoảng:', yeuCau: '700 ÷ 750' },
  { category: '', stt: 4, noiDung: 'Số vòng quay lớn nhất, r/ min, không nhỏ hơn', yeuCau: '4 000' },
  { category: '', stt: 5, noiDung: 'Áp suất dầu bôi trơn nhỏ nhất, kPa (kgf/cm2), không nhỏ hơn', yeuCau: '60 (0,6)' },
  { category: '', stt: 6, noiDung: 'Áp suất dầu bôi trơn lớn nhất, kPa (kgf/cm2), trong khoảng', yeuCau: '450 ÷ 500 (4,5 ÷ 5,0)' },
  { category: '', stt: 7, noiDung: 'Dòng điện khi máy khởi động quay không tải, A, không lớn hơn', yeuCau: '85' },
  { category: '', stt: 8, noiDung: 'Điện áp khi khởi động, V, không nhỏ hơn', yeuCau: '10,5' },
  { category: '', stt: 9, noiDung: 'Vòng quay khi máy phát bắt đầu phát điện, r/ min, không lớn hơn', yeuCau: '800' },
  { category: '', stt: 10, noiDung: 'Điện áp tại vòng quay lớn nhất, V, trong khoảng', yeuCau: '13,6 ÷ 14,7' },
  { category: '', stt: 11, noiDung: 'Khe hở cò mổ-xupap xả của xy lanh số 1 và 4, mm, trong khoảng', yeuCau: '0,3 ÷ 0,35' },
  { category: '', stt: 12, noiDung: 'Khe hở cò mổ-xupap của các xy lanh còn lại, mm, trong khoảng', yeuCau: '0,35 ÷ 0,4' },
  { category: '', stt: 13, noiDung: 'Khe hở giữa các điện cực của nến điện, mm, trong khoảng', yeuCau: '0,85 ÷ 1,00' },
  { category: '', stt: 14, noiDung: 'Độ võng của dây đai dẫn động quạt gió (khi ấn lực 45 N) giữa dây đai, mm, trong khoảng', yeuCau: '8 ÷ 12' },
  { category: '', stt: 15, noiDung: 'Độ chụm bánh xe, mm, trong khoảng', yeuCau: '1,5 ÷ 3,0' },
  { category: '', stt: 16, noiDung: 'Góc quay lớn nhất của bánh dẫn hướng, độ, trong khoảng', yeuCau: '26 ÷ 27' },
  { category: '', stt: 17, noiDung: 'Độ rơ vành tay lái, độ, không lớn hơn', yeuCau: '10' },
  { category: '', stt: 18, noiDung: 'Hành trình tự do bàn đạp phanh, mm, trong khoảng', yeuCau: '8 ÷ 14' },
  { category: '', stt: 19, noiDung: 'Hành trình tự do bàn đạp ly hợp, mm, trong khoảng', yeuCau: '28 ÷ 35' },
  { category: '', stt: 20, noiDung: 'Hành trình toàn bộ bàn đạp phanh, mm, trong khoảng', yeuCau: '145 ÷ 155' },
  { category: '', stt: 21, noiDung: 'Hành trình toàn bộ bàn đạp ly hợp, mm, trong khoảng', yeuCau: '140 ÷ 185' },
  { category: '', stt: 22, noiDung: 'Hành trình bàn đạp ga, mm, trong khoảng', yeuCau: '80 ÷ 95' },
  { category: '', stt: 23, noiDung: 'Áp suất lốp trước, kPa (kgf/cm2)', yeuCau: '230 +20 (2,3+0,2)' },
  { category: '', stt: 24, noiDung: 'Áp suất lốp sau, kPa (kgf/cm2)', yeuCau: '250 +20 (2,5+0,2)' },
  { category: '', stt: 25, noiDung: 'Quãng đường phanh tại vận tốc xe 30 km/h, m, không lớn hơn (sau khi phanh quỹ đạo chuyển động của xe không được phép lệch quá 8° hoặc không lệch khỏi hành lang phanh rộng 3,50 m)', yeuCau: '6' },
  { category: '', stt: 26, noiDung: 'Độ nghiêng của dốc mà xe có khả năng dừng khi kéo hết cần phanh tay, % (độ), không nhỏ hơn', yeuCau: '24 ( 14 )' },
  { category: '', stt: 27, noiDung: 'Độ ồn ngoài của xe khi nổ máy tại chỗ (độ ồn ngoài cách miệng ống xả 0,5 m và lệch 45°), dB, không lớn hơn', yeuCau: '103' },
  { category: '', stt: 28, noiDung: 'Nồng độ CO, %thể tích, không lớn hơn', yeuCau: '6,0' },
  { category: '', stt: 29, noiDung: 'Nồng độ HC, ppm thể tích, không lớn hơn', yeuCau: '1 500' },
  { category: '', stt: 30, noiDung: 'Cường độ sáng của đèn pha, cd, không nhỏ hơn', yeuCau: '10 000' }
];"""
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

# Sửa kết luận
content = re.sub(
    r"value=\{formData\.ketLuan !== undefined \? formData\.ketLuan : \(formData\.conclusion \|\| '.*?'\)\}",
    r"value={formData.ketLuan !== undefined ? formData.ketLuan : (formData.conclusion || 'Trang bị kỹ thuật đã được thử nghiệm các nội dung theo đúng Quy trình công nghệ.')}",
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("1. Tạo thành công ThuNghiemTongTheForm.tsx")
