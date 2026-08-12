import json
import re

items = [
    ("I. ĐỘNG CƠ", [
        ("Cụm hút mu rùa", "1"),
        ("Van hơi hút", "1"),
        ("Ống + rắc co hơi hút", "1b"),
        ("Cụm ống xả", "2"),
        ("Tôn che ống xả", "4"),
        ("Nắp đậy BR cam cơ", "1"),
        ("Nắp đậy dàn cò mổ", "2"),
        ("Bầu đổ nhớt + nắp", "1b"),
        ("Đế bầu đổ nhớt", "1"),
        ("Vỏ thước nhớt + R/co", "1b"),
        ("Thước đo nhớt", "1"),
        ("Lọc nhớt ly tâm", "1b"),
        ("Lọc nhiên liệu", "1b"),
        ("Bát bắt lọc xăng", "1"),
        ("Vỏ trục bộ chia điện", "1"),
        ("Cánh quạt", "1"),
        ("Cổ ống nước", "1"),
        ("Puly trục cơ", "1"),
        ("Đai ốc răng sói", "1"),
        ("Bát bắt lọc gió", "1"),
        ("Bát máy phát", "1"),
        ("Bát câu máy", "3"),
        ("Tôn che khởi động", "1"),
        ("Cạc te động cơ", "1"),
        ("Nắp che dưới ly hợp", "1"),
        ("Vỏ bọc bánh đà", "1"),
        ("Bơm cao áp", "1b"),
        ("Bộ hạn chế tốc độ", "1b"),
        ("Bơm nhiên liệu", "1b"),
        ("Bơm nước + Puly", "1b"),
        ("Bơm nhớt", "1b"),
        ("Bơm hơi + Puly", "1b"),
        ("Bộ ly hợp", "1b"),
        ("Nắp máy", "2b")
    ]),
    ("2.1. HỆ THỐNG ĐIỆN", [
        ("Máy khởi động", "1"),
        ("Hộp TK", "1"),
        ("Bộ chia điện bán dẫn", "1"),
        ("Máy phát điện", "1"),
        ("Tiết chế", "1"),
        ("Hộp điện trở 2,3 cọc", "1"),
        ("Rơle đề phụ", "1"),
        ("Bình điện", "1"),
        ("Tay gạt xi nhan", "1"),
        ("Công tắc điện + Khóa mát", "1+1"),
        ("Buton nhấn còi", "1"),
        ("Còi điện + Còi hơi", "1+1"),
        ("Máy gạt mưa", "1b"),
        ("Khóa hơi gạt mưa", "1"),
        ("Cần + chổi gạt mưa", "2"),
        ("Đèn pha + chụp bảo vệ", "2b"),
        ("Đèn hiệu trước + sau", "2+2"),
        ("Đèn trần + Đèn tài liệu nhỏ", "1+2"),
        ("Đèn biển số", "1"),
        ("Đèn soi máy", "1"),
        ("Đồng hồ điện", "1"),
        ("Đồng hồ áp suất nhớt", "1"),
        ("Đồng hồ nhiệt độ nước", "1"),
        ("Đồng hồ hơi", "1"),
        ("Đồng hồ nhiên liệu", "1"),
        ("Đồng hồ tốc độ xe", "1"),
        ("Cardan lái", "1b"),
        ("Cần kéo CH ngang+dọc", "2"),
        ("Chốt quả táo CHngang dọc", "4"),
        ("Bàn đạp", "1"),
        ("Dẫn động phanh", "1"),
        ("Tổng phanh", "1"),
        ("Cam phanh", "6"),
        ("Bầu hơi", "2")
    ]),
    ("2.2. HỆ THỐNG PHANH", [
        ("Van an toàn", "1"),
        ("Van xả", "2"),
        ("Đường ống phanh", "1b"),
        ("Van hơi rơmóoc", "1"),
        ("Đường ống van RM", "1b"),
        ("Cần kéo + dẫn động", "1b"),
        ("Tăng bua phanh tay", "1"),
        ("Cụm chỉnh phanh", "1b"),
        ("Bàn đạp + dẫn động", "1b"),
        ("Càng ngắt ly hợp", "1"),
        ("Ống giảm xóc", "2"),
        ("Bát nhíp trước + sau", "8"),
        ("Nhíp trước", "2b"),
        ("Nhíp sau", "2b"),
        ("Giá lốp dự phòng", "1b"),
        ("Xi lanh nâng lốp DP", "1"),
        ("Van dầu mở XL DP", "1"),
        ("Cần mở vandầu XLDP", "1"),
        ("Bánh dự phòng Đ/bộ", "1b"),
        ("Bánh xe đồng bộ", "6b")
    ]),
    ("2.5. HỘP SỐ", [
        ("Đầu nối láp (đầu sáp)", "1"),
        ("Cần số chính", "1")
    ]),
    ("2.7. CARDAN NGẮN", [
        ("Đầu then trong ngoài", "1+1"),
        ("Chữ thập đồng bộ", "2"),
        ("Chạc trục truyền CD", "2"),
        ("Kính cửa hông", "2"),
        ("Kính gió + khóa gài", "2+2"),
        ("Ổ khóa cửa", "2"),
        ("Tay mở cửa trong", "2"),
        ("Cơ cấu quay kính", "2"),
        ("Tay quay kính", "2"),
        ("U lên cản trước", "1"),
        ("Hộc bình điện", "1b"),
        ("Khung chắn trên cản", "1"),
        ("Che bảo vệ đèn pha", "2"),
        ("Đồng hồ áp suất hơi", "1"),
        ("Van Đ/khiển T/ tâm", "1"),
        ("Van khóa hơi lốp", "6"),
        ("Nắp che van hơi lốp", "6"),
        ("Bộ đường ống+rắcco", "1b"),
        ("Kính chắn gió lớn + nhỏ", "2b"),
        ("Kính sau cabin", "1"),
        ("Kính chiếu hậu", "2"),
        ("Tay kính chiếu hậu", "2"),
        ("Ca bô+ chống cabô", "1+2"),
        ("Sò chống hơi", "2"),
        ("Van mở hơi trên cabin", "1"),
        ("Cần mở van trêncabin", "1"),
        ("Ống cao su chống hơi", "8m"),
        ("Ống cao su sò hơi", "2"),
        ("C/su che bụi C/chống", "2"),
        ("Két nước", "1b"),
        ("Nắp két nước", "1"),
        ("Bọc gió két nước", "1"),
        ("Vòng sắt mặttrongKN", "1"),
        ("Két mát nhớt", "1"),
        ("Khóa đường nhớt", "1"),
        ("Bầu lọc gió", "1"),
        ("Ruột lọc gió", "1"),
        ("Ống cao su lọc gió", "1"),
        ("Thùng NL chính + nắp", "1b"),
        ("Ống đổ thùng NL", "1"),
        ("Ruột lọc sơ cấp", "1"),
        ("Ống đổ thùng NL phụ", "1b"),
        ("Nắp che thùng xăng phụ", "1"),
        ("Bầusắt tròn trênthùng", "1"),
        ("Bầu giảm thanh", "2"),
        ("Ống sắt BGT → cabin", "1"),
        ("Khung nhômbảo vệ bô", "1b"),
        ("Tay nắm lên cabin", "2"),
        ("Giá bắt bình cứu hỏa", "1"),
        ("Giá súng trong cabin", "1")
    ]),
    ("2.19. NỘI THẤT", [
        ("Tấm che nắng", "1"),
        ("Bộ đệm ghế", "2b"),
        ("Khung ghế", "2b"),
        ("Thùng dụng cụ", "1"),
        ("Cản trước", "1"),
        ("Móc cản trước + tấm che", "2"),
        ("Cản sau", "2"),
        ("Móc hậu", "1")
    ])
]

output = {
    "templateVersion": 1,
    "vehicleCode": "URAL-HANDOVER",
    "vehicleName": "Ural 43206",
    "protocolType": "GIAO_NHAN",
    "sections": []
}

tt = 1
total_items = 0
for sec_name, sec_items in items:
    section = {"name": sec_name, "items": []}
    for item_name, quantity in sec_items:
        # Clean item name
        clean_name = re.sub(r'^\s*-\s*', '', item_name) # remove leading dash
        clean_name = re.sub(r'^\d+\s*\.?\s*', '', clean_name) # remove leading numbers if any (already did mostly by hand)
        section["items"].append({
            "tt": tt,
            "name": clean_name,
            "quantity": quantity
        })
        tt += 1
        total_items += 1
    output["sections"].append(section)

print(f"Total items extracted: {total_items}")

with open("src/templates/Ural43206Template.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

