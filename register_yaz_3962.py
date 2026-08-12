import re

with open('src/templates/vehicleTemplates.ts', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "import YAZ452_3962Template from './YAZ452_3962Template.json';\n"
content = import_statement + content

content = re.sub(
    r'const rawTemplates = \[',
    'const rawTemplates = [\n  YAZ452_3962Template,',
    content
)

with open('src/templates/vehicleTemplates.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("YAZ 3962 template registered successfully")
