export const normalizeNFC = (obj: any): any => {
  if (typeof obj === 'string') return obj.normalize('NFC');
  if (Array.isArray(obj)) return obj.map(normalizeNFC);
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = normalizeNFC(obj[key]);
    }
    return newObj;
  }
  return obj;
};
