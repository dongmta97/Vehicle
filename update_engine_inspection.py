import re
import os

file_path = 'src/components/EngineInspectionBeforeRepairForm.tsx'

if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Thay đổi Cụm Công Đoạn
    content = re.sub(
        r"value=\{formData\.cumCongDoan !== undefined \? formData\.cumCongDoan : '.*?'\}",
        r"value={formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Kiểm tra động cơ trước khi sửa chữa'}",
        content
    )

    # 2. Thay đổi Tổ SC
    content = re.sub(
        r"value=\{formData\.toSC !== undefined \? formData\.toSC : '.*?'\}",
        r"value={formData.toSC !== undefined ? formData.toSC : 'Tổ S/C Máy, gầm'}",
        content
    )

    # 3. Thay đổi Phiếu số / Số tờ
    content = re.sub(
        r"value=\{formData\.soPhieu !== undefined \? formData\.soPhieu : '.*?'\}",
        r"value={formData.soPhieu !== undefined ? formData.soPhieu : '1'}",
        content
    )
    content = re.sub(
        r"value=\{formData\.soTo !== undefined \? formData\.soTo : '.*?'\}",
        r"value={formData.soTo !== undefined ? formData.soTo : '1'}",
        content
    )

    # 4. Thay đổi nội dung kết luận
    content = re.sub(
        r"value=\{formData\.ketLuan !== undefined \? formData\.ketLuan : \(formData\.conclusion \|\| '.*?'\)\}",
        r"value={formData.ketLuan !== undefined ? formData.ketLuan : (formData.conclusion || 'Cụm động cơ đã được kiểm tra đúng Quy trình công nghệ.')}",
        content
    )

    # 5. Thay mảng ITEMS
    new_items = """const ITEMS: any[] = [
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 1, noiDung: "Áp suất buồng đốt cuối kỳ nén, kPa (kgf/cm2)", yeuCau: "≥700 (7,0)" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 2, noiDung: "Chênh lệch áp suất giữa các buồng đốt, kPa (kgf/cm2)", yeuCau: "≤100 (1,0)" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 3, noiDung: "Số vòng quay không tải nhỏ nhất, v/ph", yeuCau: "700÷750" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 4, noiDung: "Số vòng quay lớn nhất, v/ph", yeuCau: "≥4000" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 5, noiDung: "Áp suất dầu bôi trơn nhỏ nhất, (kgf/cm2)", yeuCau: "≥60 (0,6)" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 6, noiDung: "Áp suất dầu bôi trơn lớn nhất, (kgf/cm2)", yeuCau: "Từ 450-500 (4,5÷5,0)" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 7, noiDung: "Độ võng của dây đai dẫn động máy phát và bơm nước khi ấn lực 40 N, mm", yeuCau: "8÷12" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 8, noiDung: "Bơm xăng, bơm nước, bơm dầu", yeuCau: "Đúng chủng loại, hoạt động ổn định, không có tiếng kêu lạ" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 9, noiDung: "Két làm mát", yeuCau: "Đúng chủng loại, không móp méo, dập các cánh tản nhiệt" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 10, noiDung: "Hệ thống đường ống nước, dầu, cao su chân máy, chân két mát, dây đai các loại", yeuCau: "Không nứt, vỡ, lão hóa" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 11, noiDung: "Hệ thống phân phối khí", yeuCau: "Đúng chủng lọa, hoạt động ổn định, tin cậy" },
  { category: 'I. NỘI DUNG KIỂM TRA', stt: 12, noiDung: "Tình trạng các doăng phớt, chảy dầu", yeuCau: "Không bị chảy dầu" }
];"""
    
    content = re.sub(r'const ITEMS: any\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ Đã cập nhật thành công Phiếu kiểm tra động cơ trước sửa chữa!")
else:
    print("❌ Không tìm thấy file", file_path)
