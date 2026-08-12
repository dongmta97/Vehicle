import re

file_path = 'src/components/TongThaoCumGamForm.tsx'
with open('src/components/EngineComponentRepairForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Đổi tên component
content = content.replace('EngineComponentRepairForm', 'TongThaoCumGamForm')

# Sửa lại Cụm Công Đoạn mặc định cho đúng với Gầm
content = re.sub(
    r"value=\{formData\.cumCongDoan !== undefined \? formData\.cumCongDoan : 'Sửa chữa chi tiết, linh kiện của cụm động cơ'\}",
    r"value={formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Tổng tháo cụm gầm'}",
    content
)

# Chèn mảng ITEMS mới (Trích xuất từ PDF 3.1)
new_items = """const ITEMS: any[] = [
  { category: 'I. CẦU XE', stt: 1, noiDung: 'Moay ơ cầu trước', yeuCau: 'Không bị cháy rổ, không có tiếng kêu' },
  { category: 'I. CẦU XE', stt: 2, noiDung: 'Moay ơ cầu sau', yeuCau: 'Không bị cháy rô, không có tiếng kêu' },
  { category: 'I. CẦU XE', stt: 3, noiDung: 'Phớt moay ơ cầu trước', yeuCau: 'Không bị rách, không chảy dầu' },
  { category: 'I. CẦU XE', stt: 4, noiDung: 'Phớt moay ơ cầu sau', yeuCau: 'Không bị rách, không chảy dầu' },
  { category: 'I. CẦU XE', stt: 5, noiDung: 'Bánh răng vành chậu, quả dứa', yeuCau: 'Không sứt, mẻ, làm việc êm dịu' },
  { category: 'I. CẦU XE', stt: 6, noiDung: 'Trục bánh răng vành chậu, quả dứa', yeuCau: 'Không cong, vênh, không mòn, rỗ' },
  { category: 'I. CẦU XE', stt: 7, noiDung: 'Bán trục cầu trước, sau', yeuCau: 'Không cong, vênh, không mòn, rỗ' },

  { category: 'II. TRỤC CÁC ĐĂNG', stt: 1, noiDung: 'Ống trục các đăng', yeuCau: 'Không móp méo, biến dạng, độ đảo trục các đăng' },
  { category: 'II. TRỤC CÁC ĐĂNG', stt: 2, noiDung: 'Mặt bích các đăng', yeuCau: 'Không móp méo, biến dạng' },
  { category: 'II. TRỤC CÁC ĐĂNG', stt: 3, noiDung: 'Ổ trục then hoa', yeuCau: 'Không lỏng, hoạt động linh hoạt' },
  { category: 'II. TRỤC CÁC ĐĂNG', stt: 4, noiDung: 'Bi chữ thập các đăng', yeuCau: 'Không lỏng, hoạt động linh hoạt' },

  { category: 'III. HỆ THỐNG TREO', stt: 1, noiDung: 'Giảm sóc trước', yeuCau: 'Không chảy dầu, làm việc êm dịu' },
  { category: 'III. HỆ THỐNG TREO', stt: 2, noiDung: 'Giảm sóc sau', yeuCau: 'Không chảy dầu, làm việc êm dịu' },
  { category: 'III. HỆ THỐNG TREO', stt: 3, noiDung: 'Bộ nhíp xe', yeuCau: 'Đàn hồi tốt, không mòn, nứt, gãy' },
  { category: 'III. HỆ THỐNG TREO', stt: 4, noiDung: 'Cao su nhíp', yeuCau: 'Không nứt, mòn, lão hóa' },
  { category: 'III. HỆ THỐNG TREO', stt: 5, noiDung: 'Bộ quang nhíp, ốc', yeuCau: 'Không mòn, rỗ, không nứt, cháy ren' },
  { category: 'III. HỆ THỐNG TREO', stt: 6, noiDung: 'Cụm quả táo chuyển hướng', yeuCau: 'Không mòn, nứt, hoạt động linh hoạt' },
  { category: 'III. HỆ THỐNG TREO', stt: 7, noiDung: 'Vỏ khớp quả bưởi (trái, phải)', yeuCau: 'Không mòn, nứt, rỗ' },
  { category: 'III. HỆ THỐNG TREO', stt: 8, noiDung: 'Lốp xe', yeuCau: 'Không mòn, nứt' },

  { category: 'IV. HỆ THỐNG PHANH', stt: 1, noiDung: 'Piston phanh trước', yeuCau: 'Không bị mòn, rỗ' },
  { category: 'IV. HỆ THỐNG PHANH', stt: 2, noiDung: 'Xi lanh phanh trước', yeuCau: 'Không bị mòn, rỗ' },
  { category: 'IV. HỆ THỐNG PHANH', stt: 3, noiDung: 'Tang phanh', yeuCau: 'Không bị mòn gờ sâu' },
  { category: 'IV. HỆ THỐNG PHANH', stt: 4, noiDung: 'Má phanh trước', yeuCau: 'Không bị nứt. Chiều dày >= 1,0 mm' },
  { category: 'IV. HỆ THỐNG PHANH', stt: 5, noiDung: 'Piston phanh sau', yeuCau: 'Không bị mòn, rỗ' },
  { category: 'IV. HỆ THỐNG PHANH', stt: 6, noiDung: 'Xi lanh phanh sau', yeuCau: 'Không bị mòn, rỗ' },
  { category: 'IV. HỆ THỐNG PHANH', stt: 7, noiDung: 'Bầu trợ lực phanh', yeuCau: 'Đàn hồi tốt, không nứt, han rỉ' },
  { category: 'IV. HỆ THỐNG PHANH', stt: 8, noiDung: 'Má phanh sau', yeuCau: 'Không bị nứt. Chiều dày >= 1,0 mm' },
  { category: 'IV. HỆ THỐNG PHANH', stt: 9, noiDung: 'Tổng phanh', yeuCau: 'Không mòn rỗ, nứt vỡ' },
  { category: 'IV. HỆ THỐNG PHANH', stt: 10, noiDung: 'Phanh tay', yeuCau: 'Không mòn, nứt vỡ, 2-4 tách' },
  { category: 'IV. HỆ THỐNG PHANH', stt: 11, noiDung: 'Ống dẻo phanh', yeuCau: 'Không nứt, rò rỉ dầu' },

  { category: 'V. LY HỢP', stt: 1, noiDung: 'Bàn đạp ly hợp', yeuCau: 'Linh hoạt, không bị rơ trục' },
  { category: 'V. LY HỢP', stt: 2, noiDung: 'Tổng côn', yeuCau: 'Hoạt động linh hoạt, không chảy dầu' },
  { category: 'V. LY HỢP', stt: 3, noiDung: 'Bơm con ly hợp', yeuCau: 'Hoạt động linh hoạt, không chảy dầu' },
  { category: 'V. LY HỢP', stt: 4, noiDung: 'Đĩa ép', yeuCau: 'Không bị mòn cháy, biến dạng, cong vênh' },
  { category: 'V. LY HỢP', stt: 5, noiDung: 'Đĩa ma sát', yeuCau: 'Không bị cháy, mòn chưa đến đinh tán, cốt đĩa chắc chắn' },
  { category: 'V. LY HỢP', stt: 6, noiDung: 'Bi tê', yeuCau: 'Hoạt động linh hoạt không có tiếng kêu trong quá trình làm việc' },
  { category: 'V. LY HỢP', stt: 7, noiDung: 'Bánh đà', yeuCau: 'Không bị mòn cháy, cong vênh, vành răng khởi động chắc chắn, không sứt mẻ, độ đảo mặt bánh đà <= 0,1mm' },
  { category: 'V. LY HỢP', stt: 8, noiDung: 'Càng cua', yeuCau: 'Không cong vênh' },

  { category: 'VI. HỘP SỐ', stt: 1, noiDung: 'Phớt đuôi hộp số', yeuCau: 'Không nứt, rách, không chảy dầu' },
  { category: 'VI. HỘP SỐ', stt: 2, noiDung: 'Vòng bi số', yeuCau: 'Không mòn, rỗ, hoạt động êm dịu' },
  { category: 'VI. HỘP SỐ', stt: 3, noiDung: 'Cao su chân hộp số', yeuCau: 'Không nứt, rách, không mòn, lão hóa' },
  { category: 'VI. HỘP SỐ', stt: 4, noiDung: 'Trục hộp số', yeuCau: 'Không cong vênh, không mòn, rỗ' },
  { category: 'VI. HỘP SỐ', stt: 5, noiDung: 'Bánh răng', yeuCau: 'Không mòn, sứt mẻ, rỗ' },
  { category: 'VI. HỘP SỐ', stt: 6, noiDung: 'Vỏ hộp số', yeuCau: 'Không nứt, vỡ, chảy dầu' },

  { category: 'VII. HỆ THỐNG LÁI', stt: 1, noiDung: 'Trục lái', yeuCau: 'Hoạt động linh hoạt, không có tiếng kêu, không rơ lỏng' },
  { category: 'VII. HỆ THỐNG LÁI', stt: 2, noiDung: 'Bơm trợ lực', yeuCau: 'Hoạt động linh hoạt, cánh bơm không kêu, không bị mòn' },
  { category: 'VII. HỆ THỐNG LÁI', stt: 3, noiDung: 'Rô tuyn lái', yeuCau: 'Không mòn, không rơ lỏng, không rách che bụi' },
  { category: 'VII. HỆ THỐNG LÁI', stt: 4, noiDung: 'Bạc + bi + gioăng phớt thước lái', yeuCau: 'Không mòn, rơ lỏng, không chảy dầu' },
  { category: 'VII. HỆ THỐNG LÁI', stt: 5, noiDung: 'Tuy ô trợ lực lái', yeuCau: 'Không móp méo, rò rỉ' },
  { category: 'VII. HỆ THỐNG LÁI', stt: 6, noiDung: 'Độ rơ vành tay lái, mm', yeuCau: '<= 10' }
];"""
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("1. Tạo thành công TongThaoCumGamForm.tsx")
