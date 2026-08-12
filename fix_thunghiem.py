with open('src/components/ThuNghiemTongTheForm.tsx', 'r') as f:
    content = f.read()

import re
content = re.sub(r'<th className="border border-black px-2 py-2 text-center font-bold">Nội dung</th>', r'<th className="border border-black px-2 py-2 text-center font-bold">Nội dung thử nghiệm</th>', content)

with open('src/components/ThuNghiemTongTheForm.tsx', 'w') as f:
    f.write(content)
