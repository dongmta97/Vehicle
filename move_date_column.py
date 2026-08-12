import os
import re

target_dir = 'src/components/'
updated_files = 0

for root, _, files in os.walk(target_dir):
    for file in files:
        if file.endswith('Form.tsx') and 'MilitaryInspectionForm' not in file and 'DetailedSelectionProtocolForm' not in file:
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            original_content = content

            # --- 1. DỌN DẸP SẠCH CỘT NGÀY THỰC HIỆN CŨ ---
            # Xóa <th>Ngày thực hiện</th> đang ở sai vị trí
            content = re.sub(r'<th className="border border-black px-2 py-2 text-center w-32 font-bold">Ngày thực hiện</th>\n\s*', '', content)
            
            # Xóa <td> chứa <input type="date"> cũ
            td_pattern = r'<td className="border border-black px-2 py-2">\s*<input\s*type="date"[\s\S]*?/>\s*</td>\s*'
            content = re.sub(td_pattern, '', content)

            # --- 2. CHÈN LẠI VÀO ĐÚNG VỊ TRÍ CUỐI CÙNG ---
            # Khởi tạo Input Date
            has_islocked = 'isLocked' in content
            has_isadmin = 'isAdmin' in content
            disabled_prop = ""
            if has_islocked and has_isadmin:
                disabled_prop = "disabled={isLocked && !isAdmin}"
            elif has_islocked:
                disabled_prop = "disabled={isLocked}"
                
            td_to_insert = f"""<td className="border border-black px-2 py-2">
                              <input 
                                type="date" 
                                className="w-full bg-transparent outline-none text-center"
                                value={{item.ngayThucHien || ''}}
                                onChange={{(e) => {{
                                  const newItems = [...formData.items];
                                  newItems[index].ngayThucHien = e.target.value;
                                  setFormData({{ ...formData, items: newItems }});
                                }}}}
                                {disabled_prop}
                              />
                            </td>"""

            # Xử lý phần THEAD: Tìm thẻ <th> cuối cùng của thead (trước </tr>) và chèn vào
            # Cột cuối thường là Ghi chú hoặc Thực tế/Kết quả thực tế
            last_th_patterns = [
                r'(<th[^>]*>Ghi chú</th>)',
                r'(<th[^>]*>Thực tế</th>)',
                r'(<th[^>]*>Kết quả thực tế</th>)'
            ]
            for pattern in last_th_patterns:
                match = re.search(pattern, content)
                if match:
                    # Chèn SAU cột cuối cùng
                    content = content.replace(
                        match.group(1), 
                        match.group(1) + '\n                  <th className="border border-black px-2 py-2 text-center w-32 font-bold">Ngày thực hiện</th>'
                    )
                    break

            # Xử lý phần TBODY: Tìm thẻ <td> tương ứng của Ghi chú hoặc Thực tế (cột cuối)
            # Với các bảng có "ghiChu"
            match_ghi_chu = re.search(r'(<td[^>]*>[\s\S]*?(?:item\.ghiChu|item\.notes)[\s\S]*?</td>)', content)
            if match_ghi_chu:
                # Chèn SAU <td> Ghi chú
                content = content.replace(match_ghi_chu.group(1), match_ghi_chu.group(1) + "\n                            " + td_to_insert)
            else:
                # Với các bảng không có ghi chú, cột cuối là item.actual hoặc item.evaluation
                match_thuc_te = re.search(r'(<td[^>]*>[\s\S]*?(?:item\.actual)[\s\S]*?</td>)', content)
                if match_thuc_te:
                    content = content.replace(match_thuc_te.group(1), match_thuc_te.group(1) + "\n                            " + td_to_insert)

            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Đã dời cột 'Ngày thực hiện' xuống cuối: {file}")
                updated_files += 1

print(f"\n🎉 HOÀN TẤT! Đã đồng bộ vị trí thành công {updated_files} files.")
