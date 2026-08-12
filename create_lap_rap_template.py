import json
import os

items = [
    ("I. LẮP RÁP", [
        ("1", "Khe hở bánh răng cam cơ", "≤ 0,2"),
        ("2", "Khe hở dọc trục cam", "0,1 ÷ 0,2"),
        ("3", "Độ đảo mặt bánh đà bán kính 140 mm", "≤ 0,15"),
        ("4", "Lực siết ổ trục khuỷu N.m (Kg.m), (lb.ft)", "122,5 ÷ 133,3\n(12,5 ÷ 13,6)\n(91 ÷ 98,5)"),
        ("5", "Lực siết bulong biên N.m (Kg.m), (lb.ft)", "66,6 ÷ 73,5\n(6,8 ÷ 7,5)\n(49 ÷ 54,3)"),
        ("6", "Lực siết đai ốc nắp máy N.m (Kg.m), (lb.ft)", "71,5 ÷ 76,4\n(7,3 ÷ 7,8)\n(52,8 ÷ 56,4)"),
        ("7", "Lực xiết bulông bánh đà N.m (Kg.m), (lb.ft)", "73,5 ÷ 78,4\n(7,5 ÷ 8)\n(54,3 ÷ 57,9)"),
        ("8", "Thử độ kín xylanh lắp vào động cơ với áp suất 4kgf/cm2", "Không rò nước xuống catte")
    ]),
    ("II. CHẠY RÀ", [
        ("1", "Rà nguội không áp", "TCN"),
        ("2", "Chạy rà nóng không tải", "TCCS"),
        ("3", "Chạy rà nóng có tải", "TCCS")
    ]),
    ("III. THỬ LỰC", [
        ("1", "Tốc độ vòng quay trục cơ:", ""),
        ("2", "Số vòng quay không tải nhỏ nhất, r/min", "700 ÷ 750"),
        ("3", "Số vòng quay lớn nhất, r/min", "4000"),
        ("4", "Công suất khi n = 4000 r/min, kW (HP)", "47 (64)"),
        ("5", "Chênh lệch áp suất buồng đốt cuối kỳ nén giữa các xy lanh, KPa (Kgf/cm2), không lớn hơn", "98,1 (1,0)")
    ]),
    ("IV. HỆ BÔI TRƠN", [
        ("1", "Áp suất dầu KPa (Kgf/cm2)", ""),
        ("2", "Áp suất dầu bôi trơn ở số vòng quay nhỏ nhất , KPa (Kgf/cm2), không nhỏ hơn", "49 (0,5)"),
        ("3", "Áp suất dầu bôi trơn lớn nhất,KPa (Kgf/cm2), không lớn hơn", "392 (4,0)"),
        ("4", "Không cho phép rò rỉ dầu, nước, tiếng kêu gõ bất thường.", "")
    ])
]

output = {
    "templateVersion": 1,
    "vehicleCode": "LAP-RAP-DONG-CO",
    "vehicleName": "Lắp ráp, hiệu chỉnh, chạy rà cụm động cơ",
    "protocolType": "LAP_RAP",
    "sections": []
}

total_items = 0
for sec_name, sec_items in items:
    section = {"name": sec_name, "items": []}
    for stt, item_name, yeucau in sec_items:
        section["items"].append({
            "tt": stt,
            "name": item_name,
            "yeuCau": yeucau.replace("\n", " ")
        })
        total_items += 1
    output["sections"].append(section)

print(f"Total items extracted: {total_items}")

file_path = "src/templates/LapRapDongCoTemplate.json"
with open(file_path, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)
print(f"Created {file_path}")

