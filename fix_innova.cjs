const fs = require('fs');

const path = 'src/templates/ToyotaInnovaTemplate.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Filter out items with empty names
data.sections.forEach(section => {
  section.items = section.items.filter(item => item.name !== "");
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
console.log('Fixed Toyota Innova items:', data.sections.reduce((acc, sec) => acc + sec.items.length, 0));
