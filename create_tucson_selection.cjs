const fs = require('fs');
const path = require('path');

const data = {
  templateVersion: 1,
  vehicleCode: "HT-SELECT",
  vehicleName: "Hyundai Tucson",
  protocolType: "KIEM_CHON",
  sections: [
    {
      name: "1- ĐỘNG CƠ",
      items: [
        { name: "1.1. Trang bị đồng bộ", quantity: "" },
        { name: "-Bộ điều khiển ga", quantity: "1b" },
        { name: "Cụm ống xả", quantity: "1" },
        { name: "-Tấm che ống xả", quantity: "1" },
        { name: "Cụm ống hút", quantity: "1" },
        { name: "Nắp đậy BR cam cơ", quantity: "2" },
        { name: "Nắp đậy dàn cò mổ :", quantity: "1" },
        { name: "-Nắp đổ nhớt", quantity: "1" },
        { name: "Thước đo nhớt", quantity: "1" },
        { name: "Lọc nhớt", quantity: "1" },
        { name: "Cánh quạt", quantity: "1" },
        { name: "Bát bắt máy phát+tăngđưa", quantity: "1" },
        { name: "Puly trục cơ", quantity: "1" },
        { name: "Puly bơm nước", quantity: "1" },
        { name: "Khóa xả nước", quantity: "1" },
        { name: "Cạc te động cơ", quantity: "1" },
        { name: "Tấm dừng bánh đà", quantity: "1" },
        { name: "Chân máy", quantity: "2" },
        { name: "Thanh chống chân máy", quantity: "1" },
        { name: "1.2. Cụm – chi tiết", quantity: "" },
        { name: "Cụm bướm ga", quantity: "1b" },
        { name: "Bơm xăng", quantity: "1b" },
        { name: "Bơm nước", quantity: "1b" },
        { name: "Bơm nhớt", quantity: "1b" },
        { name: "Bánh đà + vành răng", quantity: "1b" },
        { name: "Nắp máy", quantity: "1b" },
        { name: "-Xu páp xả + hút", quantity: "8" },
        { name: "-Miệng xie XP xả + hút", quantity: "8" },
        { name: "-Ống dẫn hướng XP", quantity: "8" },
        { name: "-Lò xo xu páp + đế LX", quantity: "8b" },
        { name: "-Chén chặn xu páp", quantity: "8" },
        { name: "-Móng hãm xu páp", quantity: "16" },
        { name: "-Con đội", quantity: "8" },
        { name: "Trục cam (cote :..........", quantity: "1" },
        { name: "-Xích kéo trục cam", quantity: "1" },
        { name: "-Bánh xích cam - cơ", quantity: "1b" },
        { name: "Trục cơ (cote :.............", quantity: "1" },
        { name: "-Þ cổ chính :", quantity: "" },
        { name: "-Þ cổ biên :", quantity: "" },
        { name: "-Bạc cổ chính + biên", quantity: "2b" },
        { name: "-Đệm dọc trục", quantity: "4" },
        { name: "-Vòng bi trục cơ .........", quantity: "1" },
        { name: "Piston (cote :..............", quantity: "4" },
        { name: "-Chốt piston", quantity: "4" },
        { name: "-Phe gài chốt", quantity: "4" },
        { name: "Vòng găng", quantity: "4b" },
        { name: "Tay biên :", quantity: "4" },
        { name: "-Bạc thau tay biên", quantity: "4" },
        { name: "Xilanh ( cote :.............", quantity: "4" },
        { name: "Thân máy", quantity: "1" },
        { name: "Cảm biến lưu lượng khí nạp", quantity: "1" },
        { name: "Kim phun", quantity: "4" },
        { name: "Dù hút chân không ổ bướm ga", quantity: "2" },
        { name: "Cảm biến vị trí bướm ga", quantity: "1" },
        { name: "Van điều áp kim phun", quantity: "1" },
        { name: "Ống chia nhiên liệu", quantity: "1" },
        { name: "Đội căng xích", quantity: "1b" },
        { name: "Guốc căng xích", quantity: "2" },
        { name: "Nến điện", quantity: "4" },
        { name: "Chụp nến điện", quantity: "4" },
        { name: "Dây phin", quantity: "4" },
        { name: "Bộ chia điện tích hợp", quantity: "1b" },
        { name: "*- CHI TIẾT LẺ ĐỘNG CƠ :", quantity: "" },
        { name: "Bulon, Jujông, đai ốc, long đền, vòng kẹp, chi tiết khác", quantity: "" }
      ]
    },
    {
      name: "2- HỆ THỐNG ĐIỆN",
      items: [
        { name: "Máy khởi động", quantity: "1" },
        { name: "-Bạc thau + than KĐ", quantity: "2b" },
        { name: "-Đầu nê khởi động", quantity: "1" },
        { name: "-Bánh răng khởi động", quantity: "1" },
        { name: "-Rờ le khởi động", quantity: "1" },
        { name: "Máy phát điện", quantity: "1b" },
        { name: "-Puly máy phát", quantity: "1" },
        { name: "-Bi MP ........................", quantity: "2" },
        { name: "-Than máy phát", quantity: "1b" },
        { name: "-Vỉ tiết chế", quantity: "1" },
        { name: "Rờ le đề phụ", quantity: "1" },
        { name: "Bình điện 12v..............", quantity: "1" },
        { name: "-Cọc bình điện", quantity: "2" },
        { name: "-Cáp mát ( - )", quantity: "1" },
        { name: "-Cáp lửa ( + )", quantity: "1" },
        { name: "Đồng hồ điện báo đèn", quantity: "1" },
        { name: "------ AS nhớt báo đèn", quantity: "1" },
        { name: "---------- tO nước", quantity: "1" },
        { name: "---------- nhiên liệu", quantity: "1" },
        { name: "---------- tốc độ", quantity: "1" },
        { name: "Cụm tốc độ + dây", quantity: "1" },
        { name: "Bóng đèn đồng hồ", quantity: "1b" },
        { name: "Công tắc điện", quantity: "1" },
        { name: "--------- gạt mưa+rửa kính", quantity: "1+1" },
        { name: "-đèntrungtâm+pha,xynhan", quantity: "1b" },
        { name: "Buton nhấn còi", quantity: "1" },
        { name: "Còi điện", quantity: "2" },
        { name: "Máy gạt mưa trước + sau", quantity: "2b" },
        { name: "-Bộ thanh chuyền", quantity: "1b" },
        { name: "-Cần gạt mưa", quantity: "2" },
        { name: "-Chổi gạt mưa", quantity: "2" },
        { name: "-Cần gạt mưa sau", quantity: "1" },
        { name: "-Chổi gạt mưa sau", quantity: "1" },
        { name: "Bộ rửa kính T + S", quantity: "1+1" },
        { name: "-Bầu nước + môtơ", quantity: "1+1" },
        { name: "Ống + béc phun", quantity: "1b" },
        { name: "Đèn pha", quantity: "2" },
        { name: "----- hiệu trước cụm", quantity: "2" },
        { name: "----- hiệu sau cụm", quantity: "2" },
        { name: "----- soi biển số", quantity: "2" },
        { name: "----- khoang xe", quantity: "2" },
        { name: "----- dừng bổ sung", quantity: "1" },
        { name: "----- cửa cốp sau", quantity: "1" },
        { name: "Cầu chì các loại", quantity: "1b" },
        { name: "Rờ le các loại", quantity: "1b" },
        { name: "Bộ dây điện", quantity: "1b" },
        { name: "Công tắc hành trình", quantity: "" },
        { name: "Công tắc ưu tiên", quantity: "1" },
        { name: "Cục Stop + Cục chớp", quantity: "1+1" },
        { name: "Cục báo de", quantity: "1" },
        { name: "Cục báo phanh tay", quantity: "1" },
        { name: "Cảm biến tO nước........", quantity: "1" },
        { name: "------- AS nhớt .............", quantity: "1" },
        { name: "Bóng đèn các loại", quantity: "" },
        { name: "Bóng đèn ghim 3W", quantity: "" },
        { name: "Bóng đèn 21W", quantity: "" },
        { name: "Bóng đèn 10 W", quantity: "" },
        { name: "Bóng đèn trần", quantity: "" },
        { name: "Bóng đèn", quantity: "" }
      ]
    },
    {
      name: "3- HỆ THỐNG LÁI",
      items: [
        { name: "Vành tay lái", quantity: "1" },
        { name: "Chữ thập lái", quantity: "2" },
        { name: "Rô tuyn chuyển hướng", quantity: "2+2" },
        { name: "Rô tuyn trụ dưới", quantity: "2" },
        { name: "Thanh chuyển hướng", quantity: "2" },
        { name: "Cụm chữ A trên+rôtuyn", quantity: "2b" },
        { name: "Chữ A trên", quantity: "2b" },
        { name: "Bơm trợ lực lái", quantity: "1b" },
        { name: "Bost tay lái + thước lái", quantity: "1b" },
        { name: "Cao su bost lái", quantity: "2" },
        { name: "Cao su ruột gà bost lái", quantity: "2" },
        { name: "Thanh chữ a trên", quantity: "2b" },
        { name: "Thanh chữ a dưới", quantity: "2b" },
        { name: "Thanh ổn định ngang", quantity: "1" },
        { name: "Thanh ổn định dọc", quantity: "2" }
      ]
    },
    {
      name: "4- HỆ THỐNG PHANH",
      items: [
        { name: "Phanh chân", quantity: "" },
        { name: "Bơm phanh cái", quantity: "1" },
        { name: "-Lúp pê bơm phanh", quantity: "1" },
        { name: "-Bầu chứa dầu phanh", quantity: "1" },
        { name: "Bầu trợ lực", quantity: "1" },
        { name: "-Van hơi hút 1 chiều", quantity: "1" },
        { name: "Bơm phanh con sau", quantity: "2" },
        { name: "Bơm phanh con trước", quantity: "2" },
        { name: "Đĩa phanh trước", quantity: "2" },
        { name: "Tang chống sau", quantity: "2" },
        { name: "Guốc phanh", quantity: "8" },
        { name: "-Lò xo guốc phanh", quantity: "1b" },
        { name: "Tấm dừng bánh xe", quantity: "4" },
        { name: "-Đường ống phanh", quantity: "1b" },
        { name: "-Cụm chỉnh phanh", quantity: "2b" },
        { name: "5.Phanh tay (vào B/sau)", quantity: "" },
        { name: "Tay kéo phanh", quantity: "1" },
        { name: "Bộ dây cáp", quantity: "1b" }
      ]
    },
    {
      name: "5- DẪN ĐỘNG LY HỢP",
      items: [
        { name: "Bơm ly hợp chính", quantity: "1" },
        { name: "- Bầu chứa dầu", quantity: "1" },
        { name: "Bơm ly hợp phụ", quantity: "1" },
        { name: "Bi tê ..........................", quantity: "1" },
        { name: "-Ổ trượt bi tê", quantity: "1" },
        { name: "Càng ngắt ly hợp", quantity: "1" }
      ]
    },
    {
      name: "6- HỘP SỐ",
      items: [
        { name: "Cần số chính", quantity: "1" },
        { name: "Vỏ hộp số", quantity: "1" },
        { name: "Nắp hộp số", quantity: "1" },
        { name: "Bộ biến mô", quantity: "1b" },
        { name: "Trục biến mô", quantity: "1" },
        { name: "Bộ bánh răng hành tinh 1", quantity: "1b" },
        { name: "Bộ bánh răng hành tinh 2", quantity: "1b" },
        { name: "Bộ bánh răng hành tinh 3", quantity: "1b" },
        { name: "Bộ bánh răng hành tinh 4", quantity: "1b" },
        { name: "Trục vào hộp số", quantity: "1b" },
        { name: "Trục ra hộp số", quantity: "1b" },
        { name: "Trục bánh răng trung gian", quantity: "1b" },
        { name: "Bộ ly hợp 1", quantity: "1" },
        { name: "Bộ ly hợp 2", quantity: "1" },
        { name: "Bộ ly hợp 3", quantity: "1" },
        { name: "Bộ ly hợp 4", quantity: "1" },
        { name: "Bộ ly hợp 5", quantity: "1" },
        { name: "Bộ ly hợp tiến", quantity: "1" },
        { name: "Cacte hộp số", quantity: "1" },
        { name: "Bơm dầu hộp số", quantity: "1" },
        { name: "Van điện từ điều khiển", quantity: "3" }
      ]
    },
    {
      name: "7- CARDAN",
      items: [
        { name: "Thân cardan liền", quantity: "1" },
        { name: "Mặt bích", quantity: "2" },
        { name: "Chữ thập đồng bộ", quantity: "3" },
        { name: "Cao su ổ bi treo+đạn", quantity: "1b" }
      ]
    },
    {
      name: "8- DẦM CẦU TRƯỚC",
      items: [
        { name: "Vòng bi đùm ...........", quantity: "2" },
        { name: "-----------đùm ...........", quantity: "2" },
        { name: "Mâm bánh xe", quantity: "2" },
        { name: "May ơ bánh xe", quantity: "2" },
        { name: "Jujông tắc kê", quantity: "12" },
        { name: "Đai ốc tắc kê", quantity: "12" }
      ]
    },
    {
      name: "9- CẦU SAU",
      items: [
        { name: "Bán trục (láp ngang)", quantity: "2" },
        { name: "Bộ vi sai", quantity: "1" },
        { name: "Bánh răng vành chậu", quantity: "1" },
        { name: "------------- côn xoắn", quantity: "1" },
        { name: "Đầu nối cardan", quantity: "1" },
        { name: "Vòng bi vi sai ..............", quantity: "2" },
        { name: "-----------vi sai ..............", quantity: "2" },
        { name: "--------- đùm ...........", quantity: "2" },
        { name: "--------- đùm ...........", quantity: "2" },
        { name: "Mâm bánh xe", quantity: "2" },
        { name: "May ơ bánh xe", quantity: "2" },
        { name: "Jujông tắc kê", quantity: "12" },
        { name: "Đai ốc tắc kê", quantity: "12" }
      ]
    },
    {
      name: "10- HỆ THỐNG TREO",
      items: [
        { name: "Phía trước", quantity: "" },
        { name: "-Ống giảm xóc", quantity: "2" },
        { name: "-Thanh đòn ổn định", quantity: "1b" },
        { name: "Rôtuyn treo đứng", quantity: "2" },
        { name: "-Gối cao su chống dập", quantity: "2" },
        { name: "Phía sau", quantity: "" },
        { name: "-Ống giảm xóc", quantity: "2" },
        { name: "-U quang nhíp sau", quantity: "4" },
        { name: "-Gối cao su chống dập", quantity: "2" },
        { name: "Rôtuyn treo đứng", quantity: "2" },
        { name: "Bộ treo sau +cao su", quantity: "2b" }
      ]
    },
    {
      name: "11- KHUNG XE",
      items: [
        { name: "Biển số", quantity: "2" },
        { name: "Cản trước (nhựa)", quantity: "1b" },
        { name: "-Bát móc kéo trước", quantity: "2" },
        { name: "Cản sau", quantity: "1" },
        { name: "-Vòng móc kéo sau", quantity: "1" }
      ]
    },
    {
      name: "12- NỘI THẤT",
      items: [
        { name: "La phông trần (nỉ)", quantity: "1b" },
        { name: "Bọc thành trong + cửa", quantity: "1b" },
        { name: "Tấm che nắng", quantity: "2" },
        { name: "Bộ đệm ghế", quantity: "05" },
        { name: "Khung ghế", quantity: "05" },
        { name: "Táp bi trải sàn", quantity: "1b" }
      ]
    },
    {
      name: "13- TRANG BỊ ĐỒNG BỘ",
      items: [
        { name: "Két nước + nắp", quantity: "1b" },
        { name: "-Bọc gió két nước", quantity: "1" },
        { name: "Lọc gió", quantity: "1" },
        { name: "-Cao su lọc gió", quantity: "1" },
        { name: "-Ruột lọc gió", quantity: "1" },
        { name: "Thùng nhiên liệu", quantity: "1" },
        { name: "-Nắp thùng nhiên liệu", quantity: "1" },
        { name: "-Phao xăng", quantity: "1b" },
        { name: "Lọc nhiên liệu sơ cấp", quantity: "1" },
        { name: "Bô giảm thanh", quantity: "1" },
        { name: "-Bộ ống xả", quantity: "1b" },
        { name: "Cao su chắn bùn T+ S", quantity: "4" },
        { name: "Giá lốp dự phòng", quantity: "1b" },
        { name: "-Lốp dự phòng ............", quantity: "1b" },
        { name: "-Lốp bánh xe ..............", quantity: "4b" }
      ]
    },
    {
      name: "14- CA BIN, THÂN XE",
      items: [
        { name: "Kính chắn gió", quantity: "1" },
        { name: "Kính chiếu hậu trong", quantity: "1" },
        { name: "Kính chiếu hậu ngoài", quantity: "2" },
        { name: "-Tay kính chiếu hậu N", quantity: "2" },
        { name: "Kính hông xe", quantity: "4" },
        { name: "-Khóa hãm ngoài", quantity: "4" },
        { name: "Mặt nạ", quantity: "1" },
        { name: "Ca bô :", quantity: "1" },
        { name: "-Khóa gài cabô", quantity: "1b" },
        { name: "Bệ táp lô nhựa cabin", quantity: "1b" },
        { name: "Cửa ca bin", quantity: "" },
        { name: "-Khóa hãm trong", quantity: "4" },
        { name: "-Cơ cấu khóa cửa", quantity: "4" },
        { name: "-Tấm che trong cửa trước", quantity: "4" },
        { name: "-Tay nắm trong cửa", quantity: "4" },
        { name: "-Tay mỡ trong cửa hông", quantity: "4" },
        { name: "-Tay mở ngoài cửa hông", quantity: "4" },
        { name: "Ổ khóa chìa", quantity: "3" },
        { name: "Cửa sau xe", quantity: "1b" },
        { name: "-Ben hơi chống cửa", quantity: "2" },
        { name: "-Cơ cấu khóa cửa", quantity: "1" },
        { name: "-Kính cửa sau", quantity: "1" },
        { name: "-Tấm che trong cửa", quantity: "1" },
        { name: "-Tay nắm trong cửa", quantity: "1" },
        { name: "-Tay mở ngoài cửa", quantity: "1" },
        { name: "Đệm giảm âm ca bô", quantity: "1b" },
        { name: "Đệm chống nóng cabô", quantity: "1" },
        { name: "Tay nắm hông", quantity: "....." }
      ]
    },
    {
      name: "15- HỆ THỐNG LẠNH",
      items: [
        { name: "Máy nén", quantity: "1" },
        { name: "Két dàn nóng", quantity: "1" },
        { name: "-Khung bảo vệ két DN", quantity: "1" },
        { name: "Ong dàn lạnh", quantity: "4" },
        { name: "Ong thổi gió dàn lạnh", quantity: "5" },
        { name: "Rờ le", quantity: "2" },
        { name: "Van tiết lưu", quantity: "1" },
        { name: "Timer start", quantity: "1" },
        { name: "-Quạt dàn nóng", quantity: "1" },
        { name: "Phin + lọc ga", quantity: "1b" },
        { name: "Dàn lạnh", quantity: "2" },
        { name: "Kim vòi", quantity: "2" },
        { name: "Cảm biến ga", quantity: "1" },
        { name: "Lọc gió dàn lạnh", quantity: "1b" },
        { name: "Cửa gió dàn lạnh trước", quantity: "4" },
        { name: "Cửa gió dàn lạnh sau", quantity: "6" },
        { name: "Bộ bi tăng đưa dây côroa", quantity: "1b" }
      ]
    },
    {
      name: "16- HỆ THỐNG ÂM THANH",
      items: [
        { name: "Ang ten", quantity: "1" },
        { name: "Catsett", quantity: "1" }
      ]
    },
    {
      name: "17- TRANG BỊ KHÁC",
      items: [
        { name: "Tem xuất xưởng", quantity: "1b" },
        { name: "Cao su chân máy", quantity: "2" },
        { name: "Cao su chân hộp số", quantity: "1" },
        { name: "Ống nước cao su", quantity: "2" },
        { name: "Joang ống cửa trước", quantity: "2" },
        { name: "Joang ống cưả sau", quantity: "2" },
        { name: "Joang ống cửa cốp sau", quantity: "1" },
        { name: "Joang U quay kính", quantity: "" },
        { name: "Joang ống viền cánh cửa", quantity: "2" },
        { name: "Joang kính cố định", quantity: "" },
        { name: "Nẹp kính cửa", quantity: "" },
        { name: "*- CHI TIẾT LẺ PHẦN XE :", quantity: "" },
        { name: "Bulon, Jujông, đai ốc, long đền, vòng kẹp, ống, rắc co, chi tiết khác (ghi tên, S/lượng thiếu, S/lượng hỏng)", quantity: "" }
      ]
    }
  ]
};

data.sections.forEach(section => {
  section.items = section.items.filter(item => {
    return item.name && item.name.trim() !== "" && /[a-zA-Z\u00C0-\u1EF9]/.test(item.name);
  });
});

const dir = path.join('src', 'templates', 'selections');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(path.join(dir, 'HyundaiTucsonSelection.json'), JSON.stringify(data, null, 2), 'utf-8');
console.log('Hyundai Tucson Selection items:', data.sections.reduce((acc, sec) => acc + sec.items.length, 0));
