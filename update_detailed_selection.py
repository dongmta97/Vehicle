import os
import re

filepath = 'src/components/DetailedSelectionProtocolForm.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the headers
content = content.replace(
    '<th className="border border-black p-2 font-bold text-center print:border-black">S/C</th>\n                  <th className="border border-black p-2 font-bold text-center print:border-black">Dùng lại</th>',
    '<th className="border border-black p-2 font-bold text-center print:border-black">S/C Dùng lại</th>'
)

# 2. Update colSpan=8 to colSpan=7
content = content.replace(
    '<td colSpan={8} className="border-y border-x sm:border border-stone-300 sm:border-black',
    '<td colSpan={7} className="border-y border-x sm:border border-stone-300 sm:border-black'
)

# 3. Update the td for repair and remove reuse
td_to_remove = """                         <td className="py-1.5 px-2 sm:p-1 text-center bg-white sm:bg-transparent border-x border-b sm:border border-stone-300 sm:border-black flex sm:table-cell items-center justify-between print:border-black">
                           <span className="sm:hidden text-xs text-stone-500 font-medium ml-1">Dùng lại</span>
                           <input 
                             type="number" min="0" placeholder="0"
                             className="w-20 sm:w-full h-8 px-1 text-center bg-white sm:bg-transparent border border-stone-300 sm:border-transparent hover:border-stone-800 focus:border-stone-800 focus:bg-white sm:focus:bg-emerald-50 focus:outline-none cursor-pointer rounded px-2 sm:px-1 py-1.5 sm:py-0 print:border-none print:bg-transparent print:p-0 print:h-auto print:appearance-none print:text-black" 
                             value={typeof (formData[key]?.reuse || '') === 'string' ? (formData[key]?.reuse || '').normalize('NFC') : (formData[key]?.reuse || '')}
                             onChange={(e) => handleInputChange(sectionIndex, itemIndex, 'reuse', e.target.value.normalize('NFC'))}
                           />
                         </td>"""

content = content.replace(td_to_remove, "")

# 4. Update the hidden label from S/C Dlại to S/C Dùng lại
content = content.replace(
    '<span className="sm:hidden text-xs text-stone-500 font-medium ml-1">S/C Dlại</span>',
    '<span className="sm:hidden text-xs text-stone-500 font-medium ml-1">S/C Dùng lại</span>'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated DetailedSelectionProtocolForm.tsx")
