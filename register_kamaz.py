import re
with open('src/templates/selectionTemplates.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if 'KamazSelection' not in content:
    content = "import KamazSelection from './selections/KamazSelection.json';\n" + content
    content = content.replace(
        'export const selectionTemplates: SelectionTemplate[] = [',
        'export const selectionTemplates: SelectionTemplate[] = [\n  KamazSelection as any,'
    )
    content = content.replace(
        'export const selectionTemplates = [',
        'export const selectionTemplates = [\n  KamazSelection,'
    )
    with open('src/templates/selectionTemplates.ts', 'w', encoding='utf-8') as f:
        f.write(content)
