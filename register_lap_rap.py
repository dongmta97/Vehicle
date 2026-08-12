import os

file_path = 'src/templates/vehicleTemplates.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'LapRapDongCoTemplate' not in content:
    content = "import LapRapDongCoTemplate from './LapRapDongCoTemplate.json';\n" + content
    content = content.replace(
        'export const rawTemplates = [',
        'export const rawTemplates = [\n  LapRapDongCoTemplate as any,'
    )
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Registered LapRapDongCoTemplate")
