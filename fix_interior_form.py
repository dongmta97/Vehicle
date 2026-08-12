import re
import os

file_path = 'src/components/InteriorInspectionBeforeRepairForm.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Items
new_items = """const INTERIOR_INSPECTION_ITEMS = [
  { id: 1001, category: '', stt: '1', content: 'Số lượng ghế', unit: 'Cái', requirement: 'Đầy đủ 11 ghế chính, đúng\\nmàu và qui cách, đường\\nmay chắc, đều.' },
  { id: 1002, category: '', stt: '2', content: 'Bạt xe', unit: 'Cái', requirement: 'Đầy đủ 01 bộ, căng phẳng,\\nvừa vặn, khoen cài, dây\\nbuộc phải chắc; đúng vị trí.' },
  { id: 1003, category: '', stt: '3', content: 'Táp-pi', unit: 'Bộ', requirement: 'Đủ đồng bộ theo cửa xe ,\\nphủ kín và áp sát sàn xe.' },
  { id: 1004, category: '', stt: '4', content: 'Gương chiếu hậu', unit: 'Cái', requirement: 'Đủ 02 cái, trong sáng, phản\\nchiếu rõ và xa, giá gương\\nchắc chắn.' },
  { id: 1005, category: '', stt: '5', content: 'Tấm che nắng, đệm cao su\\nghế tựa sau.', unit: 'Cái', requirement: 'Đầy đủ 02 chắn nắng' },
  { id: 1006, category: '', stt: '6', content: 'Trần xe', unit: '', requirement: 'Phẳng, không rách, sạch sẽ,\\nkín các mép.' },
];"""

content = re.sub(r'const INTERIOR_INSPECTION_ITEMS = \[.*?\];', new_items.replace('\\', '\\\\'), content, flags=re.DOTALL)

# 2. Update Table Content (whitespace-pre-line and stt)
content = content.replace(
    '<span className="text-right sm:text-center text-stone-800">{item.unit}</span>',
    '<span className="text-right sm:text-center text-stone-800 whitespace-pre-line">{item.unit}</span>'
)
content = content.replace(
    '<span className="text-right sm:text-center text-stone-800 font-medium sm:font-normal">{item.requirement}</span>',
    '<span className="text-right sm:text-center text-stone-800 font-medium sm:font-normal whitespace-pre-line">{item.requirement}</span>'
)
content = content.replace(
    '<td className="hidden sm:table-cell border border-black px-2 py-2 text-center">{index + 1}</td>',
    '<td className="hidden sm:table-cell border border-black px-2 py-2 text-center">{item.stt || (index + 1)}</td>'
)
content = content.replace(
    '<span className="sm:hidden font-bold mr-1">{index + 1}.</span>',
    '<span className="sm:hidden font-bold mr-1">{item.stt || (index + 1)}.</span>'
)
# handle whitespace pre line in content as well
content = content.replace(
    '{item.content}',
    '<span className="whitespace-pre-line">{item.content}</span>'
)

# 3. Update Title, Tổ S/C, and Conclusion
content = content.replace(
    '<h1 className="text-xl font-bold uppercase m-0 leading-tight mb-2">PHIẾU KIỂM TRA: Số 1</h1>',
    '<h1 className="text-xl font-bold uppercase m-0 leading-tight mb-2">PHIẾU KIỂM TRA: Số 5</h1>'
)

content = content.replace(
    '<p className="text-base m-0 leading-tight">Tổ S/C Máy, gầm</p>',
    '<p className="text-base m-0 leading-tight">Tổ S/C GCCK</p>'
)

content = content.replace(
    "conclusion: ''",
    "conclusion: 'Tình trạng nội thất trước khi vào sửa chữa đã được kiểm tra đúng Quy trình công nghệ.'"
)

content = content.replace(
    "placeholder=\"Nhập kết luận kiểm tra...\"",
    "placeholder=\"Tình trạng nội thất trước khi vào sửa chữa đã được kiểm tra đúng Quy trình công nghệ.\""
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Updated Interior Inspection Form")
