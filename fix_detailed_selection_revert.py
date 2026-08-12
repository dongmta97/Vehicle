import re

with open('src/components/DetailedSelectionProtocolForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_memo = """const activeSelectionTemplate = React.useMemo(() => {
    if (activeVehicle) {
      const match = selectionTemplates.find(
        (tpl: any) => tpl.vehicleName.toLowerCase().trim() === activeVehicle.brand?.toLowerCase().trim()
      );
      return match || selectionTemplates[0];
    }
    return selectionTemplates[0];
  }, [activeVehicle?.brand]);"""

old_state = """const [activeSelectionTemplate, setActiveSelectionTemplate] = useState<any>(selectionTemplates[0]);

  useEffect(() => {
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

content = content.replace(new_memo, old_state)

with open('src/components/DetailedSelectionProtocolForm.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Reverted activeSelectionTemplate logic")
