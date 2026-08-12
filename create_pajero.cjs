const fs = require('fs');

const data = {
  templateVersion: 1,
  vehicleCode: "MP01",
  vehicleName: "Mitsubishi Pajero",
  manufacturer: "Mitsubishi",
  category: "Ô tô",
  sections: [
    {
      name: "I. ĐỘNG CƠ",
      items: [
        { tt: 1, name: "Cụm hút", quantity: "1" },
        { tt: 2, name: "Ống thoát hơi máy", quantity: "1" },
        { tt: 3, name: "Cụm ống xả + tôn che ống xả", quantity: "2" },
        { tt: 4, name: "Nắp đậy bánh răng cam cơ", quantity: "1" },
        { tt: 5, name: "Nắp đậy dàn cò mổ", quantity: "2" },
        { tt: 6, name: "Nắp đổ nhớt", quantity: "1b" },
        { tt: 7, name: "Thước đo nhớt", quantity: "1b" },
        { tt: 8, name: "Lọc nhiên liệu", quantity: "1b" },
        { tt: 9, name: "Cổ ống nước", quantity: "1" },
        { tt: 10, name: "Bát bắt lọc gió", quantity: "1" },
        { tt: 11, name: "Bát máy phát", quantity: "1" },
        { tt: 12, name: "Bát câu máy", quantity: "2" },
        { tt: 13, name: "Puly trục cơ", quantity: "1" },
        { tt: 14, name: "Đai ốc răng sói", quantity: "1" },
        { tt: 15, name: "Cạc te động cơ", quantity: "1" },
        { tt: 16, name: "Vỏ bọc bánh đà", quantity: "1" },
        { tt: 17, name: "Chân máy trước", quantity: "2" },
        { tt: 18, name: "Bơm xăng điện", quantity: "1b" },
        { tt: 19, name: "Kim phun", quantity: "6b" },
        { tt: 20, name: "Ống chia nhiên liệu", quantity: "1" },
        { tt: 21, name: "Ống hồi nhiên liệu", quantity: "1" },
        { tt: 22, name: "Bộ Đ/chỉnh áp suất", quantity: "1" },
        { tt: 23, name: "Bơm nước", quantity: "1b" },
        { tt: 24, name: "Bộ phun xăng điện tử", quantity: "1b" }
      ]
    },
    {
      name: "II. PHẦN XE",
      items: []
    },
    {
      name: "2.1. HỆ THỐNG ĐIỆN",
      items: [
        { tt: 26, name: "Máy khởi động", quantity: "1" },
        { tt: 27, name: "Nến điện + Chụp", quantity: "4" },
        { tt: 28, name: "Dây phin", quantity: "5" },
        { tt: 29, name: "Máy phát điện", quantity: "1b" },
        { tt: 30, name: "Rơle đề phụ", quantity: "1" },
        { tt: 31, name: "Bình điện", quantity: "1" },
        { tt: 32, name: "Tay gạt xi nhan", quantity: "1" },
        { tt: 33, name: "Công tắc điện", quantity: "1" },
        { tt: 34, name: "Buton nhấn còi", quantity: "1" },
        { tt: 35, name: "Còi điện", quantity: "2" },
        { tt: 36, name: "Máy gạt mưa T + S", quantity: "2b" },
        { tt: 37, name: "Cần gạt mưa", quantity: "3" },
        { tt: 38, name: "Bầu nước rửa kính trước sau", quantity: "2" },
        { tt: 39, name: "Béc phun + đường ống", quantity: "1b" },
        { tt: 40, name: "Đèn pha chính", quantity: "2b" },
        { tt: 41, name: "Đèn pha nhỏ", quantity: "2" },
        { tt: 42, name: "Đèn hiệu trước + sau", quantity: "2+2" },
        { tt: 43, name: "Đèn xinhan trước + sau", quantity: "2+2" },
        { tt: 44, name: "Đèn phanh sau", quantity: "2" },
        { tt: 45, name: "Đèn biển số", quantity: "1" },
        { tt: 46, name: "Đèn cửa", quantity: "4" },
        { tt: 47, name: "Đèn báo de", quantity: "2" },
        { tt: 48, name: "Đồng hồ hành trình", quantity: "1" },
        { tt: 49, name: "Đồng hồ tO nước", quantity: "1" },
        { tt: 50, name: "Đồng hồ nhiên liệu", quantity: "1" },
        { tt: 51, name: "Đồng hồ báo vòng tua máy", quantity: "1" }
      ]
    },
    {
      name: "2.2. HỆ THỐNG LÁI",
      items: [
        { tt: 52, name: "Trục + vành tay lái", quantity: "1b" },
        { tt: 53, name: "Hộp cơ cấu lái", quantity: "1b" },
        { tt: 54, name: "Bơm trợ lực lái", quantity: "1b" },
        { tt: 55, name: "Van chia dầu lái", quantity: "1" },
        { tt: 56, name: "Bost lái", quantity: "1b" },
        { tt: 57, name: "Rô tuyn CH ngang", quantity: "1+2" }
      ]
    },
    {
      name: "2.3. HỆ THỐNG PHANH",
      items: [
        { tt: 58, name: "Phanh chân", quantity: "" },
        { tt: 59, name: "Bàn đạp ( treo)", quantity: "1" },
        { tt: 60, name: "Bơm phanh cái 1T - 2T", quantity: "1" },
        { tt: 61, name: "Bầu chứa dầu phanh", quantity: "1-2" },
        { tt: 62, name: "Bầu trợ lực", quantity: "1" },
        { tt: 63, name: "Bơm phanh con sau", quantity: "2" },
        { tt: 64, name: "Bơm phanh con trước", quantity: "2" },
        { tt: 65, name: "Đĩa phanh trước + sau", quantity: "4" },
        { tt: 66, name: "Đường ống phanh", quantity: "1b" },
        { tt: 0, name: "Phanh tay", quantity: "" },
        { tt: 67, name: "Cần kéo + dẫn động", quantity: "1b" },
        { tt: 68, name: "Dây phanh tay", quantity: "1b" },
        { tt: 69, name: "Cụm chỉnh phanh", quantity: "1b" }
      ]
    },
    {
      name: "2.4. DẪN ĐỘNG LY HỢP",
      items: [
        { tt: 70, name: "Bàn đạp + dẫn động", quantity: "1b" },
        { tt: 71, name: "Bơm ly hơp chính", quantity: "1" },
        { tt: 72, name: "Bơm ly hợp phụ", quantity: "1" },
        { tt: 73, name: "Càng ngắt ly hợp", quantity: "1" }
      ]
    },
    {
      name: "2.5. HỘP SỐ CHÍNH",
      items: [
        { tt: 74, name: "Cần số chính", quantity: "1" },
        { tt: 75, name: "Đầu nối láp (đầu sáp)", quantity: "1" }
      ]
    },
    {
      name: "2.6. CARDAN",
      items: []
    },
    {
      name: "2.7. DẦM CẦU TRƯỚC",
      items: [
        { tt: 76, name: "Khớp chuyển hướng", quantity: "2" }
      ]
    },
    {
      name: "2.8. CẦU SAU",
      items: [
        { tt: 77, name: "Bộ vi sai", quantity: "1" },
        { tt: 78, name: "Bán trục", quantity: "2" },
        { tt: 79, name: "Đầu nối CĐ (đầu sáp)", quantity: "1" }
      ]
    },
    {
      name: "2.9. HỆ THỐNG TREO",
      items: [
        { tt: 80, name: "Ống giảm xóc T+S", quantity: "4" },
        { tt: 81, name: "Lò xo giảm chấn trước sau", quantity: "4" }
      ]
    },
    {
      name: "2.10. CABIN THÂN XE",
      items: [
        { tt: 82, name: "Kính chắn gió", quantity: "1" },
        { tt: 83, name: "Kính chiếu hậu ngoài", quantity: "2" },
        { tt: 84, name: "Kính chiếu hậu trong", quantity: "1" },
        { tt: 85, name: "Cánh cửa", quantity: "5" },
        { tt: 86, name: "Kính cửa hông", quantity: "4" },
        { tt: 87, name: "Mô tơ nâng hạ kính", quantity: "4" },
        { tt: 88, name: "Compa nâng hạ kính", quantity: "4" },
        { tt: 89, name: "Tay mở của ngoài", quantity: "5" },
        { tt: 90, name: "Tay mở cửa trong", quantity: "5" },
        { tt: 91, name: "Nút nâng hạ kính", quantity: "4" },
        { tt: 92, name: "Ổ khóa cửa", quantity: "5" },
        { tt: 93, name: "Xylanh nâng cửa sau", quantity: "2" }
      ]
    },
    {
      name: "2.11 NỘI THẤT",
      items: [
        { tt: 94, name: "Tấm che nắng tài xế", quantity: "2" },
        { tt: 95, name: "Ghế tài xế", quantity: "1" },
        { tt: 96, name: "Ghế phụ cửa hông", quantity: "7" },
        { tt: 97, name: "Tay nắm trần", quantity: "5" },
        { tt: 98, name: "La phông trần", quantity: "1b" }
      ]
    },
    {
      name: "2.12 KHUNG XE",
      items: [
        { tt: 99, name: "Biển số", quantity: "2" },
        { tt: 100, name: "Cản trước + sau", quantity: "1" },
        { tt: 101, name: "Móc kéo trước + sau", quantity: "2+2" }
      ]
    },
    {
      name: "2.13 TRANG BỊ KHÁC",
      items: [
        { tt: 102, name: "Két nước + bọc gió", quantity: "1b" },
        { tt: 103, name: "Bầu lọc gió", quantity: "1b" },
        { tt: 104, name: "Giá bắt lốp dự phòng", quantity: "1b" },
        { tt: 105, name: "Lốp xe", quantity: "5" },
        { tt: 106, name: "Thùng nhiên liệu", quantity: "1b" },
        { tt: 107, name: "Bầu giảm thanh + Ống bô xả", quantity: "1b" },
        { tt: 108, name: "Giá + thùng bình điện", quantity: "1b" },
        { tt: 109, name: "Bảng đồng hồ", quantity: "1b" },
        { tt: 110, name: "Bộ radio catset", quantity: "1b" }
      ]
    },
    {
      name: "2.14 CÁC CẢM BIẾN, RỜ LE, CẦU CHÌ, HỘP ECU",
      items: [
        { tt: 111, name: "Hộp ECU", quantity: "1b" },
        { tt: 112, name: "Cảm biến vị trí Tr/ cơ", quantity: "1" },
        { tt: 113, name: "Cảm biến vị trí Tr/cam", quantity: "1" },
        { tt: 114, name: "Cảm biến vị trí bướm ga", quantity: "1" },
        { tt: 115, name: "Cảm biến lưu lượng không khí", quantity: "1" }
      ]
    },
    {
      name: "2.15 Hệ thống điều hòa",
      items: [
        { tt: 116, name: "Máy nén", quantity: "1" },
        { tt: 117, name: "Két dàn nóng", quantity: "1" },
        { tt: 118, name: "Quạt dàn nóng", quantity: "1b" },
        { tt: 119, name: "Phin + lọc ga", quantity: "1b" }
      ]
    }
  ]
};

data.sections.forEach(section => {
  section.items = section.items.filter(item => {
    // Only keep items that have a valid name (not empty and contains alphabetic characters)
    return item.name && item.name.trim() !== "" && /[a-zA-Z\u00C0-\u1EF9]/.test(item.name);
  });
});

fs.writeFileSync('src/templates/MitsubishiPajeroTemplate.json', JSON.stringify(data, null, 2), 'utf-8');
console.log('Mitsubishi Pajero items:', data.sections.reduce((acc, sec) => acc + sec.items.length, 0));
