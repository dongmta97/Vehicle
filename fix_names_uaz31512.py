import json
import os

file_path = 'src/templates/selections/UAZ31512Selection.json'

# Từ điển ánh xạ chính xác các từ cần thay thế
replacements = {
    "AS nhớt M358": "Cảm biến AS nhớt M358",
    "AS nhớt": "Đồng hồ AS nhớt",
    "tO nước": "Đồng hồ nhiệt độ nước",
    "nhiên liệu": "Đồng hồ nhiên liệu",
    "tốc độ": "Đồng hồ tốc độ",
    "đèn T/tâm": "Công tắc đèn T/tâm",
    "đèn trần": "Công tắc đèn trần",
    "đèn tài liệu": "Công tắc đèn tài liệu",
    "pha cốt": "Công tắc pha cốt",
    "cúp bình": "Công tắc cúp bình",
    "10A": "Công tắc 10A",
    "A": "Công tắc 10A",
    "gạt mưa": "Công tắc gạt mưa",
    "đèn ưu tiên": "Công tắc đèn ưu tiên",
    "hiệu sau": "Đèn hiệu sau",
    "hông": "Đèn hông",
    "de": "Đèn de",
    "trần": "Đèn trần",
    "biển số": "Đèn biển số",
    "soi máy": "Đèn soi máy",
    "đọc tài liệu": "Đèn đọc tài liệu",
    "stop": "Cục stop",
    "báo de": "Cục báo de",
    "TC 50207 (6207)": "Bi trục TC 50207 (6207)",
    "TG 6305": "Bi trục TG 6305",
    "TG 50306 (6306)": "Bi trục TG 50306 (6306)",
    "50307 (6307)": "Vòng bi 50307 (6307)",
    "(6307)": "Vòng bi 50307 (6307)",
    "42305": "Vòng bi 42305",
    "7509": "Vòng bi 7509",
    "102304": "Vòng bi 102304",
    "57707 đôi": "Vòng bi 57707 đôi",
    "đôi": "Vòng bi 57707 đôi"
}

if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    updated_count = 0
    for section in data.get('sections', []):
        for item in section.get('items', []):
            # Lấy tên hiện tại và xóa khoảng trắng thừa
            current_name = item.get('name', '').strip()
            
            # Kiểm tra nếu tên khớp với từ điển thì đổi lại
            if current_name in replacements:
                item['name'] = replacements[current_name]
                updated_count += 1
            
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"✅ Đã cập nhật và đổi tên thành công {updated_count} mục trong {file_path}")
else:
    print(f"❌ Không tìm thấy file {file_path}")
