with open('src/components/KiemTraThanVoSauSuaChuaForm.tsx', 'r') as f:
    content = f.read()

import re
content = re.sub(r"noiDung: 'Sai lệch khoảng cách A và B\n\(A = khoảng cách từ trục nhíp trước bên trái đến trục nhíp sau bên phải.\)\n\(B = khoảng cách từ trục nhíp trước bên phải đến trục nhíp sau bên trái.\)'", r"noiDung: 'Sai lệch khoảng cách A và B (A = khoảng cách từ trục nhíp trước bên trái đến trục nhíp sau bên phải.) (B = khoảng cách từ trục nhíp trước bên phải đến trục nhíp sau bên trái.)'", content)

content = re.sub(r"yeuCau: '2 ÷ 6 mm\n5 ÷ 9 mm'", r"yeuCau: '+ Theo viền bên: 2 ÷ 6 mm | + Theo viền đáy: 5 ÷ 9 mm'", content)

content = re.sub(r"noiDung: 'Khe hở mép cửa hậu:\n\+ Theo viền bên\n\+ Theo viền đáy'", r"noiDung: 'Khe hở mép cửa hậu'", content)

with open('src/components/KiemTraThanVoSauSuaChuaForm.tsx', 'w') as f:
    f.write(content)
