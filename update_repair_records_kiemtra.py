import re

file_path = 'src/components/RepairRecordsTab.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
import_str = 'import { LapRapDongCoForm } from "./LapRapDongCoForm";\nimport { KiemTraSauLapDongCoForm } from "./KiemTraSauLapDongCoForm";\n'
content = content.replace('import { LapRapDongCoForm } from "./LapRapDongCoForm";\n', import_str)

# Add component
kiemtra_str = """        ) : activeSubTabDef?.id === "KIEM_TRA_SAU_LAP" ? (
          <KiemTraSauLapDongCoForm
            vehicle={selectedVehicle}
            existingFormId={activeEngineFormId}
            initialData={engineForms.find((f) => f.id === activeEngineFormId)}
            templateName={activeSubTabDef?.label}
            stageName={activeSubTabDef?.label}
            templateType={activeSubTabDef?.id}
            onSaved={(savedForm) => {
              if (savedForm) {
                console.log(
                  "SAVE TEMPLATE",
                  activeSubTabDef?.id,
                  savedForm.templateType
                );
                setEngineForms((prev) => {
                  const newList = [...prev];
                  const existingIdx = newList.findIndex(
                    (f) => f.id === savedForm.id,
                  );
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
            onClose={() => {
              setShowEngineInspectionForm(false);
            }}
          />
"""

content = content.replace(
    '        ) : activeSubTabDef?.id === "PAINT_PRE_REPAIR" ? (',
    kiemtra_str + '        ) : activeSubTabDef?.id === "PAINT_PRE_REPAIR" ? ('
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated RepairRecordsTab.tsx for KIEM_TRA_SAU_LAP")
