import re

files = [
    'src/components/EngineComponentRepairForm.tsx',
    'src/components/LapRapDongCoForm.tsx',
    'src/components/KiemTraSauLapDongCoForm.tsx'
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix tenTBKT
    content = re.sub(
        r'value=\{formData\.tenTBKT !== undefined \? formData\.tenTBKT : formData\.vehicleName\}',
        r"value={formData.tenTBKT !== undefined ? formData.tenTBKT : (formData.vehicleName || '')}",
        content
    )
    # Fix soHieu
    content = re.sub(
        r'value=\{formData\.soHieu !== undefined \? formData\.soHieu : formData\.vehicleNumber\}',
        r"value={formData.soHieu !== undefined ? formData.soHieu : (formData.vehicleNumber || '')}",
        content
    )
    # Fix soXX
    content = re.sub(
        r'value=\{formData\.soXX !== undefined \? formData\.soXX : formData\.xxNumber1\}',
        r"value={formData.soXX !== undefined ? formData.soXX : (formData.xxNumber1 || '')}",
        content
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Fixed input values")
