import re

with open('src/components/MilitaryInspectionForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_select = """onChange={(e) => {
                    hasUserInteracted.current = true;
                    setVehicleName(e.target.value);
                  }}"""

new_select = """onChange={(e) => {
                    hasUserInteracted.current = true;
                    setVehicleName(e.target.value);
                    // Explicitly reset form data when changing template manually
                    setFormData({});
                  }}"""

content = content.replace(old_select, new_select)

with open('src/components/MilitaryInspectionForm.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated MilitaryInspectionForm.tsx")
