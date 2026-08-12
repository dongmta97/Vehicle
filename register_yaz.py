import re

with open('src/templates/vehicleTemplates.ts', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "import YAZ451_3303Template from './YAZ451_3303Template.json';\n"
content = import_statement + content

content = re.sub(
    r'const rawTemplates = \[',
    'const rawTemplates = [\n  YAZ451_3303Template,',
    content
)

with open('src/templates/vehicleTemplates.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("YAZ template registered successfully")
