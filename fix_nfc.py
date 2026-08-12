import os
import re

# 1. Create stringUtils.ts
utils_dir = 'src/utils'
os.makedirs(utils_dir, exist_ok=True)
string_utils_path = os.path.join(utils_dir, 'stringUtils.ts')
with open(string_utils_path, 'w', encoding='utf-8') as f:
    f.write('''export const normalizeNFC = (obj: any): any => {
  if (typeof obj === 'string') return obj.normalize('NFC');
  if (Array.isArray(obj)) return obj.map(normalizeNFC);
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = normalizeNFC(obj[key]);
    }
    return newObj;
  }
  return obj;
};
''')

# 2. Process all *Form.tsx files
components_dir = 'src/components'
for filename in os.listdir(components_dir):
    if not filename.endswith('Form.tsx'):
        continue
    
    filepath = os.path.join(components_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    if 'import { normalizeNFC }' not in content:
        # insert at the top
        content = "import { normalizeNFC } from '../utils/stringUtils';\n" + content

    # Safely wrap payloads in Firebase calls
    replacements = [
        (r"(DataService\.save\([^,]+,\s*)(payload|damageProtocolPayload|updatePayload)(\))", r"\1normalizeNFC(\2)\3"),
        (r"(DataService\.update\([^,]+,\s*[^,]+,\s*)(payload|damageProtocolPayload|updatePayload)(\))", r"\1normalizeNFC(\2)\3"),
        
        (r"(addDoc\([^,]+,\s*)(payload|fullPayload|damageProtocolPayload)(\))", r"\1normalizeNFC(\2)\3"),
        (r"(updateDoc\([^,]+,\s*)(payload|updatePayload|fullPayload)(\))", r"\1normalizeNFC(\2)\3"),

        (r"(cacheFormOffline\()(cachePayload)(\))", r"\1normalizeNFC(\2)\3"),

        (r"(dpList\.push\()(formDoc|damageProtocolPayload)(\))", r"\1normalizeNFC(\2)\3"),
    ]

    for old, new in replacements:
        content = re.sub(old, new, content)

    # Some local storage updates
    content = re.sub(r"formData:\s*formData\s*,", r"formData: normalizeNFC(formData),", content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")

print("✅ Đã hoàn thành xử lý!")
