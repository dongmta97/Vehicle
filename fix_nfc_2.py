import os
import re

components_dir = 'src/components'
for filename in os.listdir(components_dir):
    if not filename.endswith('Form.tsx'):
        continue
    
    filepath = os.path.join(components_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    replacements = [
        ("await addDoc(collection(db, 'repairForms'), fullPayload);", "await addDoc(collection(db, 'repairForms'), normalizeNFC(fullPayload));"),
        ("await updateDoc(doc(db, 'repairForms', docId), payload);", "await updateDoc(doc(db, 'repairForms', docId), normalizeNFC(payload));"),
        ("await updateDoc(doc(db, 'repairForms', docId), updatePayload);", "await updateDoc(doc(db, 'repairForms', docId), normalizeNFC(updatePayload));"),
        ("cacheFormOffline(cachePayload);", "cacheFormOffline(normalizeNFC(cachePayload));"),
        ("dpList.push(formDoc);", "dpList.push(normalizeNFC(formDoc));"),
        ("dpList.push(damageProtocolPayload);", "dpList.push(normalizeNFC(damageProtocolPayload));")
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename} with explicit replaces")

print("✅ Đã hoàn thành xử lý 2!")
