import json
import os

file_path = 'src/templates/selections/UAZ31512Selection.json'

if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for section in data.get('sections', []):
        items = section.get('items', [])
        
        # 1. Xóa mục thừa: "Cầu chì công tắc T/tâm"
        items = [item for item in items if item.get('name') != "Cầu chì công tắc T/tâm"]
        
        new_items = []
        for i, item in enumerate(items):
            name = item.get('name', '')
            
            # 2. Chèn thêm "Bạc nhíp T+S" ngay sau "Bát nhíp trước + sau"
            if name == "Bát nhíp trước + sau":
                new_items.append(item)
                new_items.append({"name": "Bạc nhíp T+S", "quantity": "4"})
                continue
            
            # 3. Phục hồi tên cho các chuỗi rỗng dựa vào các phần tử liền kề (trước và sau)
            if name == "":
                prev_name = items[i-1].get('name') if i > 0 else ""
                next_name = items[i+1].get('name') if i < len(items)-1 else ""
                
                # Vị trí giữa "Vòng bi 50307 (6307)" và "Bánh răng tốc độ"
                if prev_name == "Vòng bi 50307 (6307)" and next_name == "Bánh răng tốc độ":
                    item['name'] = "Vòng bi 42305"
                
                # Vị trí ngay dưới "Vòng bi 7510" (ở cả CẦU TRƯỚC và CẦU SAU)
                elif prev_name == "Vòng bi 7510":
                    item['name'] = "Vòng bi 7509"
                
                # Vị trí ngay trên "Vòng bi 57707 đôi" (ở cả CẦU TRƯỚC và CẦU SAU)
                elif next_name == "Vòng bi 57707 đôi":
                    item['name'] = "Vòng bi 102304"
            
            new_items.append(item)
        
        # Cập nhật lại mảng items cho section
        section['items'] = new_items

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print("✅ Đã xử lý thành công: Xóa Cầu chì thừa, bổ sung Bạc nhíp, và điền tên Vòng bi bị trống!")
else:
    print(f"❌ Không tìm thấy file {file_path}")
