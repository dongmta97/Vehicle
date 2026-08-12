import re

file_path = 'src/components/RepairRecordsTab.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'import { ChongGiVaTaoBeMatSonForm }' not in content:
    content = 'import { ChongGiVaTaoBeMatSonForm } from "./ChongGiVaTaoBeMatSonForm";\n' + content

render_str = """
        ) : activeSubTabDef?.id === "CHONG_GI" ? (
          <ChongGiVaTaoBeMatSonForm
            vehicle={selectedVehicle}
            existingFormId={activeEngineFormId}
            initialData={engineForms.find((f) => f.id === activeEngineFormId)}
            templateName={activeSubTabDef?.label}
            stageName={activeSubTabDef?.label}
            templateType={activeSubTabDef?.id}
            onSaved={(savedForm) => {
              if (savedForm) {
                setEngineForms((prev) => {
                  const newList = [...prev];
                  const existingIdx = newList.findIndex((f) => f.id === savedForm.id);
                  if (existingIdx >= 0) {
                    newList[existingIdx] = savedForm;
                  } else {
                    newList.push(savedForm);
                  }
                  newList.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
                  return newList;
                });
              }
              loadEngineForms();
            }}
            onClose={() => setShowEngineInspectionForm(false)}
          />
"""

if 'activeSubTabDef?.id === "CHONG_GI"' not in content:
    content = content.replace(
        '        ) : activeSubTabDef?.id === "PAINT_PRE_REPAIR" ? (',
        render_str + '        ) : activeSubTabDef?.id === "PAINT_PRE_REPAIR" ? ('
    )

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("2. Tích hợp thành công vào RepairRecordsTab.tsx")
