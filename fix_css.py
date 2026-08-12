import os

css_path = 'src/index.css'

css_block = """
/* --- BẮT ĐẦU: TỐI ƯU HÓA HIỂN THỊ TIẾNG VIỆT CHỐNG RỚT DẤU --- */
body, input, textarea, select, button {
  text-rendering: optimizeLegibility !important;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
}

/* Ép cứng font chuẩn văn bản cho toàn bộ cấu trúc in ấn */
@media print {
  body, *, .print\:block, .print\:flex, .print\:table {
    font-family: "Times New Roman", Times, serif !important;
    text-rendering: optimizeLegibility !important;
  }
}
/* --- KẾT THÚC --- */
"""

with open(css_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "TỐI ƯU HÓA HIỂN THỊ TIẾNG VIỆT CHỐNG RỚT DẤU" not in content:
    with open(css_path, 'a', encoding='utf-8') as f:
        f.write(css_block)
    print("✅ Đã chèn thành công block CSS vào src/index.css")
else:
    print("⚠️ Block CSS đã tồn tại trong src/index.css")
