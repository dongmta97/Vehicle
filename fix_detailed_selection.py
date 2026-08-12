import re

with open('src/components/DetailedSelectionProtocolForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace activeSelectionTemplate state and useEffect with useMemo
old_state = r"const \[activeSelectionTemplate, setActiveSelectionTemplate\] = useState<any>\(selectionTemplates\[0\]\);\s*useEffect\(\(\) => \{\s*if \(activeVehicle\) \{\s*const match = selectionTemplates\.find\(\s*\(tpl: any\) => tpl\.vehicleName\.toLowerCase\(\)\.trim\(\) === activeVehicle\.brand\?\.toLowerCase\(\)\.trim\(\)\s*\);\s*if \(match\) \{\s*setActiveSelectionTemplate\(match\);\s*\} else \{\s*setActiveSelectionTemplate\(selectionTemplates\[0\]\);\s*\}\s*\}\s*\}, \[activeVehicle\]\);"

new_memo = """const activeSelectionTemplate = React.useMemo(() => {
    if (activeVehicle) {
      const match = selectionTemplates.find(
        (tpl: any) => tpl.vehicleName.toLowerCase().trim() === activeVehicle.brand?.toLowerCase().trim()
      );
      return match || selectionTemplates[0];
    }
    return selectionTemplates[0];
  }, [activeVehicle?.brand]);"""

content = re.sub(old_state, new_memo, content)

with open('src/components/DetailedSelectionProtocolForm.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated activeSelectionTemplate logic in DetailedSelectionProtocolForm.tsx")
