import re
with open('src/templates/selectionTemplates.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if 'ChevroletSelection' not in content:
    content = "import ChevroletSelection from './selections/ChevroletSelection.json';\n" + content
    content = content.replace(
        'export const selectionTemplates: SelectionTemplate[] = [',
        'export const selectionTemplates: SelectionTemplate[] = [\n  ChevroletSelection as any,'
    )
    content = content.replace(
        'export const selectionTemplates = [',
        'export const selectionTemplates = [\n  ChevroletSelection,'
    )
    with open('src/templates/selectionTemplates.ts', 'w', encoding='utf-8') as f:
        f.write(content)
