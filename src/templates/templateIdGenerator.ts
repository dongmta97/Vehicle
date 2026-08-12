export function generateTemplateIds(template: any): any {
  // Create a deep copy to ensure we do not modify the original object
  const newTemplate = JSON.parse(JSON.stringify(template));

  if (!newTemplate.sections || !Array.isArray(newTemplate.sections)) {
    return newTemplate;
  }

  newTemplate.sections.forEach((section: any) => {
    const prefix = getPrefix(section.name);
    let counter = 1;

    if (section.items && Array.isArray(section.items)) {
      section.items.forEach((item: any) => {
        // Only generate ID if it doesn't exist
        if (!item.id) {
          item.id = `${prefix}_${counter.toString().padStart(3, '0')}`;
        }
        counter++;
      });
    }
  });

  return newTemplate;
}

function getPrefix(sectionName: string): string {
  const name = sectionName ? sectionName.toUpperCase() : '';
  
  if (name.includes('ĐỘNG CƠ')) return 'eng';
  if (name.includes('HỆ THỐNG ĐIỆN')) return 'ele';
  if (name.includes('HỆ THỐNG LÁI')) return 'str';
  if (name.includes('HỆ THỐNG PHANH')) return 'brk';
  if (name.includes('DẪN ĐỘNG LY HỢP')) return 'clt';
  if (name.includes('HỘP SỐ CHÍNH')) return 'gbx';
  if (name.includes('CARDAN')) return 'car';
  if (name.includes('DẦM CẦU TRƯỚC')) return 'fax';
  if (name.includes('CẦU SAU')) return 'rax';
  if (name.includes('HỆ THỐNG TREO')) return 'sus';
  if (name.includes('CABIN') || name.includes('THÂN XE')) return 'cab';
  if (name.includes('NỘI THẤT')) return 'int';
  if (name.includes('KHUNG XE')) return 'frm';
  if (name.includes('CẢM BIẾN')) return 'sen';
  if (name.includes('ĐIỀU HÒA')) return 'ac';
  
  return 'misc';
}
