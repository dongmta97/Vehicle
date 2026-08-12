import os
import re

target_dir = 'src/components/'

for root, _, files in os.walk(target_dir):
    for file in files:
        if file.endswith('Form.tsx') and 'MilitaryInspectionForm' not in file and 'DetailedSelectionProtocolForm' not in file:
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            original_content = content

            # Remove ALL occurrences of <th>Ngày thực hiện</th>
            content = re.sub(r'<th className="border border-black px-2 py-2 text-center w-32 font-bold">Ngày thực hiện</th>\s*', '', content)
            
            # Remove ALL occurrences of <td> with type="date"
            content = re.sub(r'<td className="border border-black px-2 py-2">\s*<input\s+type="date"[\s\S]*?/>\s*</td>\s*', '', content)

            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Cleaned {file}")

