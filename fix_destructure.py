import os
import glob
import re

def fix():
    files = glob.glob("src/components/*Form.tsx")
    files.append("src/components/ThuNghiemTongTheForm.tsx")
    files.append("src/components/PhieuTongLapTrangBiKyThuatForm.tsx")
    files = list(set(files))
    
    for f in files:
        if not os.path.exists(f): continue
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Look for export const <Name>: React.FC<Props> = ({ ... }) => {
        # or export const <Name> = ({ ... }: Props) => {
        
        # Let's just find "existingFormId" in the parameter list and append ", targetSessionId"
        # We need to make sure we only replace the one in the function signature.
        # usually it's in the form `({ ..., existingFormId, ... })`
        
        if 'targetSessionId' not in content:
            continue
            
        def replacer(match):
            m = match.group(0)
            if 'targetSessionId' not in m:
                return m.replace('existingFormId,', 'existingFormId, targetSessionId,')
            return m
            
        new_content = re.sub(r'\({\s*[^}]*existingFormId\b[^}]*}\)', replacer, content)
        if 'existingFormId' in new_content and 'targetSessionId' in new_content:
             # handle no trailing comma case
             def replacer2(match):
                 m = match.group(0)
                 if 'targetSessionId' not in m:
                     return m.replace('existingFormId ', 'existingFormId, targetSessionId ')
                 return m
             new_content = re.sub(r'\({\s*[^}]*existingFormId\b\s*}\)', replacer2, new_content)
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)

fix()
