import re

with open('src/templates/vehicleTemplates.ts', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "import AS55_URAN43206Template from './AS55_URAN43206Template.json';\n"
content = import_statement + content

content = re.sub(
    r'const rawTemplates = \[',
    'const rawTemplates = [\n  AS55_URAN43206Template,',
    content
)

with open('src/templates/vehicleTemplates.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("AS 5,5/URAN43206 template registered successfully")
