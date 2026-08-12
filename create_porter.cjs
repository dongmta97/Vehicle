const fs = require('fs');

const data = {
  templateVersion: 1,
  vehicleCode: "HP01",
  vehicleName: "Hyundai Porter",
  manufacturer: "Hyundai",
  category: "Ô tô",
  sections: [
    {
      name: "I. ĐỘNG CƠ",
      items: [
        { tt: 1, name: "Cánh quạt", quantity: "1" },
        { tt: 2, name: "Cổ ống nước", quantity: "1" },
        { tt: 3, name: "Puly bơm nước", quantity: "1" },
        { tt: 4, name: "Puly trục cơ", quantity: "1" },
        { tt: 5, name: "Cụm ống xả", quantity: "2" },
        { tt: 6, name: "Bầu đổ nhớt + nắp", quantity: "1b" },
        { tt: 7, name: "Thước đo nhớt", quantity: "1" },
        { tt: 8, name: "Vỏ bọc bánh đà", quantity: "1" },
        { tt: 9, name: "Các te động cơ", quantity: "1" },
        { tt: 10, name: "Bầu lọc gió", quantity: "1b" },
        { tt: 11, name: "Ống dẫn khí nạp", quantity: "2" },
        { tt: 12, name: "Lọc dầu thô", quantity: "1" },
        { tt: 13, name: "Lọc dầu tinh", quantity: "1" },
        { tt: 14, name: "Kim phun", quantity: "4" },
        { tt: 15, name: "Đường ống dầu BCA", quantity: "1b" },
        { tt: 16, name: "Đường ống cao áp", quantity: "1b" },
        { tt: 17, name: "Đường ống thấp áp", quantity: "1b" },
        { tt: 18, name: "Bơm cao áp", quantity: "1b" },
        { tt: 19, name: "Bơm thấp áp", quantity: "1b" },
        { tt: 20, name: "Bơm nước", quantity: "1b" },
        { tt: 21, name: "Bơm nhớt", quantity: "1b" },
        { tt: 22, name: "Bơm hơi", quantity: "1b" },
        { tt: 23, name: "- Van điều chỉnh áp suất", quantity: "1" },
        { tt: 24, name: "- Bầu dầu trợ lực lái", quantity: "1" },
        { tt: 25, name: "Bộ ly hợp", quantity: "1b" },
        { tt: 26, name: "Nắp máy", quantity: "1b" },
        { tt: 27, name: "Thân máy", quantity: "1b" },
        { tt: 28, name: "Khung giá lắp ĐC", quantity: "1b" }
      ]
    },
    {
      name: "II. PHẦN XE",
      items: []
    },
    {
      name: "1.1. HỆ THỐNG ĐIỆN",
      items: [
        { tt: 29, name: "Máy khởi động", quantity: "1" },
        { tt: 30, name: "Máy phát điện……..", quantity: "1" },
        { tt: 31, name: "Tiết chế……..", quantity: "1" },
        { tt: 32, name: "Bình điện", quantity: "1" },
        { tt: 33, name: "Tay gạt xi nhan", quantity: "1" },
        { tt: 34, name: "Công tắc điện", quantity: "1" },
        { tt: 35, name: "Công tắc cúp bình", quantity: "1" },
        { tt: 36, name: "Buton nhấn còi", quantity: "1" },
        { tt: 37, name: "Còi điện", quantity: "1" },
        { tt: 38, name: "Máy gạt mưa", quantity: "1b" },
        { tt: 39, name: "Cần + chổi gạt mưa", quantity: "2" },
        { tt: 40, name: "Bình nước rửa kính + Môtơ", quantity: "1b" },
        { tt: 41, name: "Vòi phun rửa kính +ống", quantity: "2" },
        { tt: 42, name: "Đèn pha", quantity: "2" },
        { tt: 43, name: "Đèn hiệu trước", quantity: "2" },
        { tt: 44, name: "Đèn hiệu sau", quantity: "2" },
        { tt: 45, name: "Đèn trần", quantity: "1" },
        { tt: 46, name: "Đèn biển số", quantity: "1" },
        { tt: 48, name: "Đèn de", quantity: "1" },
        { tt: 49, name: "Đồng hồ điện", quantity: "1" },
        { tt: 50, name: "Đồng hồ áp suất nhớt", quantity: "1" },
        { tt: 51, name: "Đồng hồ nhiệt độ nước", quantity: "1" },
        { tt: 52, name: "Đồng hồ nhiên liệu", quantity: "1" },
        { tt: 53, name: "Đồng hồ tốc độ xe", quantity: "1" },
        { tt: 54, name: "Đồng hồ tua máy", quantity: "1" }
      ]
    },
    {
      name: "1.2 HỆ THỐNG LÁI",
      items: [
        { tt: 55, name: "Trục + vành tay lái", quantity: "1b" },
        { tt: 56, name: "Ống tay lái", quantity: "1" },
        { tt: 57, name: "Khớp nối trục tay lái", quantity: "3" },
        { tt: 58, name: "Đòn quay đứng", quantity: "1" },
        { tt: 59, name: "Thanh CH ngắn", quantity: "2" },
        { tt: 60, name: "Rô tuyn CH", quantity: "2" },
        { tt: 61, name: "Hộp cơ cấu lái", quantity: "1b" },
        { tt: 62, name: "Bơm trợ lực lái", quantity: "1b" },
        { tt: 63, name: "Bốt lái", quantity: "1b" }
      ]
    },
    {
      name: "1.3 HỆ THỐNG PHANH",
      items: [
        { tt: 65, name: "Bàn đạp", quantity: "1" },
        { tt: 66, name: "Bơm phanh cái", quantity: "1" },
        { tt: 67, name: "Bầu chứa dầu phanh", quantity: "1" },
        { tt: 68, name: "Bầu trợ lực", quantity: "1" },
        { tt: 69, name: "Bơm phanh con sau", quantity: "" },
        { tt: 70, name: "Bơm phanh con trước", quantity: "" },
        { tt: 71, name: "Tang (đĩa) phanh trước", quantity: "" },
        { tt: 72, name: "Tang trống phanh sau", quantity: "" },
        { tt: 73, name: "Đường ống + rắc co", quantity: "1b" },
        { tt: 74, name: "Cần kéo + dẫn động", quantity: "1b" },
        { tt: 75, name: "Dây kéo phanh", quantity: "1b" }
      ]
    },
    {
      name: "1.4 DẪN ĐỘNG LY HỢP",
      items: [
        { tt: 76, name: "Bàn đạp + dây", quantity: "1" },
        { tt: 77, name: "Ổ trượt", quantity: "1" },
        { tt: 78, name: "Càng ngắt", quantity: "1" },
        { tt: 79, name: "Bơm chính + bơm con", quantity: "1" }
      ]
    },
    {
      name: "1.5 HỘP SỐ",
      items: [
        { tt: 80, name: "Cần số chính", quantity: "1" }
      ]
    },
    {
      name: "1.6. CARDAN",
      items: [
        { tt: 81, name: "Đầu then trong ngoài", quantity: "1+1" },
        { tt: 82, name: "Chữ thập đồng bộ", quantity: "2" },
        { tt: 83, name: "Mặt bích nối cardan", quantity: "2" }
      ]
    },
    {
      name: "1.7. DẦM TRƯỚC",
      items: [
        { tt: 84, name: "Cốt đùm (đầu đót)", quantity: "2" },
        { tt: 85, name: "Chụp đầu cốt đùm", quantity: "2" },
        { tt: 86, name: "Ắc trục đứng + bạc", quantity: "2b" },
        { tt: 87, name: "Mâm bánh xe", quantity: "2" }
      ]
    },
    {
      name: "1.8. CẦU SAU",
      items: [
        { tt: 92, name: "Đầu nối cardan", quantity: "1" }
      ]
    },
    {
      name: "1.9. HỆ THỐNG TREO",
      items: [
        { tt: 93, name: "-Ống giảm xóc sau", quantity: "" },
        { tt: 94, name: "-Bộ nhíp trước lá", quantity: "2b" },
        { tt: 95, name: "-Bộ nhíp sau lá", quantity: "2b" },
        { tt: 96, name: "-Bộ nhíp phụ sau lá", quantity: "2b" },
        { tt: 97, name: "-U quang nhíp", quantity: "8" },
        { tt: 98, name: "-Bát bợ cầu", quantity: "2" }
      ]
    },
    {
      name: "2.1. THÙNG XE",
      items: [
        { tt: 99, name: "Thành đầu", quantity: "1" },
        { tt: 100, name: "Thành hông", quantity: "2" },
        { tt: 101, name: "Cánh cửa sau", quantity: "2" },
        { tt: 102, name: "Khóa cánh cửa", quantity: "2" }
      ]
    },
    {
      name: "2.2. CABIN – THÂN XE",
      items: [
        { tt: 105, name: "Kính chắn gió", quantity: "1" },
        { tt: 106, name: "Kính sau cabin", quantity: "1" },
        { tt: 107, name: "Kính chiếu hậu trong", quantity: "1" },
        { tt: 108, name: "Kính chiếu hậu ngoài", quantity: "2" },
        { tt: 109, name: "Tay kính chiếuhậu N", quantity: "2" },
        { tt: 110, name: "Tay nắm cửa hông", quantity: "2" },
        { tt: 111, name: "Tấm che cửa hông", quantity: "2" },
        { tt: 112, name: "Kính hông", quantity: "2" },
        { tt: 113, name: "Cơ cấu quay kính", quantity: "2" },
        { tt: 114, name: "Tay quay kính", quantity: "2" },
        { tt: 115, name: "Ổ khóa cửa", quantity: "2" },
        { tt: 116, name: "Tay mở cửa ngoài", quantity: "2" },
        { tt: 117, name: "Tay mở cửa trong", quantity: "2" },
        { tt: 118, name: "Ổ khóa chìa cabin", quantity: "2" }
      ]
    },
    {
      name: "2.3. NỘI THẤT",
      items: [
        { tt: 119, name: "La phông + táp bi", quantity: "2b" },
        { tt: 120, name: "Bọc ca bô", quantity: "1" },
        { tt: 121, name: "Tấm che nắng", quantity: "2" },
        { tt: 122, name: "Bộ đệm ghế", quantity: "2b" },
        { tt: 123, name: "Khung ghế", quantity: "2b" },
        { tt: 124, name: "Dây đai an toàn", quantity: "2b" }
      ]
    },
    {
      name: "2.4. KHUNG XE",
      items: [
        { tt: 125, name: "Biển số", quantity: "2" },
        { tt: 126, name: "Cản trước", quantity: "1" },
        { tt: 127, name: "Móc kéo trước", quantity: "2" },
        { tt: 128, name: "Móc hậu", quantity: "1" }
      ]
    },
    {
      name: "2.5 TRANG BỊ KHÁC",
      items: [
        { tt: 129, name: "Két nước", quantity: "1" },
        { tt: 130, name: "Nắp két nước", quantity: "1" },
        { tt: 131, name: "Bình nước phụ", quantity: "1" },
        { tt: 132, name: "Bọc gió két nước", quantity: "1" },
        { tt: 133, name: "Chống két nước", quantity: "2" },
        { tt: 134, name: "Cao su bô e", quantity: "2" },
        { tt: 135, name: "Bầu lọc gió", quantity: "1b" },
        { tt: 136, name: "Thùng nhiên liệu", quantity: "1b" },
        { tt: 137, name: "Nắp thùng NL", quantity: "1" },
        { tt: 138, name: "Giá thùng nhiên liệu", quantity: "1" },
        { tt: 139, name: "Lọc xăng sơ cấp", quantity: "1" },
        { tt: 140, name: "Bô giảm thanh", quantity: "1" },
        { tt: 141, name: "Ống bô xả", quantity: "1b" },
        { tt: 142, name: "Giá lốp dự phòng", quantity: "1b" },
        { tt: 143, name: "Vỏ ruột dự phòng", quantity: "1b" },
        { tt: 144, name: "Vỏ ruột bánh xe", quantity: "4b" },
        { tt: 145, name: "Đài radio", quantity: "1" },
        { tt: 146, name: "Ăngten", quantity: "1b" }
      ]
    },
    {
      name: "Hệ thống điều hòa",
      items: [
        { tt: 147, name: "Máy nén", quantity: "1" },
        { tt: 148, name: "Két dàn nóng", quantity: "1" },
        { tt: 149, name: "-Quạt dàn nóng", quantity: "1" },
        { tt: 150, name: "Phin + lọc ga", quantity: "1b" }
      ]
    }
  ]
};

data.sections.forEach(section => {
  section.items = section.items.filter(item => item.name && item.name.trim() !== "");
});

fs.writeFileSync('src/templates/HyundaiPorterTemplate.json', JSON.stringify(data, null, 2), 'utf-8');
console.log('Hyundai Porter items:', data.sections.reduce((acc, sec) => acc + sec.items.length, 0));
