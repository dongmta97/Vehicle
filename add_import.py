import re

with open('src/templates/vehicleTemplates.ts', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "import Ural43206Template from './Ural43206Template.json';\n"
content = import_statement + content

content = re.sub(
    r'const rawTemplates = \[',
    'const rawTemplates = [\n  Ural43206Template,',
    content
)

with open('src/templates/vehicleTemplates.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Import added successfully")
