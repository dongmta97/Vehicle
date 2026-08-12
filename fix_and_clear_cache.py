import re
import os
import shutil

file_path = 'src/components/RepairRecordsTab.tsx'

# 1. DỌN DẸP CODE IMPORT
try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Xóa tất cả các dòng import liên quan đến KiemTraSauLap (nếu có bị lặp/lỗi)
    content = re.sub(r'^.*import.*KiemTraSauLapDongCoForm.*$\n', '', content, flags=re.MULTILINE)
    
    # Chèn đúng 1 dòng import ở ngay dòng đầu tiên của file
    content = 'import { KiemTraSauLapDongCoForm } from "./KiemTraSauLapDongCoForm";\n' + content

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("1. Đã dọn dẹp và đặt lại Import thành công.")
except Exception as e:
    print(f"Lỗi khi sửa file: {e}")

# 2. XÓA BỘ NHỚ ĐỆM CỦA VITE (Nguyên nhân chính gây lỗi khi F5)
vite_cache_dir = 'node_modules/.vite'
if os.path.exists(vite_cache_dir):
    try:
        shutil.rmtree(vite_cache_dir)
        print("2. Đã xóa bộ nhớ đệm của Vite (node_modules/.vite).")
    except Exception as e:
        print(f"Không thể xóa cache Vite: {e}")
else:
    print("2. Không tìm thấy thư mục cache Vite (Có thể đã bị xóa trước đó).")

print("\nHOÀN TẤT! HÃY BÁO NGƯỜI DÙNG KHỞI ĐỘNG LẠI NPM RUN DEV.")
