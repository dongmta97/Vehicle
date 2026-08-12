import os
import re

# 1. Render-time Normalization
components_dir = 'src/components'
count = 0

for root, dirs, files in os.walk(components_dir):
    for filename in files:
        if filename.endswith('.tsx'):
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            def replace_value(match):
                inner = match.group(1).strip()
                if '.normalize' in inner:
                    return match.group(0)
                if re.match(r"^(true|false|\d+|'[^']*'|\"[^\"]*\"|`[^`]*`)$", inner):
                    return match.group(0)
                if 'typeof ' in inner:
                    return match.group(0)
                return f"value={{typeof ({inner}) === 'string' ? ({inner}).normalize('NFC') : ({inner})}}"

            # regex for value={...} where inner has no brackets
            content = re.sub(r'value=\{([^\{\}]+)\}', replace_value, content)
            
            # regex for defaultValue={...}
            def replace_default_value(match):
                inner = match.group(1).strip()
                if '.normalize' in inner:
                    return match.group(0)
                if re.match(r"^(true|false|\d+|'[^']*'|\"[^\"]*\"|`[^`]*`)$", inner):
                    return match.group(0)
                if 'typeof ' in inner:
                    return match.group(0)
                return f"defaultValue={{typeof ({inner}) === 'string' ? ({inner}).normalize('NFC') : ({inner})}}"

            content = re.sub(r'defaultValue=\{([^\{\}]+)\}', replace_default_value, content)

            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                count += 1
                print(f"Updated {filename}")

print(f"✅ Đã hoàn thành xử lý Render-time NFC cho {count} file!")

# 2. CSS Update
css_path = 'src/index.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

print_css = """
/* Tinh chỉnh chiều cao dòng cho bản in để không bị cắt chữ có dấu 2 tầng */
@media print {
  body, input, textarea, td, th, div, span, p {
    line-height: 1.5 !important;
    padding-top: 2px !important;
    padding-bottom: 2px !important;
  }
}
"""

if "padding-top: 2px !important;" not in css_content:
    with open(css_path, 'a', encoding='utf-8') as f:
        f.write(print_css)
    print("✅ Đã cập nhật CSS in ấn (line-height) vào src/index.css")
else:
    print("⚠️ CSS in ấn đã được cập nhật trước đó.")
