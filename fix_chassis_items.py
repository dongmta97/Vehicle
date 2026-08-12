import re
import os

file_path = 'src/components/EngineInspectionBeforeRepairForm.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace CHASSIS_INSPECTION_ITEMS
new_chassis_items = """const CHASSIS_INSPECTION_ITEMS = [
  { id: 101, category: 'I. HỆ THỐNG LÁI', stt: 1, content: "Trục lái", unit: "", requirement: "Hoạt động linh hoạt, không có tiếng kêu, không rơ lỏng" },
  { id: 102, category: 'I. HỆ THỐNG LÁI', stt: 2, content: "Bơm trợ lực", unit: "", requirement: "Hoạt động linh hoạt, cánh bơm không kêu, không bị mòn" },
  { id: 103, category: 'I. HỆ THỐNG LÁI', stt: 3, content: "Rô tuyn lái", unit: "", requirement: "Không mòn, không rơ lỏng, không rách che bụi" },
  { id: 104, category: 'I. HỆ THỐNG LÁI', stt: 4, content: "Bạc + bi + gioăng phớt thước lái", unit: "", requirement: "Không mòn, rơ lỏng, không chảy dầu" },
  { id: 105, category: 'I. HỆ THỐNG LÁI', stt: 5, content: "Tuy ô trợ lực lái", unit: "", requirement: "Không móp méo, rò rỉ" },
  { id: 106, category: 'I. HỆ THỐNG LÁI', stt: 6, content: "Độ rơ vành tay lái, Độ", unit: "", requirement: "≤ 10" },

  { id: 201, category: 'II. HỆ THỐNG PHANH', stt: 1, content: "Piston phanh trước", unit: "", requirement: "Không bị mòn, rỗ" },
  { id: 202, category: 'II. HỆ THỐNG PHANH', stt: 2, content: "Xi lanh phanh trước", unit: "", requirement: "Không bị mòn, rỗ" },
  { id: 203, category: 'II. HỆ THỐNG PHANH', stt: 3, content: "Tang phanh", unit: "", requirement: "Không bị mòn gờ sâu" },
  { id: 204, category: 'II. HỆ THỐNG PHANH', stt: 4, content: "Má phanh trước, mm", unit: "", requirement: "Không bị nứt. Chiều dày ≥ 1,0 mm" },
  { id: 205, category: 'II. HỆ THỐNG PHANH', stt: 5, content: "Piston phanh sau", unit: "", requirement: "Không bị mòn, rỗ" },
  { id: 206, category: 'II. HỆ THỐNG PHANH', stt: 6, content: "Xi lanh phanh sau", unit: "", requirement: "Không bị mòn, rỗ" },
  { id: 207, category: 'II. HỆ THỐNG PHANH', stt: 7, content: "Bầu trợ lực phanh", unit: "", requirement: "Đàn hồi tốt, không nứt, han rỉ" },
  { id: 208, category: 'II. HỆ THỐNG PHANH', stt: 8, content: "Má phanh sau, mm", unit: "", requirement: "Không bị nứt. Chiều dày ≥ 1,0 mm" },
  { id: 209, category: 'II. HỆ THỐNG PHANH', stt: 9, content: "Tổng phanh", unit: "", requirement: "Không mòn rỗ, nứt vỡ" },
  { id: 210, category: 'II. HỆ THỐNG PHANH', stt: 10, content: "Phanh tay, Tách", unit: "", requirement: "Không mòn, nứt vỡ, 2-4 tách" },
  { id: 211, category: 'II. HỆ THỐNG PHANH', stt: 11, content: "Ống dẻo phanh", unit: "", requirement: "Không nứt, rò rỉ dầu" },

  { id: 301, category: 'III. HỆ THỐNG TREO', stt: 1, content: "Giảm sóc trước", unit: "", requirement: "Không chảy dầu, làm việc êm dịu" },
  { id: 302, category: 'III. HỆ THỐNG TREO', stt: 2, content: "Giảm sóc sau", unit: "", requirement: "Không chảy dầu, làm việc êm dịu" },
  { id: 303, category: 'III. HỆ THỐNG TREO', stt: 3, content: "Bộ nhíp xe", unit: "", requirement: "Đàn hồi tốt, không mòn, nứt, gãy" },
  { id: 304, category: 'III. HỆ THỐNG TREO', stt: 4, content: "Cao su nhíp", unit: "", requirement: "Không nứt, mòn, lão hóa" },
  { id: 305, category: 'III. HỆ THỐNG TREO', stt: 5, content: "Bộ quang nhíp, ốc", unit: "", requirement: "Không mòn, rỗ, không nứt, cháy ren" },
  { id: 306, category: 'III. HỆ THỐNG TREO', stt: 6, content: "Cụm quả táo chuyển hướng", unit: "", requirement: "Không mòn, nứt, hoạt động linh hoạt" },
  { id: 307, category: 'III. HỆ THỐNG TREO', stt: 7, content: "Vỏ khớp quả bưởi (trái, phải)", unit: "", requirement: "Không mòn, nứt, rỗ" },
  { id: 308, category: 'III. HỆ THỐNG TREO', stt: 8, content: "Lốp xe", unit: "", requirement: "Không mòn, nứt" },

  { id: 401, category: 'IV. HỘP SỐ', stt: 1, content: "Phớt đuôi hộp số", unit: "", requirement: "Không nứt, rách, không chảy dầu" },
  { id: 402, category: 'IV. HỘP SỐ', stt: 2, content: "Vòng bi số", unit: "", requirement: "Không mòn, rỗ, hoạt động êm dịu" },
  { id: 403, category: 'IV. HỘP SỐ', stt: 3, content: "Cao su chân hộp số", unit: "", requirement: "Không nứt, rách, không mòn, lão hóa" },
  { id: 404, category: 'IV. HỘP SỐ', stt: 4, content: "Trục hộp số", unit: "", requirement: "Không cong vênh, không mòn, rỗ" },
  { id: 405, category: 'IV. HỘP SỐ', stt: 5, content: "Bánh răng", unit: "", requirement: "Không mòn, sứt mẻ, rỗ" },
  { id: 406, category: 'IV. HỘP SỐ', stt: 6, content: "Vỏ hộp số", unit: "", requirement: "Không nứt, rách, không chảy dầu" },

  { id: 501, category: 'V. LY HỢP', stt: 1, content: "Bàn đạp ly hợp", unit: "", requirement: "Linh hoạt, không bị rơ trục." },
  { id: 502, category: 'V. LY HỢP', stt: 2, content: "Tổng côn", unit: "", requirement: "Hoạt động linh hoạt, không chảy dầu" },
  { id: 503, category: 'V. LY HỢP', stt: 3, content: "Bơm con ly hợp", unit: "", requirement: "Hoạt động linh hoạt, không chảy dầu" },
  { id: 504, category: 'V. LY HỢP', stt: 4, content: "Đĩa ép", unit: "", requirement: "Không bị mòn cháy, biến dạng, cong vênh" },
  { id: 505, category: 'V. LY HỢP', stt: 5, content: "Đĩa ma sát", unit: "", requirement: "Không bị cháy, mòn chưa đến đinh tán, cốt đĩa chắc chắn" },
  { id: 506, category: 'V. LY HỢP', stt: 6, content: "Bi tê", unit: "", requirement: "Hoạt động linh hoạt không có tiếng kêu trong quá trình làm việc" },
  { id: 507, category: 'V. LY HỢP', stt: 7, content: "Bánh đà", unit: "", requirement: "Không bị mòn cháy, cong vênh, vành răng khởi động chắc chắn, không sứt mẻ, độ đảo mặt bánh đà ≤ 0,1mm" },
  { id: 508, category: 'V. LY HỢP', stt: 8, content: "Càng cua", unit: "", requirement: "Không bị cong vênh" },
  { id: 509, category: 'V. LY HỢP', stt: 9, content: "Hành trình tự do bàn đạp ly hợp, mm", unit: "", requirement: "Từ 8-14" },

  { id: 601, category: 'VI. CÁC ĐĂNG', stt: 1, content: "Ống trục các đăng", unit: "", requirement: "Không móp méo, biến dạng, độ đảo trục các đăng" },
  { id: 602, category: 'VI. CÁC ĐĂNG', stt: 2, content: "Mặt bích các đăng", unit: "", requirement: "Không móp méo, biến dạng" },
  { id: 603, category: 'VI. CÁC ĐĂNG', stt: 3, content: "Ổ trục then hoa", unit: "", requirement: "Không rơ lỏng, hoạt động linh hoạt" },
  { id: 604, category: 'VI. CÁC ĐĂNG', stt: 4, content: "Bi chữ thập các đăng", unit: "", requirement: "Không rơ lỏng, hoạt động linh hoạt" }
];"""

content = re.sub(r'const CHASSIS_INSPECTION_ITEMS = \[.*?\];', new_chassis_items, content, flags=re.DOTALL)

# Dynamic conclusion default
content = content.replace("conclusion: 'Cụm động cơ đã được kiểm tra đúng Quy trình công nghệ.'", "conclusion: templateType === 'CHASSIS_PRE_REPAIR' ? 'Phần gầm trước khi vào sửa chữa đã được kiểm tra đúng Quy trình công nghệ.' : 'Cụm động cơ đã được kiểm tra đúng Quy trình công nghệ.'")

# Dynamic h1
content = content.replace('<h1 className="text-xl font-bold uppercase m-0 leading-tight mb-2">PHIẾU KIỂM TRA: Số 1</h1>', '<h1 className="text-xl font-bold uppercase m-0 leading-tight mb-2">PHIẾU KIỂM TRA: Số {templateType === \'CHASSIS_PRE_REPAIR\' ? \'2\' : \'1\'}</h1>')

# Dynamic Tờ số
# In state initialization:
#      sheetNumber: '',
content = content.replace("sheetNumber: '',", "sheetNumber: templateType === 'CHASSIS_PRE_REPAIR' ? '04' : '01',", 1)
content = content.replace("sheetNumber: '',", "sheetNumber: templateType === 'CHASSIS_PRE_REPAIR' ? '04' : '01',")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ Updated Chassis Inspection Items")
