with open('src/components/TayRuaLamSachCumGamForm.tsx', 'r') as f:
    content = f.read()

import re
content = re.sub(r"yeuCau: 'Sạch sẽ, không han rỉ.*?làm sạch'", r"yeuCau: 'Sạch sẽ, không han rỉ. Thoa lớp mỡ chì mỏng sau khi vệ sinh, làm sạch'", content, flags=re.DOTALL)

with open('src/components/TayRuaLamSachCumGamForm.tsx', 'w') as f:
    f.write(content)
