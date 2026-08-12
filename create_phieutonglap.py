import re

file_path = 'src/components/PhieuTongLapTrangBiKyThuatForm.tsx'
with open('src/components/KiemTraThanVoSauSuaChuaForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Đổi tên component
content = content.replace('KiemTraThanVoSauSuaChuaForm', 'PhieuTongLapTrangBiKyThuatForm')

# Thay Tổ mặc định
content = re.sub(
    r"value=\{formData\.toSC !== undefined \? formData\.toSC : 'Tổ S/C GCCK'\}",
    r"value={formData.toSC !== undefined ? formData.toSC : 'Tổ S/C Máy, gầm, điện, GCCK'}",
    content
)

# Sửa lại Cụm Công Đoạn mặc định
content = re.sub(
    r"value=\{formData\.cumCongDoan !== undefined \? formData\.cumCongDoan : 'Kiểm tra sau sửa chữa thân, vỏ xe'\}",
    r"value={formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Tổng lắp trang thiết bị kỹ thuật'}",
    content
)

# Thay SoPhieu mặc định
content = re.sub(
    r"value=\{formData\.soPhieu !== undefined \? formData\.soPhieu : '1'\}",
    r"value={formData.soPhieu !== undefined ? formData.soPhieu : '2'}",
    content
)

# Thay SoTo mặc định
content = re.sub(
    r"value=\{formData\.soTo !== undefined \? formData\.soTo : '2'\}",
    r"value={formData.soTo !== undefined ? formData.soTo : '12'}",
    content
)

# Chèn mảng ITEMS mới
new_items = """const ITEMS: any[] = [
  { category: 'I. Chuẩn bị', stt: 1, noiDung: 'Nhận các cụm, bộ phận chi tiết đã sửa chữa xong ở các tổ chuyên sửa chữa. Các chi tiết còn dùng cũ ở tổ chuẩn bị. Các chi tiết thay mới ở kho', yeuCau: 'Tất cả các cụm, các chi tiết có dấu của KCS xác nhận và dựa theo phiếu sổ dự toán của KCS' },
  { category: 'I. Chuẩn bị', stt: 2, noiDung: 'Đưa các chi tiết cụm về vị trí tập kết chờ tổng lắp xe', yeuCau: 'Đưa dần từng cụm, bộ phận lắp đến đâu nhận đến đó' },
  { category: 'I. Chuẩn bị', stt: 3, noiDung: 'Chuẩn bị đồ nghề cho tổng lắp xe. Dọn vị trí đặt khung xe cho tổng lắp', yeuCau: 'Vị trí tổng lắp theo quy định' },
  
  { category: 'II. Tổng lắp xe', stt: 1, noiDung: 'Đặt ngửa khung sát si đã sửa chữa xong lên 2 mễ kê xe', yeuCau: 'Mễ kê sát si chắc chắn' },
  { category: 'II. Tổng lắp xe', stt: 2, noiDung: 'Lắp đủ các bạc cao su vào các mõ nhíp cái', yeuCau: 'Bạc cao su mới' },
  { category: 'II. Tổng lắp xe', stt: 3, noiDung: 'Lắp 4 bộ nhíp vào khung xe', yeuCau: 'Lắp đúng vị trí mõ nhíp trước sau, đai ốc chốt nhíp có đủ đệm vênh' },
  { category: 'II. Tổng lắp xe', stt: 4, noiDung: 'Lắp cụm cầu trước vào 2 bộ nhíp trước. Lắp chốt rốn nhíp. Lắp đủ 2 tấm đế nhíp trên lắp ốp nhíp vào thân cầu trước. Luồn 2 quang nhíp liên kết cầu nhíp. Xiết bulông quang nhíp', yeuCau: 'Nhíp có đủ mỡ bôi. Bulông quang nhíp có đủ đệm vênh. Mô men M = 15 - 17 kgm' },
  { category: 'II. Tổng lắp xe', stt: 5, noiDung: 'Lắp cụm cầu sau vào 2 bó nhíp sau. Lắp chốt rốn nhíp. Lắp đủ 2 tấm đế nhíp trên lắp ốp nhíp vào thân cầu sau. Luồn 2 quang nhíp liên kết cầu nhíp. Xiết bulông quang nhíp', yeuCau: 'Nhíp có đủ mỡ bôi. Bulông quang nhíp có đủ đệm vênh. Mômen xiết M = 15 - 17 kgm' },
  { category: 'II. Tổng lắp xe', stt: 6, noiDung: 'Lắp đủ 4 ống giảm xóc cho 2 cầu xe. Lắp trước 4 bạc cao su côn vào 2 lỗ đầu ống. Lắp ống giảm xóc vào chốt ở cầu xe và khung xe', yeuCau: 'Đủ bạc cao su, vòng đệm chặn 2 đầu mỗi ống giảm xóc. Xiết chặt đai ốc, chốt có đủ đệm vênh.' },
  { category: 'II. Tổng lắp xe', stt: 7, noiDung: 'Lật sấp khung xe cho thuận chiều trên 2 mễ kê xe', yeuCau: 'Mễ kê chắc chắn an toàn' },
  { category: 'II. Tổng lắp xe', stt: 8, noiDung: 'Lắp toàn bộ đường dầu phanh chạy dọc khung, dọc thân cầu xe.\\nUốn theo dạng lượn chạy dọc khung xe, cầu xe.\\nBắt kẹp giữa đường ống', yeuCau: 'Các đường ống phải được kẹp giữ bằng đai ở thân khung, thân cầu xe, bảo đảm khi xe hoạt động không bị vướng' },
  { category: 'II. Tổng lắp xe', stt: 9, noiDung: 'Lắp thùng xăng: lắp đai thùng xăng, giá treo thùng xăng, xiết chặt đai treo', yeuCau: 'Đai giữ thùng xăng đều phải có lót dải cao su, xiết chặt bulông nút. Thùng xăng treo chắc chắn' },
  { category: 'II. Tổng lắp xe', stt: 10, noiDung: 'Lắp bầu lọc xăng ở khung xe, lắp toàn bộ đường ống dẫn xăng. Uốn đường xăng gọn ở vị trí ống chuyển hướng', yeuCau: 'Vị trí uốn cáo R hợp lý. Không làm gãy, nứt ống dẫn xăng' },
  { category: 'II. Tổng lắp xe', stt: 11, noiDung: 'Lắp 04 bánh xe vào moay ơ các cầu trước, sau. Lắp bơm đủ hơi. Gá lắp 2 lốp trước. Gá lắp 2 lốp sau. Bắt đầu tuyô dầu phanh vào bơm con, bơm cụt 4 bánh xe', yeuCau: 'Các đau ốc bulông có ren trơn nhẹ. Xiết tăng dần theo thứ tự đối xứng cho đến đủ cân M = 15 - 17 kgm. Quay thử các bánh xe, thấy trơn nhẹ là được' },
  { category: 'II. Tổng lắp xe', stt: 12, noiDung: 'Cẩu lắp động cơ lên khung xe. Kê gỗ đầu cuôi bưởng ly hợp. Cẩu nhấc đặt động cơ lên đúng vị trí của giá bắt động cơ', yeuCau: 'Có 2 người, đặt đúng vị trí chân trước và gỗ kê phía sau' },
  { category: 'II. Tổng lắp xe', stt: 13, noiDung: 'Lắp hoàn chỉnh các tuyô xăng liên kết từ bình xăng chính, bầu lọc. Bơm xăng động cơ', yeuCau: 'Đảm bảo tẩu nối kín đường xăng kín, không nứt hở' },
  { category: 'II. Tổng lắp xe', stt: 14, noiDung: 'Cẩu lắp hộp sô chính lên xe. Đặt đệm cao su vào vị trí để kê hộp số. Cẩu đặt hộp số lên khung xe', yeuCau: 'Cao su lót đệm mới, xiết bulông đủ chặt, có đệm vênh hãm, hoặc bằng chốt chẻ. Trục acơ hộp số vào rãnh then hoa các đĩa ma sát' },
  { category: 'II. Tổng lắp xe', stt: 15, noiDung: 'Cẩu lắp hộp số phụ lên khung xe. Đặt đệm cao su vào vị trí lắp. Cẩu đặt hộp số lên 4 đệm cao su. Luồn 4 bulông xiết chặt', yeuCau: 'Cao su đệm mới, hãm chốt chẻ' },
  { category: 'II. Tổng lắp xe', stt: 16, noiDung: 'Lắp các đăng ngắn giữ HSC và HSP', yeuCau: 'Lắp đúng chiều nạng các đăng, 04 bulông M 10 có đủ đệm xiết chặt với M = 7kgm' },
  { category: 'II. Tổng lắp xe', stt: 17, noiDung: 'Lắp trục các đăng từ HSP đi cầu sau. Lắp cụm phanh tay vào hộp số. Lắp các đăng vào bích phanh tay', yeuCau: 'Xoay đúng chiều nạng các đăng, 8 bulông có đệm vênh M = 7 kgm' },
  { category: 'II. Tổng lắp xe', stt: 18, noiDung: 'Lắp trục các đăng từ HSP đi cầu trước', yeuCau: 'Xoay đúng chiều nạng các đăng, 8 bulông có đệm vênh M = 7 kgm' },
  { category: 'II. Tổng lắp xe', stt: 19, noiDung: 'Lắp 2 móc kéo trước và chắn đòn trước vào khung xe', yeuCau: 'Các bulông có đệm vênh xiết chặt M = 7.5 - 8 kgm' },
  { category: 'II. Tổng lắp xe', stt: 20, noiDung: 'Lắp hộp tay lái vào khung xe', yeuCau: 'Lắp đúng vị trí có đủ đệm vênh xiết chặt' },
  { category: 'II. Tổng lắp xe', stt: 21, noiDung: 'Lắp két nước vào khung xe. Lắp đủ các đệm cao su chân két nước. Xiết chặt bulông chân két nước. Lắp chặt các đường ống cao su nước ra, vào động cơ', yeuCau: 'Có đủ đệm cao su mới. Ống cao su dẫn nước mới, có đai xiết ống nước chắc chắn' },
  { category: 'II. Tổng lắp xe', stt: 22, noiDung: 'Lắp vành tôn hướng gió vào két nước của quạt gió động cơ', yeuCau: 'Quay cánh quạt gió động cơ không vướng chạm hứng gió' },
  { category: 'II. Tổng lắp xe', stt: 23, noiDung: 'Lắp cụm ba ngang chuyển hướng trước', yeuCau: '2 bánh trước hướng thẳng, điều chỉnh độ dài chuyển hướng và hãm chắc' },
  { category: 'II. Tổng lắp xe', stt: 24, noiDung: 'Lắp vilet với cụm chuyển hướng trước', yeuCau: 'Chia tay lái ăn đều 2 phía trái phải' },
  { category: 'II. Tổng lắp xe', stt: 25, noiDung: 'Lắp càng cua của ly hợp, lắp cam dẫn động ly hợp, lắp bơm dầu ly hợp', yeuCau: 'Đặt càng cua vào khớp, điều chỉnh thanh dẫn động ly hợp cho hợp lý' },
  { category: 'II. Tổng lắp xe', stt: 26, noiDung: 'Lắp bệ xe lên khung xe: đặt đủ các đệm cao su sàn xe ở 12 bulông sàn. Dùng cẩu chuyển 2 tấn móc cẩu bệ xe lên khung, điều chỉnh bệ xe cho trùng lỗ bệ xe và lỗ ở tai khung. Cho đủ 12 bulông M12 vào lỗ bệ xe, bắt gá bệ xe vào khung xe', yeuCau: 'Các đệm sàn xe mới, móc cẩu bệ chuyên dùng (không làm vênh méo bệ xe). Bắt đầu gá đai ốc. Bệ xe chưa bắt chặt' },
  { category: 'II. Tổng lắp xe', stt: 27, noiDung: 'Bắt bầu lọc gió. Bắt thanh giữ đai bầu lọc gió. Bắt các ống vào nắp bầu lọc', yeuCau: 'Bình lọc có đủ ruột lọc. Đường ống kín' },
  { category: 'II. Tổng lắp xe', stt: 28, noiDung: 'Bắt tổng bơm côn phanh vào bệ xe. Bắt thân tổng bơm. Bắt các rắc co đường ống vào thân bơm', yeuCau: 'Thân bơm bắt chắc chắn' },
  { category: 'II. Tổng lắp xe', stt: 29, noiDung: 'Bắt cụm dẫn động ga. Dây ga gió', yeuCau: 'Các cụm dẫn ga, dây ga gió phải hoạt động nhẹ nhàng' },
  { category: 'II. Tổng lắp xe', stt: 30, noiDung: 'Bắt 2 cánh gà buồng máy cửa xe', yeuCau: 'Bắt đúng vị trí và chắc chắn' },
  { category: 'II. Tổng lắp xe', stt: 31, noiDung: 'Bắt 2 chắn bùn trước xe', yeuCau: 'Bắt đủ bulông, đệm vênh' },
  { category: 'II. Tổng lắp xe', stt: 32, noiDung: 'Lắp phần điện nổ cho xe. Lắp khoá điện nổ. Lắp tiết chế, tăng điện trên cho thân xe', yeuCau: 'Lắp trước khi sơn để đi thử xe' },
  { category: 'II. Tổng lắp xe', stt: 33, noiDung: 'Lắp bình điện, nối cáp mát, cáp lửa với khởi động', yeuCau: 'Bình điện mới, nạp đủ, cáp điện có đủ đầu bọp' },
  { category: 'II. Tổng lắp xe', stt: 34, noiDung: 'Lắp trục tay quay láo, lắp ty dẫn trục tay quay lái, lắp ống dẫn tay lái', yeuCau: 'Can đuya vào khít, xiết chặt tay lái, có đệm vênh' },
  { category: 'II. Tổng lắp xe', stt: 35, noiDung: 'Lắp vô lăng tay lái.', yeuCau: 'Lắp đúng vị trí, không làm vỡ hỏng vô lăng' },
  { category: 'II. Tổng lắp xe', stt: 36, noiDung: 'Lắp bình xăng phụ. Lắp khoá 3 chạc. lắp nối đường ống xăng, khoá xăng', yeuCau: 'Cố định chắc chắn' },
  { category: 'II. Tổng lắp xe', stt: 37, noiDung: 'Lắp calăng với thân xe', yeuCau: 'Bắt chắc, ngay ngắn' },
  { category: 'II. Tổng lắp xe', stt: 38, noiDung: 'Lắp bàn đạp côn phanh: lắp bàn đạp côn. lắp bàn đạp phanh, hiệu chỉnh hành trình tự do bàn đạp côn phanh', yeuCau: 'Có đệm, có chốt chẻ chắc chắn, có lò xo tự nhả nhẹ nhàng' },
  { category: 'II. Tổng lắp xe', stt: 39, noiDung: 'Lắp cụm dây kéo phanh tay. Lắp cụm dây kéo dây phanh. Điều chỉnh khe hở má phanh', yeuCau: 'Dây mới, đủ tiêu chuẩn' },
  { category: 'II. Tổng lắp xe', stt: 40, noiDung: 'Lắp cabô buồng máy', yeuCau: 'Capô nắp đậy kín khít' },
  { category: 'II. Tổng lắp xe', stt: 41, noiDung: 'Lắp bảng đồng hồ điện trên xe. Lắp còi xe', yeuCau: 'Các động cơ đã được sửa chữa' },
  { category: 'II. Tổng lắp xe', stt: 42, noiDung: 'Lắp kính chắn gió, đặt khung kính, điều chỉnh bắt bulông bản lề kính', yeuCau: 'Bắt chắc chắn, kiểm tra khung kính, không được xê dịch' },
  { category: 'II. Tổng lắp xe', stt: 43, noiDung: 'Lắp 2 ghế chính phụ', yeuCau: 'Có thể tận dụng đệm tựa cũ để thử xe' },
  { category: 'II. Tổng lắp xe', stt: 44, noiDung: 'Điều chỉnh kiểm tra lại hệ thống phối khí của động cơ. Quay maniven và điều chỉnh từng máy', yeuCau: 'Kiểm tra thời điểm đánh lửa và khe hở supáp' },
  { category: 'II. Tổng lắp xe', stt: 45, noiDung: 'Đổ xăng dầu, nước theo quy định vào động cơ', yeuCau: 'Dầu mới BP = 5.8 lít, nước sạch đổ đầy két nước' },
  { category: 'II. Tổng lắp xe', stt: 46, noiDung: 'Nổ máy tại chỗ. Nổ máy kiểm tra các thông số trên đồng hồ', yeuCau: 'Theo quy định của tiêu chuẩn kỹ thuật' },
  { category: 'II. Tổng lắp xe', stt: 47, noiDung: 'Xả e và điều chỉnh guốc phanh chân', yeuCau: 'Khe hở guốc với tang trống: 0.15 - 0.25' },
  { category: 'II. Tổng lắp xe', stt: 48, noiDung: 'Nổ máy tại chỗ, kiểm tra: Đạp côn, đi thử các số, đạp phanh, kiểm tra độ bám má phanh', yeuCau: 'Tổ trưởng kiểm tra xe tại chỗ' }
];"""
content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

# Sửa kết luận
content = re.sub(
    r"value=\{formData\.ketLuan !== undefined \? formData\.ketLuan : \(formData\.conclusion \|\| '.*?'\)\}",
    r"value={formData.ketLuan !== undefined ? formData.ketLuan : (formData.conclusion || 'Tổng lắp được thực hiện đúng Quy trình công nghệ.')}",
    content
)

# Sửa lại title Phiếu Kiểm Tra: Số 1 thành Phiếu Kiểm Tra: Số 2
content = content.replace("PHIẾU KIỂM TRA:", "PHIẾU KIỂM TRA:")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("1. Tạo thành công PhieuTongLapTrangBiKyThuatForm.tsx")
