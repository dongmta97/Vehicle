import re

file_path = 'src/components/RepairRecordsTab.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'import { KiemTraSauLapDongCoForm }' not in content:
    # Tìm vị trí import LapRapDongCoForm để chèn ngay bên dưới
    content = re.sub(
        r'(import \{ LapRapDongCoForm \} from "\./LapRapDongCoForm";)',
        r'\1\nimport { KiemTraSauLapDongCoForm } from "./KiemTraSauLapDongCoForm";',
        content
    )
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fix thành công: Đã chèn import KiemTraSauLapDongCoForm.")
else:
    print("Import đã tồn tại. Hãy kiểm tra lại file KiemTraSauLapDongCoForm.tsx xem có export đúng tên không.")
