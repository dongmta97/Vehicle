import re
with open('src/templates/selectionTemplates.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if 'FordEverestSelection' not in content:
    content = "import FordEverestSelection from './selections/FordEverestSelection.json';\n" + content
    content = content.replace(
        'export const selectionTemplates: SelectionTemplate[] = [',
        'export const selectionTemplates: SelectionTemplate[] = [\n  FordEverestSelection as any,'
    )
    content = content.replace(
        'export const selectionTemplates = [',
        'export const selectionTemplates = [\n  FordEverestSelection,'
    )
    with open('src/templates/selectionTemplates.ts', 'w', encoding='utf-8') as f:
        f.write(content)
