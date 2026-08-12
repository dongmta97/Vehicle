with open('src/components/PhieuTongLapTrangBiKyThuatForm.tsx', 'r') as f:
    content = f.read()

import re
content = re.sub(r"noiDung: 'Lắp toàn bộ đường dầu phanh chạy dọc khung, dọc thân cầu xe.\nUốn theo dạng lượn chạy dọc khung xe, cầu xe.\nBắt kẹp giữa đường ống'", r"noiDung: 'Lắp toàn bộ đường dầu phanh chạy dọc khung, dọc thân cầu xe. Uốn theo dạng lượn chạy dọc khung xe, cầu xe. Bắt kẹp giữa đường ống'", content)

with open('src/components/PhieuTongLapTrangBiKyThuatForm.tsx', 'w') as f:
    f.write(content)
