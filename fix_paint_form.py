import re
import os

file_path = 'src/components/PaintInspectionBeforeRepairForm.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Items
new_items = """const PAINT_INSPECTION_ITEMS = [
  { id: 1101, category: '', stt: '1', content: 'Kiểm tra vỏ xe, các mối hàn', unit: '-', requirement: 'Vỏ xe không bập bùng;\\nKhông có rỗ mọt trên toàn xe;\\nMài phẳng mối hàn.' },
  { id: 1102, category: '', stt: '2', content: 'Vệ sinh xe', unit: '-', requirement: 'Làm sạch đất, dầu mơ;\\nLàm sạch xỉ hàn.' },
  { id: 1103, category: '', stt: '3', content: 'Kiểm tra hình dáng xe', unit: '-', requirement: 'Hình dạng xe phải hài hòa, cân đối.\\nĐộ không đồng phẳng ≤1,5mm;\\nTheo mẫu xe nguyên thuỷ mà TCN qui định.' }
];"""

content = re.sub(r'const PAINT_INSPECTION_ITEMS = \[.*?\];', new_items.replace('\\', '\\\\'), content, flags=re.DOTALL)

# 2. Update Table Header and Body Rendering
new_table_content = """            <table className="w-full border-collapse border-y border-x sm:border border-stone-300 sm:border-black text-[15px]">
              <thead className="hidden sm:table-header-group">
                <tr>
                  <th className="border border-black px-2 py-2 text-center w-12 font-bold">TT</th>
                  <th className="border border-black px-2 py-2 text-center font-bold">NỘI DUNG KIỂM TRA</th>
                  <th className="border border-black px-2 py-2 text-center w-24 font-bold">Đơn vị đo</th>
                  <th className="border border-black px-2 py-2 text-center w-40 font-bold">Yêu cầu</th>
                  <th className="border border-black px-2 py-2 text-center w-48 font-bold">Thực tế</th>
                  <th className="border border-black px-2 py-2 text-center w-32 font-bold">Ngày thực hiện</th>
                  </tr>
              </thead>
              <tbody>
                {(() => {
                  let lastCategory = '';
                  return formData.items.map((item: any, index: number) => {
                    const showCategoryHeader = item.category && item.category !== lastCategory;
                    if (showCategoryHeader) {
                      lastCategory = item.category;
                    }
                    return (
                      <React.Fragment key={item.id || index}>
                        {showCategoryHeader && (
                          <tr className="bg-stone-50 print:bg-stone-100 font-bold block sm:table-row">
                            <td colSpan={5} className="border-y border-x sm:border border-stone-300 sm:border-black px-4 py-2 text-left text-[14px] mt-4 sm:mt-0 block sm:table-cell">
                              {item.category}
                            </td>
                          </tr>
                        )}
                        <tr className="flex flex-col sm:table-row hover:bg-stone-50/50 transition-colors border-b-2 sm:border-b border-stone-300 sm:border-black mb-2 sm:mb-0 h-auto sm:h-auto">
                          <td className="hidden sm:table-cell border border-black px-2 py-2 text-center">{item.stt || (index + 1)}</td>
                          <td className="border-t border-x sm:border-y-0 sm:border-l-0 sm:border-r border-stone-300 sm:border-black p-2.5 sm:px-2 font-medium bg-stone-100 sm:bg-transparent">
                            <span className="sm:hidden font-bold mr-1">{item.stt || (index + 1)}.</span>
                            {item.content}
                          </td>
                          <td className="border-x border-b sm:border border-stone-300 sm:border-black p-2 sm:p-2 flex sm:table-cell items-center justify-between bg-white sm:bg-transparent">
                            <span className="sm:hidden text-xs text-stone-500 font-medium ml-1">Đơn vị đo</span>
                            <span className="text-right sm:text-center text-stone-800 whitespace-pre-line">{item.unit}</span>
                          </td>
                          <td className="border-x border-b sm:border border-stone-300 sm:border-black p-2 flex sm:table-cell items-center justify-between bg-white sm:bg-transparent">
                            <span className="sm:hidden text-xs text-stone-500 font-medium ml-1">Yêu cầu</span>
                            <span className="text-right sm:text-center text-stone-800 font-medium sm:font-normal whitespace-pre-line">{item.requirement}</span>
                          </td>
                          <td className="border-x border-b sm:border border-stone-300 sm:border-black p-1 flex sm:table-cell flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white sm:bg-transparent">
                            <span className="sm:hidden text-xs text-stone-500 font-medium ml-2 mt-1 mb-1">Thực tế</span>
                            <AutoResizeTextarea 
                              value={typeof (item.actual || '') === 'string' ? (item.actual || '').normalize('NFC') : (item.actual || '')}
                              onChange={(e) => handleItemChange(index, e.target.value.normalize('NFC'))}
                              className="w-full h-full min-h-[36px] sm:min-h-[auto] bg-stone-50 sm:bg-transparent border border-stone-200 sm:border-transparent outline-none px-3 sm:px-2 py-2 text-left sm:text-center rounded sm:rounded-none font-bold text-stone-800 sm:text-emerald-700 print:text-black"
                            />
                          </td>
                            <td className="border border-black px-2 py-2">
                              <input 
                                type="date" 
                                className="w-full bg-transparent outline-none text-center"
                                value={typeof (item.ngayThucHien || '') === 'string' ? (item.ngayThucHien || '').normalize('NFC') : (item.ngayThucHien || '')}
                                onChange={(e) => {
                                  const newItems = [...formData.items];
                                  newItems[index].ngayThucHien = e.target.value.normalize('NFC');
                                  setFormData({ ...formData, items: newItems });
                                }}
                                
                              />
                            </td>
                            </tr>
                      </React.Fragment>
                    );
                  });
                })()}
              </tbody>
            </table>"""

content = re.sub(r'<table.*?</table>', new_table_content, content, flags=re.DOTALL)

# 3. Update Text Replacements (PHIẾU KIỂM TRA, Tổ S/C, Cụm - Công đoạn, Kết luận, Tờ số)
content = content.replace(
    '<h1 className="text-xl font-bold uppercase m-0 leading-tight mb-2">PHIẾU KIỂM TRA: Số 1</h1>',
    '<h1 className="text-xl font-bold uppercase m-0 leading-tight mb-2">PHIẾU KIỂM TRA: Số 6</h1>'
)

content = content.replace(
    '<p className="text-base m-0 leading-tight">Tổ S/C Máy, gầm</p>',
    '<p className="text-base m-0 leading-tight">Tổ S/C GCCK</p>'
)

content = content.replace(
    "const resolvedStageName = stageName || 'Kiểm tra sơn trước sửa chữa';",
    "const resolvedStageName = stageName || 'Kiểm tra sơn trước khi sửa chữa';"
)

# Fix conclusion
content = content.replace(
    "conclusion: 'Cụm sơn đã được kiểm tra đúng Quy trình công nghệ.'",
    "conclusion: 'Tình trạng sơn .....................................................đã được kiểm tra đúng Quy trình công nghệ.'"
)
content = content.replace(
    "placeholder=\"Cụm sơn đã được kiểm tra đúng Quy trình công nghệ.\"",
    "placeholder=\"Tình trạng sơn .....................................................đã được kiểm tra đúng Quy trình công nghệ.\""
)

# Tờ số is already mapped via state ? Let's check sheetNumber
content = content.replace(
    "sheetNumber: '01',",
    "sheetNumber: '01',"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Updated Paint Inspection Form")
