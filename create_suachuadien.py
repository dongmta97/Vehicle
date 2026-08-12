import re

file_path = 'src/components/SuaChuaChiTietCumDienForm.tsx'
with open('src/components/EngineComponentRepairForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Đổi tên component
content = content.replace('EngineComponentRepairForm', 'SuaChuaChiTietCumDienForm')

# Sửa lại Cụm Công Đoạn mặc định
content = re.sub(
    r"value=\{formData\.cumCongDoan !== undefined \? formData\.cumCongDoan : 'Sửa chữa chi tiết, linh kiện của cụm động cơ'\}",
    r"value={formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Sửa chữa chi tiết, linh kiện hệ thống điện'}",
    content
)

# Thay SoPhieu mặc định
content = re.sub(
    r"value=\{formData\.soPhieu !== undefined \? formData\.soPhieu : ''\}",
    r"value={formData.soPhieu !== undefined ? formData.soPhieu : '3'}",
    content
)

# Thay SoTo mặc định
content = re.sub(
    r"value=\{formData\.soTo !== undefined \? formData\.soTo : '9'\}",
    r"value={formData.soTo !== undefined ? formData.soTo : '4'}",
    content
)

# Chèn mảng ITEMS mới
new_items = """const ITEMS: any[] = [
  { category: 'I. MÁY PHÁT', stt: 1, noiDung: 'Vệ sinh máy phát', yeuCau: 'Tẩy rửa sạch sẽ, sấy khô.' },
  { category: 'I. MÁY PHÁT', stt: 2, noiDung: 'Các nắp, các lỗ ren', yeuCau: 'Không nứt, vỡ. Không chờn, cháy quá 1,5 vòng' },
  { category: 'I. MÁY PHÁT', stt: 3, noiDung: 'Cổ góp', yeuCau: 'Không có vết mòn sâu thành rãnh.' },
  { category: 'I. MÁY PHÁT', stt: 4, noiDung: 'Khi hoạt động không kêu bi, chạm lõi, không phát ra tia lửa xanh ở cổ góp. Điện áp định mức', yeuCau: '12V' },
  { category: 'I. MÁY PHÁT', stt: 5, noiDung: 'Nhiệt độ các phụ kiện không lớn hơn', yeuCau: '70°C' },

  { category: 'II. MÁY KHỞI ĐỘNG', stt: 1, noiDung: 'Vệ sinh máy khởi động', yeuCau: 'Tẩy rửa sạch sẽ, sấy khô.' },
  { category: 'II. MÁY KHỞI ĐỘNG', stt: 2, noiDung: 'Độ mòn trục rôto tại vị trí lắp ghép với bạc', yeuCau: '≤ 0,04mm' },
  { category: 'II. MÁY KHỞI ĐỘNG', stt: 3, noiDung: 'Độ đảo trục rôto', yeuCau: '≤ 0,15' },
  { category: 'II. MÁY KHỞI ĐỘNG', stt: 4, noiDung: 'Bánh răng khới động', yeuCau: 'Không bị sứt mẻ, mòn nhiều.' },
  { category: 'II. MÁY KHỞI ĐỘNG', stt: 5, noiDung: 'Rơ le', yeuCau: 'Làm việc dễ dàng, không bị kẹt, rờ le phải tiếp xúc tốt, hút nhả dứt khoát. Sau khi khởi động bánh răng phải về vị trí ban đầu hoàn toàn.' },

  { category: 'III. HỆ THỐNG ĐÁNH LỬA', stt: 1, noiDung: 'Bộ chia điện', yeuCau: 'Đồng bộ với biến áp đánh lửa' },
  { category: 'III. HỆ THỐNG ĐÁNH LỬA', stt: 2, noiDung: 'Trục chia điện: Độ rơ', yeuCau: '≤ 0,1' },
  { category: 'III. HỆ THỐNG ĐÁNH LỬA', stt: 3, noiDung: 'Nắp bộ chia điện', yeuCau: 'Không nứt vỡ, cháy, rò điện. Móc giữ nắp bộ chia điện phải chắc chắn, phải có đủ chụp cao su của dây cao áp.' },
  { category: 'III. HỆ THỐNG ĐÁNH LỬA', stt: 4, noiDung: 'Con quay', yeuCau: 'Ôm chạy đầu trục và định vị tại vị trí cố định bằng phanh hãm.' },
  { category: 'III. HỆ THỐNG ĐÁNH LỬA', stt: 5, noiDung: 'Cam chia điện', yeuCau: 'Không có vết mòn thành gờ.' },
  { category: 'III. HỆ THỐNG ĐÁNH LỬA', stt: 6, noiDung: 'Các tiếp điểm', yeuCau: 'Không bị cháy rổ, phải được đánh sạch.' },
  { category: 'III. HỆ THỐNG ĐÁNH LỬA', stt: 7, noiDung: 'Khi làm việc tia lửa cao áp phải xanh, mập khoảng cách', yeuCau: '5 ÷ 10mm' },

  { category: 'IV. BÓ DÂY ĐIỆN', stt: '-', noiDung: 'Các mối nối, chất lượng bó dây chắc chắn, không chạm chập', yeuCau: '' },

  { category: 'V. HỆ THỐNG ĐÈN, TÍN HIỆU, GẠT MƯA, BƠM NƯỚC RỬA KÍNH, ĐIỀU HOÀ…', stt: 1, noiDung: 'Đèn pha', yeuCau: 'Sáng rõ' },
  { category: 'V. HỆ THỐNG ĐÈN, TÍN HIỆU, GẠT MƯA, BƠM NƯỚC RỬA KÍNH, ĐIỀU HOÀ…', stt: 2, noiDung: 'Đèn xi nhan', yeuCau: 'Sáng rõ' },
  { category: 'V. HỆ THỐNG ĐÈN, TÍN HIỆU, GẠT MƯA, BƠM NƯỚC RỬA KÍNH, ĐIỀU HOÀ…', stt: 3, noiDung: 'Đèn lùi', yeuCau: 'Sáng rõ' },
  { category: 'V. HỆ THỐNG ĐÈN, TÍN HIỆU, GẠT MƯA, BƠM NƯỚC RỬA KÍNH, ĐIỀU HOÀ…', stt: 4, noiDung: 'Đèn phanh', yeuCau: 'Sáng rõ' },
  { category: 'V. HỆ THỐNG ĐÈN, TÍN HIỆU, GẠT MƯA, BƠM NƯỚC RỬA KÍNH, ĐIỀU HOÀ…', stt: 5, noiDung: 'Đèn trần', yeuCau: 'Sáng rõ' },
  { category: 'V. HỆ THỐNG ĐÈN, TÍN HIỆU, GẠT MƯA, BƠM NƯỚC RỬA KÍNH, ĐIỀU HOÀ…', stt: 6, noiDung: 'Các đèn khác', yeuCau: 'Sáng rõ' },
  { category: 'V. HỆ THỐNG ĐÈN, TÍN HIỆU, GẠT MƯA, BƠM NƯỚC RỬA KÍNH, ĐIỀU HOÀ…', stt: 7, noiDung: 'Gạt mưa', yeuCau: 'HĐ Tốt' },
  { category: 'V. HỆ THỐNG ĐÈN, TÍN HIỆU, GẠT MƯA, BƠM NƯỚC RỬA KÍNH, ĐIỀU HOÀ…', stt: 8, noiDung: 'Bơm nước rửa kính', yeuCau: 'HĐ Tốt' }
];"""
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

# Sửa kết luận
content = re.sub(
    r"value=\{formData\.ketLuan !== undefined \? formData\.ketLuan : \(formData\.conclusion \|\| ''\)\}",
    r"value={formData.ketLuan !== undefined ? formData.ketLuan : (formData.conclusion || 'Các chi tiết, linh kiện cụm, khối được sửa chữa đúng Quy trình công nghệ.')}",
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
print("1. Tạo thành công SuaChuaChiTietCumDienForm.tsx")
