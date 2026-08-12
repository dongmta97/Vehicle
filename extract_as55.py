import json
import re

items = [
    ("I. ĐỘNG CƠ 236", [
        ("Nắp đậy dàn cò mổ", "2"),
        ("Cụm ống xả", "2"),
        ("Cụm ống hút", "2"),
        ("Bộ nắp đậy đầu máy", "1b"),
        ("Ống hút ngang + cổ", "1b"),
        ("Ống nước nắp máy", "3"),
        ("Cổ ống nước trêndưới", "2"),
        ("Ống nước ngang", "1"),
        ("Ống nước từ bơm lên", "1"),
        ("Ống thoát hơi máy", "1"),
        ("Nắp đổ nhớt", "1"),
        ("Ống đổ nhớt", "1"),
        ("Thước đo nhớt + vỏ", "1b"),
        ("Lọc nhớt ly tâm (tinh)", "1b"),
        ("Lọc nhớt thô", "1b"),
        ("Đường ống nhớt rắc co", "1b"),
        ("Lọc nhiên liệu", "2"),
        ("Bát máy phát", "1"),
        ("Bát câu máy", "2"),
        ("Cánh quạt gió", "1"),
        ("Bích bắt quạt gió", "1"),
        ("Puly quạt gió", "1"),
        ("Puly bơm nước", "1"),
        ("Công tắc cúp bình", "1"),
        ("Đạp hơi tắt máy", "1"),
        ("Puly trục cơ", "1"),
        ("Puly tăng đưa + bát", "1b"),
        ("Vỏ bọc bánh đà", "1"),
        ("Cạc te động cơ", "1"),
        ("Tấm che dưới ly hợp", "1"),
        ("Chân máy", "1b"),
        ("Ống cao áp", "6"),
        ("Ống dầu hồi", "1b"),
        ("Bơm cao áp", "1"),
        ("Bơm thấp áp", "1"),
        ("Kim phun", "6"),
        ("Bơm nhớt", "1"),
        ("Bơm nước", "1"),
        ("Bơm hơi", "1"),
        ("Nắp máy", "2")
    ]),
    ("1.1. HỆ THỐNG ĐIỆN", [
        ("Máy khởi động", "1"),
        ("Máy phát điện", "1"),
        ("Tiết chế", "1"),
        ("Bình điện", "2"),
        ("Tay gạt xi nhan", "1"),
        ("Công tắc điện", "1"),
        ("Còi điện + buton", "1+1"),
        ("Còi hơi + đạp còi hơi", "1+1"),
        ("Máy gạt mưa + khóa hơi", "2b"),
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
        ("Đồng hồ hơi", "1"),
        ("Đồng hồ nhiên liệu", "1"),
        ("Đồng hồ tốc độ xe", "1"),
        ("Ổ cắm điện sau", "1")
    ]),
    ("1.2. HỆ THỐNG LÁI", [
        ("Trục + ống + vành tay lái", "1b"),
        ("Hộp cơ cấu lái + Đòn quay đứng", "1+1"),
        ("Bơm trợ lực lái", "1b"),
        ("Xy lanh trợ lực lái", "1b"),
        ("Cardan lái", "1b"),
        ("Thanh CH ngang + dọc", "2"),
        ("Rô tuyn CH ngang + dọc", "4"),
        ("Két mát dầu lái", "1")
    ]),
    ("1.3. HỆ THỐNG PHANH", [
        ("Bàn đạp + dẫn động phanh", "1b"),
        ("Tổng phanh", "1"),
        ("Tổng bơm phanh", "1"),
        ("Bộ chia hơi", "1"),
        ("Bầu trợ lực phanh", "2"),
        ("Bơm phanh phụ (đôi)", "6"),
        ("Bầu hơi", "2"),
        ("Van an toàn", "1"),
        ("Van xả", "2"),
        ("Đường ống phanh", "1b"),
        ("Van hơi rơ moóc", "2"),
        ("Đường ống hơi rơ moóc", "1b"),
        ("Cần kéo + dẫn động", "1b"),
        ("Tăng bua phanh tay", "1"),
        ("Cụm chỉnh phanh", "1b")
    ]),
    ("1.4. DẪN ĐỘNG LY HỢP", [
        ("Bơm cái ly hợp", "1"),
        ("Bơm con ly hợp", "1"),
        ("Bàn đạp + dẫn động", "1b"),
        ("Càng ngắt ly hợp", "1")
    ]),
    ("1.5. HỘP SỐ", [
        ("Cần số chính", "1"),
        ("Đầu nối láp (đầu sáp)", "1")
    ]),
    ("1.6. HỘP SỐ PHỤ", [
        ("Cần gài cầu T+ số M", "2"),
        ("Đầu sáp các trục HSP", "3"),
        ("Hộp trích công suất", "1"),
        ("Cần gài tời", "1")
    ]),
    ("1.7. CARDAN NGẮN", [
        ("Đầu then trong ngoài", "1+1"),
        ("Chữ thập đồng bộ", "2"),
        ("Mặt bích nối cardan", "2")
    ]),
    ("1.8. CARDAN TRƯỚC", [
        ("Đầu then trong ngoài", "1+1"),
        ("Chữ thập đồng bộ", "2"),
        ("Mặt bích nối cardan", "2")
    ]),
    ("1.9. CARDAN GIỮA", [
        ("Đầu then trong ngoài", "1+1"),
        ("Chữ thập đồng bộ", "2"),
        ("Mặt bích nối láp", "2")
    ]),
    ("1.10. CARDAN TỜI", [
        ("Đầu then trong ngoài", "1+1"),
        ("Chữ thập đồng bộ", "2"),
        ("Mặt bích nối cardan", "2")
    ]),
    ("1.11. CARDAN SAU", [
        ("Đầu then trong ngoài", "1+1"),
        ("Chữ thập đồng bộ", "2"),
        ("Mặt bích nối láp", "2")
    ]),
    ("1.12. CẦU TRƯỚC", [
        ("Khớp quay C/hướng", "2"),
        ("Vỏ khớp quay CH", "2"),
        ("Ba ngang (bàn tay ếch)", "1"),
        ("Đầu nối cardan (Đ/sáp)", "1"),
        ("Mặt nạ", "1"),
        ("Cửa hông", "2b"),
        ("Tấm che ổ Q/kính", "2")
    ]),
    ("1.13. CẦU GIỮA", [
        ("Đầu nối cardan (Đ/sáp)", "2")
    ]),
    ("1.14. CẦU SAU", [
        ("Đầu nối cardan (Đ/sáp)", "1")
    ]),
    ("1.15. HỆ THỐNG TREO", [
        ("Ống giảm xóc", "2"),
        ("Trục C/bằng + ổ đỡ", "1+2"),
        ("Thân thanh GC", "6"),
        ("Quả táo TGC", "12b"),
        ("Bát nhíp trước + sau", "8"),
        ("Nhíp trước", "2b"),
        ("Nhíp sau", "2b")
    ]),
    ("1.16. HỆ THỐNG TỜI", [
        ("Hộp tời", "1b"),
        ("Cần gài tời", "1"),
        ("Cáp tời", "1b"),
        ("Ru lô đỡ cáp", "1b"),
        ("Giá hộp tời +chốt hãm", "1b"),
        ("Móc+ ma ní tời", "1b")
    ]),
    ("1.17. HỆ THỐNG BƠM LỐP", [
        ("Đồng hồ áp suất hơi", "1"),
        ("Van Đ/khiển T/ tâm", "1"),
        ("Van khóa hơi lốp", "6"),
        ("Nắp che van hơi lốp", "6"),
        ("Bộ đường ống+rắcco", "1b")
    ]),
    ("1.18. CABIN", [
        ("Kính chắn gió", "2"),
        ("Kính góc chắn gió", "2"),
        ("Kính sau cabin", "1"),
        ("Kính chiếu hậu", "2"),
        ("Tay kính chiếu hậu", "2"),
        ("Ca bô + móc gài", "1b"),
        ("Chống ca bô", "2b"),
        ("Kính cửa hông", "2"),
        ("Kính gió + khóa gài", "2b"),
        ("Ổ khóa cửa", "2"),
        ("Tay mở cửa trong", "2"),
        ("Tay mở cửa ngoài", "2"),
        ("Cơ cấu quay kính", "2"),
        ("Tay quay kính", "2"),
        ("Hộc tài liệu + nắp", "1+1"),
        ("Bậc lên xuống + giá", "2b"),
        ("Hộc B/điện+ nắp che", "1b"),
        ("Che bảo vệ đèn pha", "2"),
        ("Tay nắm lên cabin", "2"),
        ("Giá bắt + Bình C/hỏa", "1b"),
        ("Ống lấy gió ngoài cabin", "1b")
    ]),
    ("1.19. NỘI THẤT", [
        ("La phông + táp bi", "1.b"),
        ("Tấm che nắng", "1"),
        ("Bộ đệm ghế", "2b"),
        ("Khung ghế", "2b"),
        ("Thùng dụng cụ", "1")
    ]),
    ("1.20. KHUNG XE", [
        ("Biển số", "2"),
        ("Cản trước + tấm che", "1+3"),
        ("Móc cản trước", "2"),
        ("Bát U lên cản trước", "1"),
        ("Cản sau + móc hậu", "2+1")
    ]),
    ("1.21. THÙNG XE", [
        ("Tấm sắt chắn bùn", "4"),
        ("Thành đầu + hông", "1+2"),
        ("Bửng hậu + móc xích", "1+2"),
        ("Bộ băng cây", "2b"),
        ("U quang thùng + lòxo", "8b")
    ]),
    ("1.22. TRANG BỊ KHÁC", [
        ("Két nước + nắp", "1b"),
        ("Bọc gió két nước", "1"),
        ("Két mát nhớt", "1"),
        ("Bầu lọc gió", "1b"),
        ("Thùng xăng chính", "1"),
        ("Nắp thùng xăng chính", "1"),
        ("Ống đổ thùng xăng", "2"),
        ("Thùng xăng phụ", "1"),
        ("Nắp thùng xăng phụ", "1"),
        ("Khoá xăng sang thùng", "1"),
        ("Lọc xăng sơ cấp", "1b"),
        ("Bầu giảm thanh", "1"),
        ("Ống bô xả", "1"),
        ("Thùng đựng đồ nghề", "1"),
        ("Giá lốp dự phòng", "1b"),
        ("Xi lanh nâng lốp DP", "1"),
        ("Vỏ ruột dự phòng", "1b")
    ])
]

output = {
    "templateVersion": 1,
    "vehicleCode": "AS5.5-URAN43206",
    "vehicleName": "AS 5,5/URAN43206",
    "manufacturer": "URAN",
    "category": "Ô tô",
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

with open("src/templates/AS55_URAN43206Template.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

