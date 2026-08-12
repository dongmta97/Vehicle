import os
import glob

def fix_forms():
    files = glob.glob("src/components/*Form.tsx")
    files.append("src/components/ThuNghiemTongTheForm.tsx")
    files.append("src/components/PhieuTongLapTrangBiKyThuatForm.tsx")
    # unique it
    files = list(set(files))
    
    for f in files:
        if not os.path.exists(f): continue
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            
        # 1. Add targetSessionId to Props
        if 'interface Props {' in content and 'targetSessionId?: string;' not in content:
            content = content.replace('interface Props {\n', 'interface Props {\n  targetSessionId?: string;\n')
            
        # 2. Add targetSessionId to destructured props
        if 'const ' in content and '({ vehicle, existingFormId,' in content and 'targetSessionId' not in content:
            content = content.replace('existingFormId,', 'existingFormId, targetSessionId,')
        elif '({ vehicle, existingFormId' in content and 'targetSessionId' not in content:
             content = content.replace('existingFormId', 'existingFormId, targetSessionId')
        elif '({ existingFormId' in content and 'targetSessionId' not in content:
             content = content.replace('existingFormId', 'existingFormId, targetSessionId')
             
        # Also handle multiline props:
        if 'vehicle?: Vehicle' in content and 'targetSessionId?: string' not in content:
             content = content.replace('vehicle?: Vehicle', 'targetSessionId?: string;\n  vehicle?: Vehicle')
             
        if '  vehicle,\n  existingFormId,\n' in content and 'targetSessionId' not in content:
             content = content.replace('  existingFormId,\n', '  existingFormId,\n  targetSessionId,\n')
             
        if '  existingFormId,\n  initialData,\n' in content and 'targetSessionId' not in content:
             content = content.replace('  existingFormId,\n', '  existingFormId,\n  targetSessionId,\n')
             
        if '  vehicle,\n  existingFormId,\n  initialData,\n' in content and 'targetSessionId' not in content:
             content = content.replace('  existingFormId,\n', '  existingFormId,\n  targetSessionId,\n')

        # 3. Add repairSessionId to payload
        if 'const payload = {' in content and 'repairSessionId:' not in content:
            content = content.replace('const payload = {\n', 'const payload = {\n        repairSessionId: targetSessionId || (docExists ? existingDoc?.repairSessionId : null),\n')
            
        # 4. Same if payload is defined later
        if 'const payload = {' in content and 'repairSessionId:' not in content:
             content = content.replace('const payload = {\n', 'const payload = {\n        repairSessionId: targetSessionId || existingDoc?.repairSessionId || null,\n')

        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

fix_forms()
