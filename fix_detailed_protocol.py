import re

with open('src/components/DetailedSelectionProtocolForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix activeSelectionTemplate useEffect
old_template_effect = """  useEffect(() => {
    if (activeVehicle) {
      const match = selectionTemplates.find(
        (tpl: any) => tpl.vehicleName.toLowerCase().trim() === activeVehicle.brand?.toLowerCase().trim()
      );
      if (match) {
        setActiveSelectionTemplate(match);
      } else {
         setActiveSelectionTemplate(selectionTemplates[0]);
      }
    }
  }, [activeVehicle?.brand]); // Fixed dependency"""

new_template_effect = """  useEffect(() => {
    if (activeVehicle) {
      const match = selectionTemplates.find(
        (tpl: any) => tpl.vehicleName.toLowerCase().trim() === activeVehicle.brand?.toLowerCase().trim()
      );
      if (match) {
        setActiveSelectionTemplate(match);
      } else {
         setActiveSelectionTemplate(selectionTemplates[0]);
      }
      // Reset data immediately when vehicle changes
      setFormData({});
      setDocId(null);
    }
  }, [activeVehicle?.vehicleId, activeVehicle?.brand]);"""

if old_template_effect in content:
    content = content.replace(old_template_effect, new_template_effect)
else:
    # Try generic replace
    content = re.sub(
        r"useEffect\(\(\) => \{\s*if \(activeVehicle\) \{\s*const match = selectionTemplates\.find\([\s\S]*?\}\s*\}, \[.*?\]\);",
        new_template_effect,
        content
    )


# Fix fetchForm useEffect dependencies
old_fetch_deps = "}, [selectedVehicleId, vehicle, activeSelectionTemplate]);"
new_fetch_deps = "}, [selectedVehicleId, vehicle?.vehicleId, activeSelectionTemplate?.vehicleCode]);"

content = content.replace(old_fetch_deps, new_fetch_deps)

with open('src/components/DetailedSelectionProtocolForm.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated DetailedSelectionProtocolForm.tsx")
