with open('src/components/TayRuaLamSachBeMatSonForm.tsx', 'r') as f:
    content = f.read()

import re
content = re.sub(r"yeuCau: '- Vỏ xe không bập bùng;\n- Không có rỗ mọt trên toàn xe;\n- Mài phẳng mối hàn.'", r"yeuCau: '- Vỏ xe không bập bùng; - Không có rỗ mọt trên toàn xe; - Mài phẳng mối hàn.'", content)

content = re.sub(r"yeuCau: '- Làm sạch đất, dầu mơ;\n- Làm sạch xỉ hàn.'", r"yeuCau: '- Làm sạch đất, dầu mơ; - Làm sạch xỉ hàn.'", content)

content = re.sub(r"yeuCau: '- Độ không đồng phẳng ≤1,5mm;\n- Theo mẫu xe nguyên thuỷ mà TCN qui định.'", r"yeuCau: '- Độ không đồng phẳng ≤1,5mm; - Theo mẫu xe nguyên thuỷ mà TCN qui định.'", content)

with open('src/components/TayRuaLamSachBeMatSonForm.tsx', 'w') as f:
    f.write(content)
