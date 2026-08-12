import re

file_path = 'src/components/LapRapDongCoForm.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace component name
content = content.replace('EngineComponentRepairForm', 'LapRapDongCoForm')

# Replace ITEMS
new_items = """const ITEMS: any[] = [
  { category: 'I. LẮP RÁP', stt: "1", noiDung: "Khe hở bánh răng cam cơ", yeuCau: "≤ 0,2" },
  { category: 'I. LẮP RÁP', stt: "2", noiDung: "Khe hở dọc trục cam", yeuCau: "0,1 ÷ 0,2" },
  { category: 'I. LẮP RÁP', stt: "3", noiDung: "Độ đảo mặt bánh đà bán kính 140 mm", yeuCau: "≤ 0,15" },
  { category: 'I. LẮP RÁP', stt: "4", noiDung: "Lực siết ổ trục khuỷu N.m (Kg.m), (lb.ft)", yeuCau: "122,5 ÷ 133,3 (12,5 ÷ 13,6) (91 ÷ 98,5)" },
  { category: 'I. LẮP RÁP', stt: "5", noiDung: "Lực siết bulong biên N.m (Kg.m), (lb.ft)", yeuCau: "66,6 ÷ 73,5 (6,8 ÷ 7,5) (49 ÷ 54,3)" },
  { category: 'I. LẮP RÁP', stt: "6", noiDung: "Lực siết đai ốc nắp máy N.m (Kg.m), (lb.ft)", yeuCau: "71,5 ÷ 76,4 (7,3 ÷ 7,8) (52,8 ÷ 56,4)" },
  { category: 'I. LẮP RÁP', stt: "7", noiDung: "Lực xiết bulông bánh đà N.m (Kg.m), (lb.ft)", yeuCau: "73,5 ÷ 78,4 (7,5 ÷ 8) (54,3 ÷ 57,9)" },
  { category: 'I. LẮP RÁP', stt: "8", noiDung: "Thử độ kín xylanh lắp vào động cơ với áp suất 4kgf/cm2", yeuCau: "Không rò nước xuống catte" },
  { category: 'II. CHẠY RÀ', stt: "1", noiDung: "Rà nguội không áp", yeuCau: "TCN" },
  { category: 'II. CHẠY RÀ', stt: "2", noiDung: "Chạy rà nóng không tải", yeuCau: "TCCS" },
  { category: 'II. CHẠY RÀ', stt: "3", noiDung: "Chạy rà nóng có tải", yeuCau: "TCCS" },
  { category: 'III. THỬ LỰC', stt: "1", noiDung: "Tốc độ vòng quay trục cơ:", yeuCau: "" },
  { category: 'III. THỬ LỰC', stt: "2", noiDung: "Số vòng quay không tải nhỏ nhất, r/min", yeuCau: "700 ÷ 750" },
  { category: 'III. THỬ LỰC', stt: "3", noiDung: "Số vòng quay lớn nhất, r/min", yeuCau: "4000" },
  { category: 'III. THỬ LỰC', stt: "4", noiDung: "Công suất khi n = 4000 r/min, kW (HP)", yeuCau: "47 (64)" },
  { category: 'III. THỬ LỰC', stt: "5", noiDung: "Chênh lệch áp suất buồng đốt cuối kỳ nén giữa các xy lanh, KPa (Kgf/cm2), không lớn hơn", yeuCau: "98,1 (1,0)" },
  { category: 'IV. HỆ BÔI TRƠN', stt: "1", noiDung: "Áp suất dầu KPa (Kgf/cm2)", yeuCau: "" },
  { category: 'IV. HỆ BÔI TRƠN', stt: "2", noiDung: "Áp suất dầu bôi trơn ở số vòng quay nhỏ nhất , KPa (Kgf/cm2), không nhỏ hơn", yeuCau: "49 (0,5)" },
  { category: 'IV. HỆ BÔI TRƠN', stt: "3", noiDung: "Áp suất dầu bôi trơn lớn nhất,KPa (Kgf/cm2), không lớn hơn", yeuCau: "392 (4,0)" },
  { category: 'IV. HỆ BÔI TRƠN', stt: "4", noiDung: "Không cho phép rò rỉ dầu, nước, tiếng kêu gõ bất thường.", yeuCau: "" }
];"""

# Replace the ITEMS block
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated LapRapDongCoForm.tsx")
