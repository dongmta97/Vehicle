import json

with open('src/templates/Ural43206Template.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['manufacturer'] = 'Ural'
data['category'] = 'Ô tô tải'

with open('src/templates/Ural43206Template.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Ural43206 template fixed successfully")
