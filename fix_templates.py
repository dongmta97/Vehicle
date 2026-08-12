with open('src/templates/vehicleTemplates.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
import_stmt = "import MitsubishiPajeroTemplate from './MitsubishiPajeroTemplate.json';\nimport UAZ31512Template from './UAZ31512Template.json';"
content = content.replace("import MitsubishiPajeroTemplate from './MitsubishiPajeroTemplate.json';", import_stmt)

# Add to list
list_add = "  MitsubishiPajeroTemplate,\n  UAZ31512Template\n];"
content = content.replace("  MitsubishiPajeroTemplate\n];", list_add)

with open('src/templates/vehicleTemplates.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated vehicleTemplates.ts")
