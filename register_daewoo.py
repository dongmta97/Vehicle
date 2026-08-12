import re
with open('src/templates/selectionTemplates.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if 'DaewooSelection' not in content:
    content = "import DaewooSelection from './selections/DaewooSelection.json';\n" + content
    content = content.replace(
        'export const selectionTemplates: SelectionTemplate[] = [',
        'export const selectionTemplates: SelectionTemplate[] = [\n  DaewooSelection as any,'
    )
    content = content.replace(
        'export const selectionTemplates = [',
        'export const selectionTemplates = [\n  DaewooSelection,'
    )
    with open('src/templates/selectionTemplates.ts', 'w', encoding='utf-8') as f:
        f.write(content)
