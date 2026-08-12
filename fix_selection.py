import re
with open('src/templates/selectionTemplates.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if 'UAZ3303Selection,' not in content:
    content = content.replace(
        'export const selectionTemplates = [',
        'export const selectionTemplates = [\n  UAZ3303Selection,'
    )
    with open('src/templates/selectionTemplates.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Đã thêm UAZ 3303 vào selectionTemplates.ts")
else:
    print("Xe đã tồn tại trong file.")
