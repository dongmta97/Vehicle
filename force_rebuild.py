import time

file_path = 'src/components/RepairRecordsTab.tsx'
with open(file_path, 'a', encoding='utf-8') as f:
    f.write(f'\n// Force rebuild cache: {time.time()}\n')

print("Đã chèn mã ép hệ thống biên dịch lại (Force Rebuild). Vui lòng F5 lại trình duyệt!")
