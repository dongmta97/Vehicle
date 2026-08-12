import json
import re

items = [
    ("I. ĐỘNG CƠ", [
        ("Cụm hút xả (1H - 2H)", "1"),
        ("Nắp đậy BR cam cơ", "1"),
        ("Nắp che dàn con đội", "2"),
        ("Nắp đậy dàn cò mổ", "1"),
        ("Nắp đổ nhớt", "1"),
        ("Thước đo nhớt", "1"),
        ("Lọc nhớt", "1"),
        ("Lọc xăng tinh", "1b"),
        ("Bát lọc xăng", "1"),
        ("Cánh quạt", "1"),
        ("Cổ ống nước", "1"),
        ("Vỏ trục bộ chia điện", "1"),
        ("Bát bắt lọc gió", "1"),
        ("Bát máy phát", "1"),
        ("Bát câu máy", "2"),
        ("Puly bơm nước", "1"),
        ("Puly trục cơ", "1"),
        ("Đai ốc răng sói", "1"),
        ("Cạc te động cơ", "1"),
        ("Cạc te ly hợp", "1"),
        ("Vỏ bọc bánh đà", "1"),
        ("Tăng cứng bọc B/đà", "2"),
        ("Chân máy trước", "2"),
        ("Chế hòa khí", "1b"),
        ("Bơm xăng", "1b"),
        ("Bơm nước", "1b"),
        ("Bơm nhớt", "1b"),
        ("Bộ ly hợp", "1b"),
        ("Nắp máy", "1b"),
    ]),
    ("2.1. HỆ THỐNG ĐIỆN", [
        ("Máy khởi động", "1"),
        ("Hộp TK", "1"),
        ("Bộ chia điện", "1"),
        ("Tăng điện", "1"),
        ("Nến điện + Chụp", "4"),
        ("Dây phin", "5"),
        ("Máy phát điện", "1"),
        ("Tiết chế", "1"),
        ("Hộp điện trở 2,3 cọc", "1"),
        ("Rơle đề phụ", "1"),
        ("Bình điện", "1"),
        ("Tay gạt xi nhan", "1"),
        ("Công tắc điện", "1"),
        ("Công tắc cúp bình", "1"),
        ("Buton nhấn còi", "1"),
        ("Còi điện", "1"),
        ("Máy gạt mưa", "1b"),
        ("Cần + chổi gạt mưa", "2"),
        ("Đèn pha", "2"),
        ("Đèn hiệu trước + sau", "2+2"),
        ("Đèn hông", "2"),
        ("Đèn trần", "1"),
        ("Đèn biển số", "1"),
        ("Đèn soi máy", "1"),
        ("Đèn de", "1"),
        ("Đồng hồ điện", "1"),
        ("Đồng hồ áp suất nhớt", "1"),
        ("Đồng hồ nhiệt độ nước", "1"),
        ("Đồng hồ nhiên liệu", "1"),
        ("Đồng hồ tốc độ xe", "1"),
        ("Ổ cắm điện sau", "1"),
    ]),
    ("2.2. HỆ THỐNG LÁI", [
        ("Trục + vành tay lái", "1b"),
        ("Ống tay lái", "1"),
        ("Khớp nối trục tay lái", "1"),
        ("Đòn quay đứng", "1"),
        ("Thanh CH ngang + dọc", "2"),
        ("Rô tuyn CH ngang + dọc", "4"),
        ("Hộp cơ cấu lái", "1b"),
    ]),
    ("2.3. HỆ THỐNG PHANH", [
        ("Bàn đạp (sàn – treo)", "1"),
        ("Bơm phanh cái 1T - 2T", "1"),
        ("Bầu chứa dầu phanh", "2"),
        ("Bầu trợ lực", "1"),
        ("Bơm phanh con sau", "2"),
        ("Bơm P con trước phải", "2"),
        ("Bơm P con trước trái", "2"),
        ("Đường ống phanh", "1b"),
        ("Cần kéo + dẫn động", "1b"),
        ("Tăng bua phanh tay", "1"),
        ("Cụm chỉnh phanh", "1b"),
    ]),
    ("2.4. DẪN ĐỘNG LY HỢP", [
        ("Bơm cái ly hợp", "1"),
        ("Bơm con ly hợp", "1"),
    ]),
    ("2.5. HỘP SỐ", [
        ("Cần số chính", "1"),
    ]),
    ("2.6. HỘP SỐ PHỤ", [
        ("Cần gài cầu T+ số M", "2"),
        ("Đầu sáp các trục HSP", "2"),
    ]),
    ("2.7. CARDAN TRƯỚC", [
        ("Đầu then trong ngoài", "1+1"),
        ("Chữ thập đồng bộ", "2"),
        ("Mặt bích nối cardan", "2"),
    ]),
    ("2.8. CARDAN SAU", [
        ("Đầu then trong ngoài", "1+1"),
        ("Chữ thập đồng bộ", "2"),
        ("Mặt bích nối cardan", "2"),
    ]),
    ("2.9. CẦU TRƯỚC (A1 – A2)", [
        ("Khớp quay C/hướng", "2"),
        ("Vỏ khớp quay CH", "2"),
        ("Ba ngang (bàn tay ếch)", "1"),
        ("Đầu nối cardan (Đ/sáp)", "1"),
        ("Loa kèn đầu cầu", "2"),
        ("Bán trục ngắn + dài", "2"),
        ("Chụp đầu bán trục", "2"),
        ("Bánh răng gài cầu", "2"),
    ]),
    ("2.10. CẦU SAU (A1 – A2)", [
        ("Đầu nối cardan (Đ/sáp)", "1"),
    ]),
    ("2.11. HỆ THỐNG TREO", [
        ("Ống giảm xóc", "4"),
        ("Uquangnhíp trước+sau", "8"),
        ("Bát nhíp trước + sau", "8"),
        ("Bát bợ cầu", "4"),
        ("Nhíp trước", "2b"),
        ("Nhíp sau", "2b"),
    ]),
    ("2.12. CABIN – THÂN XE", [
        ("Kính chắn gió", "1"),
        ("Kính sau cabin", "1"),
        ("Kính chiếu hậu ngoài", "2"),
        ("Tay kính chiếu hậu ngoài", "2"),
        ("Kính chiếu hậu trong", "1"),
        ("Ca bô + móc gài", "1b"),
        ("Chống ca bô", "1"),
        ("Tay nắm cửa hông", "2"),
        ("Tấm che cửa hông", "4"),
        ("Kính hông", "2"),
        ("Kính lấy gió", "2"),
        ("Khóa gài kính gió", "2"),
        ("Cơ cấu quay kính", "2"),
        ("Tay quay kính", "2"),
        ("Ổ khóa cửa", "2"),
        ("Tay mở cửa ngoài", "2"),
        ("Tay mở cửa trong", "2"),
    ]),
    ("2.13. THÙNG XE (Sắt – Gỗ)", [
        ("Thành đầu", "1"),
        ("Thành hông", "2"),
        ("Bửng hậu", "1"),
        ("Khóa gài", "1b"),
    ]),
    ("2.14. NỘI THẤT", [
        ("La phông + táp bi", "2b"),
        ("Bọc ca bô", "1"),
        ("Tấm che nắng", "2"),
        ("Bộ đệm ghế", "2b"),
        ("Khung ghế", "2b"),
    ]),
    ("2.15. KHUNG XE", [
        ("Biển số", "2"),
        ("Cản trước", "1"),
        ("Móc kéo trước", "2"),
        ("Cản sau", "2"),
        ("Móc hậu", "1"),
    ]),
    ("2.16 TRANG BỊ KHÁC", [
        ("Két nước", "1"),
        ("Nắp két nước", "1"),
        ("Bọc gió két nước", "1"),
        ("Chống két nước", "2"),
        ("Két mát nhớt", "1"),
        ("Bầu lọc gió", "1b"),
        ("Thùng nhiên liệu", "2b"),
        ("Nắp thùng NL", "2"),
        ("Giá thùng nhiên liệu", "2"),
        ("Ống đổ thùng N/liệu", "2"),
        ("Khóa xăng sang thùng", "1"),
        ("Lọc xăng sơ cấp", "1"),
        ("Bô giảm thanh + ống xả", "1b"),
        ("Giá + lốp dự phòng", "1b"),
        ("Vỏ + ruột bánh xe", "4b"),
    ])
]

output = {
    "templateVersion": 1,
    "vehicleCode": "YAZ451-HANDOVER",
    "vehicleName": "YAZ 451-3303",
    "manufacturer": "UAZ",
    "category": "Ô tô tải",
    "protocolType": "GIAO_NHAN",
    "sections": []
}

tt = 1
total_items = 0
for sec_name, sec_items in items:
    section = {"name": sec_name, "items": []}
    for item_name, quantity in sec_items:
        clean_name = re.sub(r'^\s*-\s*', '', item_name)
        clean_name = re.sub(r'^\d+\s*\.?\s*', '', clean_name)
        section["items"].append({
            "tt": tt,
            "name": clean_name,
            "quantity": quantity
        })
        tt += 1
        total_items += 1
    output["sections"].append(section)

print(f"Total items extracted: {total_items}")

with open("src/templates/YAZ451_3303Template.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

