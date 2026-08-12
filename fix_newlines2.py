with open('src/components/LapRapHieuChinhGamForm.tsx', 'r') as f:
    content = f.read()

import re
content = re.sub(r"yeuCau: '6m\nKhông lệch quá 8°'", r"yeuCau: '6m. Không lệch quá 8°'", content)

with open('src/components/LapRapHieuChinhGamForm.tsx', 'w') as f:
    f.write(content)
