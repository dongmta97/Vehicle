import re

file_path = 'src/components/SuaChuaChiTietCumGamForm.tsx'
with open('src/components/EngineComponentRepairForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Đổi tên component
content = content.replace('EngineComponentRepairForm', 'SuaChuaChiTietCumGamForm')

# Sửa lại Cụm Công Đoạn mặc định
content = re.sub(
    r"value=\{formData\.cumCongDoan !== undefined \? formData\.cumCongDoan : 'Sửa chữa chi tiết, linh kiện của cụm động cơ'\}",
    r"value={formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Sửa chữa chi tiết, linh kiện của cụm gầm'}",
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
    r"value={formData.soTo !== undefined ? formData.soTo : '8'}",
    content
)

# Chèn mảng ITEMS mới
new_items = """const ITEMS: any[] = [
  { category: 'I. HỆ THỐNG PHANH', stt: 1, noiDung: 'Tăng bua phanh chân.', yeuCau: '' },
  { category: 'I. HỆ THỐNG PHANH', stt: '-', noiDung: 'Kích thước bề mặt làm việc', yeuCau: '< 283,3' },
  { category: 'I. HỆ THỐNG PHANH', stt: 2, noiDung: 'Tăng bua phanh tay.', yeuCau: '' },
  { category: 'I. HỆ THỐNG PHANH', stt: '-', noiDung: 'Kích thước bề mặt làm việc', yeuCau: '< 201,3' },
  { category: 'I. HỆ THỐNG PHANH', stt: 3, noiDung: 'Má phanh tán trên guốc phanh.', yeuCau: '' },
  { category: 'I. HỆ THỐNG PHANH', stt: '-', noiDung: 'Áp sát vào guốc, gõ vào má phanh nghe tiếng kêu đanh. Đầu loe đinh tán phải bám chắc và gọn.', yeuCau: '' },
  { category: 'I. HỆ THỐNG PHANH', stt: '-', noiDung: 'Chiều sâu đầu đinh tán chìm khỏi mặt má phanh', yeuCau: '≥ 1,5mm' },
  { category: 'I. HỆ THỐNG PHANH', stt: 4, noiDung: 'Bơm cái, bơm con.', yeuCau: '' },
  { category: 'I. HỆ THỐNG PHANH', stt: '-', noiDung: 'Cup – pen:Thay mới, đúng cỡ, chịu dầu phanh.', yeuCau: '' },
  { category: 'I. HỆ THỐNG PHANH', stt: '-', noiDung: 'Thử trên giá thử đảm bảo áp suất dầu, không bị rò rỉ dầu, pittông làm việc không bị kẹt.', yeuCau: '30 Kg/cm²' },

  { category: 'II. HỆ THỐNG LÁI', stt: 1, noiDung: 'Vỏ hộp tay lái', yeuCau: 'Không nứt, mẻ, chờn ren' },
  { category: 'II. HỆ THỐNG LÁI', stt: '-', noiDung: 'Các lỗ lắp vòng bi', yeuCau: 'Không rỗ, cháy, mòn bậc' },
  { category: 'II. HỆ THỐNG LÁI', stt: '-', noiDung: 'Độ dôi ép bạc lót vào vỏ hộp tay lái', yeuCau: '0,05 ÷ 0,09' },
  { category: 'II. HỆ THỐNG LÁI', stt: '-', noiDung: 'Khe hở bạc lót và cổ trục ngang', yeuCau: '0,025 ÷ 0,107' },
  { category: 'II. HỆ THỐNG LÁI', stt: 2, noiDung: 'Trục ngang', yeuCau: '' },
  { category: 'II. HỆ THỐNG LÁI', stt: '-', noiDung: 'Chốt con lăn lắp với : Lỗ ở chạc của trục ngang', yeuCau: 'Lắp ghép chặt' },
  { category: 'II. HỆ THỐNG LÁI', stt: '-', noiDung: 'Lỗ con lăn có khe hở: Con lăn phải xoay nhẹ nhàng trên trục', yeuCau: '' },
  { category: 'II. HỆ THỐNG LÁI', stt: '-', noiDung: 'ϕ trục ngang chỗ lắp trong bạc thau', yeuCau: 'Không bị mòn bậc, rỗ' },
  { category: 'II. HỆ THỐNG LÁI', stt: '-', noiDung: 'Bề dày đầu tiếp xúc với vít điều chỉnh', yeuCau: '5,90' },
  { category: 'II. HỆ THỐNG LÁI', stt: 3, noiDung: 'Trục vít và trục tay lái', yeuCau: '' },
  { category: 'II. HỆ THỐNG LÁI', stt: '-', noiDung: 'Then hoa lắp khớp nối tay lái: Không dập, mòn nhiều, mất răng.', yeuCau: '' },
  { category: 'II. HỆ THỐNG LÁI', stt: '-', noiDung: 'Độ đảo hướng kính chỗ tiếp xúc với vòng bi trên của HTL', yeuCau: '≤ 0,25' },
  { category: 'II. HỆ THỐNG LÁI', stt: 4, noiDung: 'Kiểm tra lắp ráp', yeuCau: '' },
  { category: 'II. HỆ THỐNG LÁI', stt: '-', noiDung: 'Độ dôi ổ lăn côn trục vít', yeuCau: 'Trục vít quay đều, nhẹ và không có độ rơ' },
  { category: 'II. HỆ THỐNG LÁI', stt: '-', noiDung: 'Khe hở ăn khớp trục vít với con lăn', yeuCau: 'Ở vị trí cạnh: < 30° góc quay vành tay lái' },
  { category: 'II. HỆ THỐNG LÁI', stt: '-', noiDung: 'Góc quay đòn quay đứng (càng cua) về hai phía', yeuCau: '45°' },
  { category: 'II. HỆ THỐNG LÁI', stt: '-', noiDung: 'Độ kín khít', yeuCau: 'Không thấm, rò rỉ dầu' },

  { category: 'III. HỘP SỐ CHÍNH', stt: 1, noiDung: 'Vỏ hộp số chính', yeuCau: '' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Không bị nứt, mẻ. Các vị trí lỗ lắp vòng bi không bị mòn bậc, rỗ nhiều', yeuCau: 'Lắp vòng bi vào lỗ phải có độ dôi' },
  { category: 'III. HỘP SỐ CHÍNH', stt: 2, noiDung: 'Trục sơ cấp', yeuCau: '' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Răng then hoa đĩa ly hợp', yeuCau: 'Không bị mòn bậc, mẻ, dập' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Mặt côn tiếp xúc với vòng đồng tốc. Khe hở mặt đầu vòng đồng tốc với mặt đầu vòng răng', yeuCau: 'Nhẵn bóng, không rỗ bề mặt' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Chỗ lắp vào lỗ vòng bi bánh đà', yeuCau: 'Không mòn bậc, rỗ' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Chỗ lắp 14 viên bi đũa', yeuCau: 'Không mòn bậc, rỗ' },
  { category: 'III. HỘP SỐ CHÍNH', stt: 3, noiDung: 'Trục trung gian', yeuCau: '' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Chỗ lắp vòng bi trước, sau', yeuCau: 'Không mòn bậc, rỗ bề mặt' },
  { category: 'III. HỘP SỐ CHÍNH', stt: 4, noiDung: 'Bánh răng số lùi', yeuCau: '' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Bề rộng rãnh lắp đầu càng sang số', yeuCau: '5,5 ÷ 5,8' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Trục lắp bánh răng số lùi', yeuCau: 'Không mòn bậc, rỗ bề mặt' },
  { category: 'III. HỘP SỐ CHÍNH', stt: 5, noiDung: 'Trục thứ cấp và các bánh răng', yeuCau: '' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Đầu trục lỗ chỗ lắp bi đũa', yeuCau: 'Không mòn bậc, rỗ bề mặt' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Đoạn lắp bánh răng số 2,3', yeuCau: 'Không mòn bậc, rỗ bề mặt' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Khe hở lắp với bánh răng số 2,3', yeuCau: '0,02 ÷ 0,05' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Khớp trượt cài số 3,4: Độ rơ hướng kính trên may ơ.', yeuCau: 'Không quá 0,35' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Bề rộng rãnh lắp đầu càng sang số', yeuCau: '9,5 ÷ 9,6' },
  { category: 'III. HỘP SỐ CHÍNH', stt: 6, noiDung: 'Càng sang số', yeuCau: '' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Bề dày đầu lắp với rãnh bánh răng của: càng số lùi, càng số 1, 2, 3, 4.', yeuCau: '4,8 ÷ 5' },
  { category: 'III. HỘP SỐ CHÍNH', stt: 7, noiDung: 'Cơ cấu sang số:', yeuCau: '' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Đoạn trượt trong lỗ ở nắp hộp số', yeuCau: 'Không mòn bậc, rỗ bề mặt' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Góc vát trên trục gài số', yeuCau: 'Không mòn bậc, rỗ bề mặt' },
  { category: 'III. HỘP SỐ CHÍNH', stt: 8, noiDung: 'Kiểm tra sau khi lắp hoàn chỉnh:', yeuCau: '' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Ra vào các tay số không kẹt, ở các tay số dùng tay quay trục thứ cấp nhẹ nhàng, không bị kẹt.', yeuCau: '' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Độ rơ dọc trục của trục thứ cấp và sơ cấp.', yeuCau: '' },
  { category: 'III. HỘP SỐ CHÍNH', stt: 9, noiDung: 'Kiểm tra trên giá thử:', yeuCau: '' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Ra vào các tay số: Nhẹ nhàng, không tự trả về không.', yeuCau: '' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Tiếng kêu: Không có tiếng kêu, gõ', yeuCau: '' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Nhiệt độ nhớt', yeuCau: '≤ 70°C' },
  { category: 'III. HỘP SỐ CHÍNH', stt: '-', noiDung: 'Rò rỉ dầu ở các mặt ghép', yeuCau: 'Không cho phép' },

  { category: 'IV. HỘP SỐ PHỤ', stt: 1, noiDung: 'Lỗ lắp vòng bi hộp số', yeuCau: 'Không bị nứt, mẻ. Các vị trí lỗ lắp vòng bi không bị mòn bậc, rỗ nhiều' },
  { category: 'IV. HỘP SỐ PHỤ', stt: '-', noiDung: 'Lắp vòng bi vào lỗ phải có độ dôi', yeuCau: '' },
  { category: 'IV. HỘP SỐ PHỤ', stt: 2, noiDung: 'Bánh răng gài cầu sau', yeuCau: '' },
  { category: 'IV. HỘP SỐ PHỤ', stt: '-', noiDung: 'Rãnh lắp đầu càng sang số', yeuCau: '7,5 ÷ 7,6' },
  { category: 'IV. HỘP SỐ PHỤ', stt: 3, noiDung: 'Mặt bích lắp trục các đăng trước và sau', yeuCau: '' },
  { category: 'IV. HỘP SỐ PHỤ', stt: '-', noiDung: 'Đường kính lỗ lắp chốt', yeuCau: '≤ 41,5' },
  { category: 'IV. HỘP SỐ PHỤ', stt: 4, noiDung: 'Càng gài cầu', yeuCau: '' },
  { category: 'IV. HỘP SỐ PHỤ', stt: '-', noiDung: 'Bề dày đầu càng, chỗ ăn khớp vóc rãnh ở bánh răng', yeuCau: '7,2 ÷ 7,4' },

  { category: 'V. CẦU TRƯỚC', stt: 1, noiDung: 'Vỏ cầu', yeuCau: '' },
  { category: 'V. CẦU TRƯỚC', stt: '-', noiDung: 'Các lỗ lắp vòng bi :', yeuCau: 'Không bị mòn bậc, rỗ bề mặt' },
  { category: 'V. CẦU TRƯỚC', stt: '-', noiDung: 'Độ cong của nữa vỏ cầu ( đo độ đảo mặt đầu của mặt ghép 2 nữa vỏ cầu, lấy chuẩn là tâm ngang đi qua các lỗ lắp vòng bi )', yeuCau: '< 0,3mm' },
  { category: 'V. CẦU TRƯỚC', stt: 2, noiDung: 'Gối cầu quay', yeuCau: '' },
  { category: 'V. CẦU TRƯỚC', stt: '-', noiDung: 'Khoảng cách hai bề mặt tựa của bạc chốt đứng', yeuCau: '147,8 ÷ 148,0' },
  { category: 'V. CẦU TRƯỚC', stt: '-', noiDung: 'Ác trụ đứng', yeuCau: 'Không bị mòn bậc, rỗ bề mặt' },
  { category: 'V. CẦU TRƯỚC', stt: '-', noiDung: 'Độ rơ của cụm moayơ (lắc theo chiều dọc trục 2 chốt đứng)', yeuCau: 'Không cho phép có độ rơ' },
  { category: 'V. CẦU TRƯỚC', stt: 3, noiDung: 'Cặp bánh răng vành chậu, quả dứa', yeuCau: '' },
  { category: 'V. CẦU TRƯỚC', stt: '-', noiDung: 'Vết tiếp xúc mặt bên của hai răng quả dứa và vành chậu ăn khớp nhau: Phải nằm trong mặt bên của răng;', yeuCau: 'Diện tích không dưới 70% bề mặt răng' },
  { category: 'V. CẦU TRƯỚC', stt: '-', noiDung: 'Khe hở cạnh bên của hai răng ăn khớp', yeuCau: '0,20 ÷ 0,60' },
  { category: 'V. CẦU TRƯỚC', stt: '-', noiDung: 'Momen siết bu lông ghép 2 nửa vỏ cầu (kgl.m)', yeuCau: '16 ÷ 20' },
  { category: 'V. CẦU TRƯỚC', stt: 4, noiDung: 'Bộ vi sai', yeuCau: '' },
  { category: 'V. CẦU TRƯỚC', stt: '-', noiDung: 'Trục', yeuCau: 'Không bị mòn bậc, rỗ bề mặt' },
  { category: 'V. CẦU TRƯỚC', stt: '-', noiDung: 'Khe hở lắp bánh răng trên trục', yeuCau: '0,10 ÷ 0,15' },

  { category: 'VI. CẦU SAU', stt: 1, noiDung: 'Vỏ cầu', yeuCau: '' },
  { category: 'VI. CẦU SAU', stt: '-', noiDung: 'Các lỗ lắp vòng bi :', yeuCau: 'Không bị mòn bậc, rỗ bề mặt' },
  { category: 'VI. CẦU SAU', stt: '-', noiDung: 'Độ cong của nữa vỏ cầu ( đo độ đảo mặt đầu của mặt ghép 2 nữa vỏ cầu, lấy chuẩn là tâm ngang đi qua các lỗ lắp vòng bi ).', yeuCau: '< 0,3mm' },
  { category: 'VI. CẦU SAU', stt: 2, noiDung: 'Cặp bánh răng vành chậu, quả dứa', yeuCau: '' },
  { category: 'VI. CẦU SAU', stt: '-', noiDung: 'Vết tiếp xúc trên mặt bên của răng vành chậu khớp với răng quả dứa', yeuCau: '≥ 70% bề mặt răng' },
  { category: 'VI. CẦU SAU', stt: '-', noiDung: 'Khe hở ăn khớp của răng vành chậu và quả dứa', yeuCau: '0,2 ÷ 0,6' },
  { category: 'VI. CẦU SAU', stt: '-', noiDung: 'Momen siết bu lông ghép 2 nửa vỏ cầu (kgl.m)', yeuCau: '16 ÷ 20' },
  { category: 'VI. CẦU SAU', stt: 4, noiDung: 'Bánh răng hành tinh và trục trong bộ vi sai', yeuCau: '' },
  { category: 'VI. CẦU SAU', stt: '-', noiDung: 'Trục', yeuCau: 'Không bị mòn bậc, rỗ bề mặt' },
  { category: 'VI. CẦU SAU', stt: '-', noiDung: 'Khe hở lắp bánh răng trên trục', yeuCau: '0,10 ÷ 0,15' },

  { category: 'VII. CÁC ĐĂNG, TRỤC LÁP', stt: 1, noiDung: 'Trục các đăng', yeuCau: 'Không cong, xoắn (nhìn bằng mắt)' },
  { category: 'VII. CÁC ĐĂNG, TRỤC LÁP', stt: '-', noiDung: 'Mối ghép then hoa', yeuCau: 'Không quá rơ lỏng' },
  { category: 'VII. CÁC ĐĂNG, TRỤC LÁP', stt: '-', noiDung: 'Các chữ thập lắc', yeuCau: 'Không được có độ rơ.' },
  { category: 'VII. CÁC ĐĂNG, TRỤC LÁP', stt: '-', noiDung: 'Nắp che bụi phải vặn được nhẹ nhàng', yeuCau: 'Không móp méo.' },
  { category: 'VII. CÁC ĐĂNG, TRỤC LÁP', stt: 2, noiDung: 'Trục láp', yeuCau: 'Không cong (nhìn bằng mắt)' },
  { category: 'VII. CÁC ĐĂNG, TRỤC LÁP', stt: '-', noiDung: 'Phần răng then hoa', yeuCau: 'Không mòn, mẻ, dập răng.' },

  { category: 'VIII. HỆ THỐNG TREO', stt: 1, noiDung: 'Nhíp trước', yeuCau: '' },
  { category: 'VIII. HỆ THỐNG TREO', stt: '-', noiDung: 'Số lá nhíp của 1 bộ', yeuCau: '13' },
  { category: 'VIII. HỆ THỐNG TREO', stt: '-', noiDung: 'Chiều rộng lá nhíp', yeuCau: '55' },
  { category: 'VIII. HỆ THỐNG TREO', stt: '-', noiDung: 'Bề dày lá nhíp', yeuCau: '7' },
  { category: 'VIII. HỆ THỐNG TREO', stt: '-', noiDung: 'Chiều dài lá số 1', yeuCau: '1100' },
  { category: 'VIII. HỆ THỐNG TREO', stt: '-', noiDung: 'Độ võng của lá nhíp ở trạng thái tự do', yeuCau: '> 100' },
  { category: 'VIII. HỆ THỐNG TREO', stt: 2, noiDung: 'Nhíp sau', yeuCau: '' },
  { category: 'VIII. HỆ THỐNG TREO', stt: '-', noiDung: 'Số lá nhíp của 1 bộ', yeuCau: '13' },
  { category: 'VIII. HỆ THỐNG TREO', stt: '-', noiDung: 'Chiều rộng lá nhíp', yeuCau: '55' },
  { category: 'VIII. HỆ THỐNG TREO', stt: '-', noiDung: 'Bề dày lá nhíp', yeuCau: '6' },
  { category: 'VIII. HỆ THỐNG TREO', stt: '-', noiDung: 'Chiều dài lá số 1', yeuCau: '1240' },
  { category: 'VIII. HỆ THỐNG TREO', stt: '-', noiDung: 'Độ võng của lá nhíp ở trạng thái tự do', yeuCau: '> 138' },
  { category: 'VIII. HỆ THỐNG TREO', stt: 3, noiDung: 'Điều kiện chung của các bộ nhíp', yeuCau: '' },
  { category: 'VIII. HỆ THỐNG TREO', stt: '-', noiDung: 'Độ xê dịch theo chiều rộng của tròng lá nhíp so với lá chính', yeuCau: '< 2,5' },
  { category: 'VIII. HỆ THỐNG TREO', stt: 4, noiDung: 'Ống giảm xóc', yeuCau: '' },
  { category: 'VIII. HỆ THỐNG TREO', stt: '-', noiDung: 'Không chảy dầu, móp, đảm bảo hành trình công tác .', yeuCau: '200' },
];"""
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

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
print("1. Tạo thành công SuaChuaChiTietCumGamForm.tsx")
