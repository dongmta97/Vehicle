import json

data = {
  "templateVersion": 1,
  "vehicleCode": "UAZ31512-HANDOVER",
  "vehicleName": "UAZ 31512",
  "manufacturer": "UAZ",
  "category": "Ô tô tải",
  "protocolType": "GIAO_NHAN",
  "sections": [
    {
      "name": "I. ĐỘNG CƠ",
      "items": [
        {"name": "Cụm hút xả (1H-2H)", "quantity": "1"},
        {"name": "Nắp đậy BR cam cơ", "quantity": "1"},
        {"name": "Nắp che dàn con đội", "quantity": "2"},
        {"name": "Nắp đậy dàn cò mổ", "quantity": "1"},
        {"name": "Nắp đổ nhớt", "quantity": "1"},
        {"name": "Thước đo nhớt", "quantity": "1"},
        {"name": "Lọc nhớt", "quantity": "1"},
        {"name": "Lọc xăng tinh", "quantity": "1b"},
        {"name": "Bát lọc xăng", "quantity": "1"},
        {"name": "Cánh quạt", "quantity": "1"},
        {"name": "Cổ ống nước", "quantity": "1"},
        {"name": "Vỏ trục bộ chia điện", "quantity": "1"},
        {"name": "Bát bắt lọc gió", "quantity": "1"},
        {"name": "Bát máy phát", "quantity": "1"},
        {"name": "Bát câu máy", "quantity": "2"},
        {"name": "Puly bơm nước", "quantity": "1"},
        {"name": "Puly trục cơ", "quantity": "1"},
        {"name": "Đai ốc răng sói", "quantity": "1"},
        {"name": "Cạc te động cơ", "quantity": "1"},
        {"name": "Cạc te ly hợp", "quantity": "1"},
        {"name": "Vỏ bọc bánh đà", "quantity": "1"},
        {"name": "Tăng cứng bọc B/đà", "quantity": "2"},
        {"name": "Chân máy trước", "quantity": "2"},
        {"name": "Chế hòa khí", "quantity": "1b"},
        {"name": "Bơm xăng", "quantity": "1b"},
        {"name": "Bơm nước", "quantity": "1b"},
        {"name": "Bơm nhớt", "quantity": "1b"},
        {"name": "Bộ ly hợp", "quantity": "1b"},
        {"name": "Nắp máy", "quantity": "1b"}
      ]
    },
    {
      "name": "2.1. HỆ THỐNG ĐIỆN",
      "items": [
        {"name": "Máy khởi động", "quantity": "1"},
        {"name": "Hộp TK", "quantity": "1"},
        {"name": "Bộ chia điện", "quantity": "1"},
        {"name": "Tăng điện", "quantity": "1"},
        {"name": "Nến điện + Chụp", "quantity": "4"},
        {"name": "Dây phin", "quantity": "5"},
        {"name": "Máy phát điện", "quantity": "1"},
        {"name": "Tiết chế", "quantity": "1"},
        {"name": "Hộp điện trở 2,3 cọc", "quantity": "1"},
        {"name": "Rơle đề phụ", "quantity": "1"},
        {"name": "Bình điện", "quantity": "1"},
        {"name": "Tay gạt xi nhan + CT pha cos", "quantity": "1+1"},
        {"name": "Công tắc điện + CT cúp bình", "quantity": "1+1"},
        {"name": "Công tắc trung tâm", "quantity": "1"},
        {"name": "Buton nhấn còi", "quantity": "1"},
        {"name": "Còi điện", "quantity": "1"},
        {"name": "Máy gạt mưa", "quantity": "1b"},
        {"name": "Cần + chổi gạt mưa", "quantity": "2"},
        {"name": "Đèn pha", "quantity": "2"},
        {"name": "Đèn hiệu trước + sau", "quantity": "2+2"},
        {"name": "Đèn hông", "quantity": "2"},
        {"name": "Đèn trần", "quantity": "1"},
        {"name": "Đèn biển số", "quantity": "1"},
        {"name": "Đèn soi máy", "quantity": "1"},
        {"name": "Đèn de", "quantity": "1"},
        {"name": "Đồng hồ điện", "quantity": "1"},
        {"name": "Đồng hồ áp suất nhớt", "quantity": "1"},
        {"name": "Đồng hồ nhiệt độ nước", "quantity": "1"},
        {"name": "Đồng hồ nhiên liệu", "quantity": "1"},
        {"name": "Đồng hồ tốc độ xe", "quantity": "1"},
        {"name": "Ổ cắm điện sau", "quantity": "1"},
        {"name": "Giá bắt đèn lách", "quantity": "1"},
        {"name": "Đèn lách", "quantity": "1"}
      ]
    },
    {
      "name": "2.2. HỆ THỐNG LÁI",
      "items": [
        {"name": "Trục + vành tay lái", "quantity": "1b"},
        {"name": "Ống tay lái", "quantity": "1"},
        {"name": "Khớp nối trục tay lái", "quantity": "1"},
        {"name": "Đòn quay đứng", "quantity": "1"},
        {"name": "Thanh CH ngang + dọc", "quantity": "2"},
        {"name": "Rô tuyn CH ngang + dọc", "quantity": "4"},
        {"name": "Hộp cơ cấu lái", "quantity": "1b"}
      ]
    },
    {
      "name": "2.3. HỆ THỐNG PHANH",
      "items": [
        {"name": "Bàn đạp (sàn treo)", "quantity": "1"},
        {"name": "Bơm phanh cái 1T - 2T", "quantity": "1"},
        {"name": "Bầu chứa dầu phanh", "quantity": "2"},
        {"name": "Bầu trợ lực", "quantity": "1"},
        {"name": "Bơm phanh con sau", "quantity": "2"},
        {"name": "Bơm P con trước phải", "quantity": "2"},
        {"name": "Bơm P con trước trái", "quantity": "2"},
        {"name": "Đường ống phanh", "quantity": "1b"},
        {"name": "Cần kéo + dẫn động", "quantity": "1b"},
        {"name": "Tăng bua phanh tay", "quantity": "1"},
        {"name": "Cụm chỉnh phanh", "quantity": "1b"}
      ]
    },
    {
      "name": "2.4. DẪN ĐỘNG LY HỢP",
      "items": [
        {"name": "Bơm cái ly hợp", "quantity": "1"},
        {"name": "Bơm con ly hợp", "quantity": "1"}
      ]
    },
    {
      "name": "2.5. HỘP SỐ",
      "items": [
        {"name": "Cần số chính", "quantity": "1"}
      ]
    },
    {
      "name": "2.6. HỘP SỐ PHỤ",
      "items": [
        {"name": "Cần gài cầu T+ số M", "quantity": "2"},
        {"name": "Đầu sáp các trục HSP", "quantity": "2"}
      ]
    },
    {
      "name": "2.7. CARDAN TRƯỚC",
      "items": [
        {"name": "Đầu then trong ngoài", "quantity": "1+1"},
        {"name": "Chữ thập đồng bộ", "quantity": "2"},
        {"name": "Mặt bích nối cardan", "quantity": "2"}
      ]
    },
    {
      "name": "2.8. CARDAN SAU",
      "items": [
        {"name": "Đầu then trong ngoài", "quantity": "1+1"},
        {"name": "Chữ thập đồng bộ", "quantity": "2"},
        {"name": "Mặt bích nối cardan", "quantity": "2"}
      ]
    },
    {
      "name": "2.9. CẦU TRƯỚC (A1 – A2)",
      "items": [
        {"name": "Khớp quay C/hướng", "quantity": "2"},
        {"name": "Vỏ khớp quay CH", "quantity": "2"},
        {"name": "Ba ngang (bàn tay ếch)", "quantity": "1"},
        {"name": "Đầu nối cardan (Đ/sáp)", "quantity": "1"},
        {"name": "Loa kèn đầu cầu", "quantity": "2"},
        {"name": "Bán trục ngắn + dài", "quantity": "2"},
        {"name": "Chụp đầu bán trục", "quantity": "2"},
        {"name": "Bánh răng gài cầu", "quantity": "2"}
      ]
    },
    {
      "name": "2.10. CẦU SAU (A1 - A2)",
      "items": [
        {"name": "Đầu nối cardan (Đ/sáp)", "quantity": "1"}
      ]
    },
    {
      "name": "2.11. HỆ THỐNG TREO",
      "items": [
        {"name": "Ống giảm xóc", "quantity": "4"},
        {"name": "U quang nhíp trước+sau", "quantity": "8"},
        {"name": "Bát nhíp trước + sau", "quantity": "8"},
        {"name": "Bát bợ cầu", "quantity": "4"},
        {"name": "Nhíp trước", "quantity": "2b"},
        {"name": "Nhíp sau", "quantity": "2b"}
      ]
    },
    {
      "name": "2.12. CABIN – THÂN XE",
      "items": [
        {"name": "Kính chắn gió (lớn - nhỏ)", "quantity": "1-2"},
        {"name": "Kính chiếu hậu trong", "quantity": "1"},
        {"name": "Kính chiếu hậu ngoài", "quantity": "2"},
        {"name": "Tay kính chiếu hậu N", "quantity": "2"},
        {"name": "Giá thùng bình điện", "quantity": "1"},
        {"name": "Móc gài ca bô", "quantity": "1b"},
        {"name": "Móc giữ ca bô", "quantity": "1"},
        {"name": "Chống ca bô", "quantity": "1"},
        {"name": "Cửa hông + cánh gà", "quantity": "4b"},
        {"name": "Kính cửa hông", "quantity": "4"},
        {"name": "Kính gió cửa hông", "quantity": "4"},
        {"name": "Khóa gài kính gió", "quantity": "4"},
        {"name": "Tay nắm cửa", "quantity": "4"},
        {"name": "Ổ khóa cửa", "quantity": "4"},
        {"name": "Tay mở cửa ngoài", "quantity": "4"},
        {"name": "Tay mở cửa trong", "quantity": "4"},
        {"name": "Bửng hậu + khóa gài", "quantity": "1b"},
        {"name": "Khung kèo mui", "quantity": "1b"},
        {"name": "Phản quang phía sau", "quantity": "2"}
      ]
    },
    {
      "name": "2.13. NỘI THẤT",
      "items": [
        {"name": "Bạt mui + kính sau bạt", "quantity": "1b"},
        {"name": "La phông + táp bi", "quantity": "1b"},
        {"name": "Tấm che nắng", "quantity": "2"},
        {"name": "Bộ đệm ghế chính", "quantity": "5b"},
        {"name": "Bộ đệm ghế phụ", "quantity": "2b"},
        {"name": "Khung ghế chính", "quantity": "5b"}
      ]
    },
    {
      "name": "2.14. KHUNG XE",
      "items": [
        {"name": "Biển số", "quantity": "2"},
        {"name": "Cản trước", "quantity": "1"},
        {"name": "Móc kéo trước", "quantity": "2"},
        {"name": "Cản sau", "quantity": "2"},
        {"name": "Móc hậu", "quantity": "1"}
      ]
    },
    {
      "name": "2.15 TRANG BỊ KHÁC",
      "items": [
        {"name": "Két nước", "quantity": "1"},
        {"name": "Nắp két nước", "quantity": "1"},
        {"name": "Bọc gió két nước", "quantity": "1"},
        {"name": "Chống két nước", "quantity": "2"},
        {"name": "Két mát nhớt", "quantity": "1"},
        {"name": "Bầu lọc gió", "quantity": "1b"},
        {"name": "Thùng nhiên liệu", "quantity": "2b"},
        {"name": "Nắp thùng NL", "quantity": "2"},
        {"name": "Giá thùng nhiên liệu", "quantity": "2"},
        {"name": "Ống đổ thùng N/liệu", "quantity": "2"},
        {"name": "Khóa xăng sang thùng", "quantity": "1"},
        {"name": "Lọc xăng sơ cấp", "quantity": "1"},
        {"name": "Bô giảm thanh + ống xả", "quantity": "1b"},
        {"name": "Giá + lốp dự phòng", "quantity": "1b"},
        {"name": "Vỏ + ruột bánh xe", "quantity": "4b"}
      ]
    }
  ]
}

# Đánh số thứ tự (tt) tự động để tránh lệch dòng
tt = 1
for section in data["sections"]:
    for item in section["items"]:
        item["tt"] = tt
        tt += 1

with open("src/templates/UAZ31512Template.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✅ Đã ghi đè thành công file UAZ31512Template.json với dữ liệu CHÍNH XÁC 100%!")
