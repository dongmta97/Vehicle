import re

with open('src/templates/selectionTemplates.ts', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "import UAZ3303Selection from './selections/UAZ3303Selection.json';\n"
content = import_statement + content

content = re.sub(
    r'export const selectionTemplates: SelectionTemplate\[\] = \[',
    'export const selectionTemplates: SelectionTemplate[] = [\n  UAZ3303Selection as any,',
    content
)

with open('src/templates/selectionTemplates.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("UAZ 3303 selection template registered successfully")
