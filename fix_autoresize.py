import os

filepath = 'src/components/AutoResizeTextarea.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

original = content
if 'spellCheck={false}' not in content:
    content = content.replace('      rows={1}', '      rows={1}\n      spellCheck={false}')

if content != original:
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ Đã thêm spellCheck={false} vào AutoResizeTextarea")
else:
    print("⚠️ AutoResizeTextarea đã có spellCheck={false}")
