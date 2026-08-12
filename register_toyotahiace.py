import re
with open('src/templates/selectionTemplates.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if 'ToyotaHiaceSelection' not in content:
    content = "import ToyotaHiaceSelection from './selections/ToyotaHiaceSelection.json';\n" + content
    content = content.replace(
        'export const selectionTemplates: SelectionTemplate[] = [',
        'export const selectionTemplates: SelectionTemplate[] = [\n  ToyotaHiaceSelection as any,'
    )
    content = content.replace(
        'export const selectionTemplates = [',
        'export const selectionTemplates = [\n  ToyotaHiaceSelection,'
    )
    with open('src/templates/selectionTemplates.ts', 'w', encoding='utf-8') as f:
        f.write(content)
