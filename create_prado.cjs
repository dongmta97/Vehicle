const fs = require('fs');

const data = {
  templateVersion: 1,
  vehicleCode: "TP01",
  vehicleName: "Toyota Prado",
  manufacturer: "Toyota",
  category: "Ô tô",
  sections: [
    {
      name: "I. ĐỘNG CƠ 5S-FE",
      items: [
        { tt: 1, name: "Cụm hút mu rùa", quantity: "1" },
        { tt: 2, name: "Ống thoát hơi máy", quantity: "1" },
        { tt: 3, name: "Cụm ống xả + tôn che ống xả", quantity: "1" },
        { tt: 4, name: "Nắp đậy bánh răng cam cơ", quantity: "1" },
        { tt: 5, name: "Nắp đậy dàn cò mổ", quantity: "1" },
        { tt: 6, name: "Nắp đổ nhớt", quantity: "1b" },
        { tt: 7, name: "Thước đo nhớt", quantity: "1b" },
        { tt: 8, name: "Lọc xăng tinh + bát", quantity: "1b" },
        { tt: 9, name: "Cổ ống nước", quantity: "1" },
        { tt: 10, name: "Bát bắt lọc gió", quantity: "1" },
        { tt: 11, name: "Bát máy phát", quantity: "1" },
        { tt: 12, name: "Bát câu máy", quantity: "2" },
        { tt: 13, name: "Puly trục cơ", quantity: "1" },
        { tt: 14, name: "Đai ốc răng sói", quantity: "1" },
        { tt: 15, name: "Tôn che khởi động", quantity: "1" },
        { tt: 16, name: "Cạc te động cơ", quantity: "1" },
        { tt: 17, name: "Vỏ bọc bánh đà", quantity: "1" },
        { tt: 18, name: "Chân máy trước", quantity: "2" },
        { tt: 19, name: "Bơm xăng điện", quantity: "1b" },
        { tt: 20, name: "Kim phun", quantity: "4b" },
        { tt: 21, name: "Ống chia nhiên liệu", quantity: "1" },
        { tt: 22, name: "Ống hồi nhiên liệu", quantity: "1" },
        { tt: 23, name: "Bộ Đ/chỉnh áp suất", quantity: "1" },
        { tt: 24, name: "Bơm nước", quantity: "1b" },
        { tt: 25, name: "Bộ phun xăng điện tử", quantity: "1b" }
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
        { tt: 27, name: "Nến điện + Chụp", quantity: "8" },
        { tt: 28, name: "Dây phin", quantity: "9" },
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
        { tt: 49, name: "AS nhớt + tO nước", quantity: "2" },
        { tt: 50, name: "Đồng hồ nhiên liệu + ĐH điện", quantity: "2" },
        { tt: 51, name: "Đồng hồ báo vòng tua máy", quantity: "1" }
      ]
    },
    {
      name: "2.2. HỆ THỐNG LÁI",
      items: [
        { tt: 45, name: "Trục + vành tay lái", quantity: "1b" },
        { tt: 46, name: "Hộp cơ cấu lái", quantity: "1b" },
        { tt: 47, name: "Bơm trợ lực lái", quantity: "1b" },
        { tt: 48, name: "Van chia dầu lái", quantity: "1" },
        { tt: 49, name: "Bost lái", quantity: "1b" },
        { tt: 50, name: "Rô tuyn CH ngang", quantity: "1+2" }
      ]
    },
    {
      name: "2.3. HỆ THỐNG PHANH",
      items: [
        { tt: 0, name: "Phanh chân", quantity: "" },
        { tt: 52, name: "Bàn đạp ( treo)", quantity: "1" },
        { tt: 53, name: "Bơm phanh cái 1T - 2T", quantity: "1" },
        { tt: 54, name: "Bầu chứa dầu phanh", quantity: "1-2" },
        { tt: 55, name: "Bầu trợ lực", quantity: "1" },
        { tt: 56, name: "Bơm phanh con sau", quantity: "2" },
        { tt: 57, name: "Bơm phanh con trước", quantity: "2" },
        { tt: 58, name: "Đĩa phanh trước + sau", quantity: "4" },
        { tt: 59, name: "Đường ống phanh", quantity: "1b" },
        { tt: 0, name: "Phanh tay", quantity: "" },
        { tt: 60, name: "Cần kéo + dẫn động", quantity: "1b" },
        { tt: 61, name: "Dây phanh tay", quantity: "1b" },
        { tt: 62, name: "Cụm chỉnh phanh", quantity: "1b" }
      ]
    },
    {
      name: "2.4. DẪN ĐỘNG LY HỢP",
      items: [
        { tt: 63, name: "Bàn đạp + dẫn động", quantity: "1b" },
        { tt: 64, name: "Bơm ly hơp chính", quantity: "1" },
        { tt: 65, name: "Bơm ly hợp phụ", quantity: "1" },
        { tt: 66, name: "Càng ngắt ly hợp", quantity: "1" }
      ]
    },
    {
      name: "2.5. HỘP SỐ CHÍNH",
      items: [
        { tt: 67, name: "Cần số chính", quantity: "1" },
        { tt: 68, name: "Đầu nối láp (đầu sáp)", quantity: "1" }
      ]
    },
    {
      name: "2.6. CARDAN",
      items: []
    },
    {
      name: "2.7. DẦM CẦU TRƯỚC",
      items: [
        { tt: 70, name: "Khớp chuyển hướng", quantity: "2" }
      ]
    },
    {
      name: "2.8. CẦU SAU",
      items: [
        { tt: 71, name: "Bộ vi sai", quantity: "1" },
        { tt: 72, name: "Bán trục", quantity: "2" },
        { tt: 73, name: "Đầu nối CĐ (đầu sáp)", quantity: "1" }
      ]
    },
    {
      name: "2.9. HỆ THỐNG TREO",
      items: [
        { tt: 74, name: "Ống giảm xóc T+S", quantity: "4" },
        { tt: 75, name: "Lò xo giảm chấn trước sau", quantity: "4" }
      ]
    },
    {
      name: "2.10. CABIN THÂN XE",
      items: [
        { tt: 76, name: "Kính chắn gió", quantity: "1" },
        { tt: 77, name: "Kính chiếu hậu ngoài", quantity: "2" },
        { tt: 78, name: "Kính chiếu hậu trong", quantity: "1" },
        { tt: 79, name: "Cánh cửa", quantity: "5" },
        { tt: 80, name: "Kính cửa hông", quantity: "4" },
        { tt: 81, name: "Mô tơ nâng hạ kính", quantity: "4" },
        { tt: 82, name: "Compa nâng hạ kính", quantity: "4" },
        { tt: 83, name: "Tay mở của ngoài", quantity: "5" },
        { tt: 84, name: "Tay mở cửa trong", quantity: "5" },
        { tt: 85, name: "Nút nâng hạ kính", quantity: "4" },
        { tt: 86, name: "Ổ khóa cửa", quantity: "5" },
        { tt: 87, name: "Xylanh nâng cửa sau", quantity: "2" }
      ]
    },
    {
      name: "2.11 NỘI THẤT",
      items: [
        { tt: 88, name: "Tấm che nắng tài xế", quantity: "2" },
        { tt: 89, name: "Ghế tài xế", quantity: "1" },
        { tt: 90, name: "Ghế phụ cửa hông", quantity: "7" },
        { tt: 91, name: "Tay nắm trần", quantity: "5" },
        { tt: 92, name: "La phông trần", quantity: "1b" }
      ]
    },
    {
      name: "2.12 KHUNG XE",
      items: [
        { tt: 93, name: "Biển số", quantity: "2" },
        { tt: 94, name: "Cản trước + sau", quantity: "1" },
        { tt: 95, name: "Móc kéo trước + sau", quantity: "2+2" }
      ]
    },
    {
      name: "2.13 TRANG BỊ KHÁC",
      items: [
        { tt: 96, name: "Két nước + bọc gió", quantity: "1b" },
        { tt: 97, name: "Bầu lọc gió", quantity: "1b" },
        { tt: 98, name: "Giá bắt lốp dự phòng", quantity: "1b" },
        { tt: 99, name: "Lốp xe", quantity: "5" },
        { tt: 100, name: "Thùng nhiên liệu", quantity: "2b" },
        { tt: 101, name: "Bầu giảm thanh + Ống bô xả", quantity: "1b" },
        { tt: 102, name: "Giá + thùng bình điện", quantity: "1b" },
        { tt: 103, name: "Bộ radio catset", quantity: "1b" }
      ]
    },
    {
      name: "2.14 CÁC CẢM BIẾN, RỜ LE, CẦU CHÌ, HỘP ECU",
      items: [
        { tt: 105, name: "Hộp ECU", quantity: "1b" },
        { tt: 106, name: "Cảm biến vị trí Tr/ cơ", quantity: "1" },
        { tt: 107, name: "Cảm biến vị trí Tr/cam", quantity: "1" },
        { tt: 108, name: "Cảm biến vị trí bướm ga", quantity: "1" },
        { tt: 109, name: "Cảm biến lưu lượng không khí", quantity: "1" }
      ]
    },
    {
      name: "2.15 Hệ thống điều hòa",
      items: [
        { tt: 110, name: "Máy nén", quantity: "1" },
        { tt: 111, name: "Két dàn nóng", quantity: "1" },
        { tt: 112, name: "Khung bảo vệ két DN", quantity: "1" },
        { tt: 113, name: "Quạt dàn nóng", quantity: "1" },
        { tt: 114, name: "Phin + lọc ga", quantity: "1b" }
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

fs.writeFileSync('src/templates/ToyotaPradoTemplate.json', JSON.stringify(data, null, 2), 'utf-8');
console.log('Toyota Prado items:', data.sections.reduce((acc, sec) => acc + sec.items.length, 0));
