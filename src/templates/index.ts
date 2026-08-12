import { vehicleTemplates, VehicleTemplate, TemplateItem, TemplateSection } from './vehicleTemplates';
import { selectionTemplates } from './selectionTemplates';
import { validateVehicleTemplate, ValidationError, ValidationResult } from './validator';

export type { VehicleTemplate, TemplateItem, TemplateSection, ValidationError, ValidationResult };
export { validateVehicleTemplate, vehicleTemplates, selectionTemplates };

/**
 * Extracts candidate vehicle search strings from an input object or string.
 * Priority order:
 * 1. vehicleName
 * 2. brand
 * 3. vehicleType
 */
export function extractVehicleSearchNames(input: any): string[] {
  if (!input) return [];
  if (typeof input === 'string') {
    return [input.trim()].filter(Boolean);
  }
  const names: string[] = [];
  if (typeof input === 'object') {
    if (input.vehicleName && typeof input.vehicleName === 'string') {
      names.push(input.vehicleName.trim());
    }
    if (input.brand && typeof input.brand === 'string') {
      names.push(input.brand.trim());
    }
    if (input.vehicleType && typeof input.vehicleType === 'string') {
      names.push(input.vehicleType.trim());
    }
  }
  return names.filter(Boolean);
}

/**
 * Normalizes a string for matching vehicle names/types.
 * Trims, converts to lower case, removes diacritical marks & punctuation.
 */
export function normalizeVehicleString(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compresses a string into alphanumeric characters only (no spaces/punctuation).
 */
export function compressVehicleString(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Matches a vehicle input against a list of candidate JSON template objects.
 * Strictly requires specific model match or exact match.
 * Returns null if no template exists for this vehicle type.
 */
export function matchTemplateFromCandidates(candidates: any[], vehicleInput: any): any | null {
  const searchNames = extractVehicleSearchNames(vehicleInput);
  if (searchNames.length === 0) return null;

  for (const rawName of searchNames) {
    const searchCompressed = compressVehicleString(rawName);
    const searchNormalized = normalizeVehicleString(rawName);
    if (!searchCompressed) continue;

    // 1. Exact match on compressed vehicleName or vehicleCode
    const exactMatch = candidates.find(c => {
      const cNameComp = compressVehicleString(c.vehicleName);
      const cCodeComp = compressVehicleString(c.vehicleCode);
      return cNameComp === searchCompressed || cCodeComp === searchCompressed;
    });
    if (exactMatch) return exactMatch;

    // 2. Exact match on normalized vehicleName or vehicleCode
    const normMatch = candidates.find(c => {
      const cNameNorm = normalizeVehicleString(c.vehicleName);
      const cCodeNorm = normalizeVehicleString(c.vehicleCode);
      return cNameNorm === searchNormalized || cCodeNorm === searchNormalized;
    });
    if (normMatch) return normMatch;

    // 3. Specific Sub-model Key Matching
    // UAZ model variants:
    if (searchCompressed.includes('31512')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('31512') || compressVehicleString(c.vehicleCode).includes('31512'));
      if (match) return match;
    }
    if (searchCompressed.includes('3962') || searchCompressed.includes('452')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('3962') || compressVehicleString(c.vehicleCode).includes('3962') || compressVehicleString(c.vehicleName).includes('452'));
      if (match) return match;
    }
    if (searchCompressed.includes('3303') || searchCompressed.includes('451')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('3303') || compressVehicleString(c.vehicleCode).includes('3303') || compressVehicleString(c.vehicleName).includes('451'));
      if (match) return match;
    }

    // Hyundai model variants:
    if (searchCompressed.includes('county')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('county') || compressVehicleString(c.vehicleCode).includes('county'));
      if (match) return match;
    }
    if (searchCompressed.includes('starex')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('starex') || compressVehicleString(c.vehicleCode).includes('starex'));
      if (match) return match;
    }
    if (searchCompressed.includes('porter')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('porter') || compressVehicleString(c.vehicleCode).includes('porter'));
      if (match) return match;
    }
    if (searchCompressed.includes('tucson')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('tucson') || compressVehicleString(c.vehicleCode).includes('tucson'));
      if (match) return match;
    }

    // Toyota model variants:
    if (searchCompressed.includes('fortuner')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('fortuner') || compressVehicleString(c.vehicleCode).includes('fortuner'));
      if (match) return match;
    }
    if (searchCompressed.includes('innova')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('innova') || compressVehicleString(c.vehicleCode).includes('innova'));
      if (match) return match;
    }
    if (searchCompressed.includes('prado')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('prado') || compressVehicleString(c.vehicleCode).includes('prado'));
      if (match) return match;
    }
    if (searchCompressed.includes('zace')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('zace') || compressVehicleString(c.vehicleCode).includes('zace'));
      if (match) return match;
    }
    if (searchCompressed.includes('hiace')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('hiace') || compressVehicleString(c.vehicleCode).includes('hiace'));
      if (match) return match;
    }

    // Mitsubishi model variants:
    if (searchCompressed.includes('zinger')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('zinger') || compressVehicleString(c.vehicleCode).includes('zinger'));
      if (match) return match;
    }
    if (searchCompressed.includes('pajero')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('pajero') || compressVehicleString(c.vehicleCode).includes('pajero'));
      if (match) return match;
    }

    // Ford model variants:
    if (searchCompressed.includes('escape')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('escape') || compressVehicleString(c.vehicleCode).includes('escape'));
      if (match) return match;
    }
    if (searchCompressed.includes('everest')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('everest') || compressVehicleString(c.vehicleCode).includes('everest'));
      if (match) return match;
    }

    // Ural / Uran model variants:
    if (searchCompressed.includes('as55') || searchCompressed.includes('uran')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('as55') || compressVehicleString(c.vehicleName).includes('uran') || compressVehicleString(c.vehicleCode).includes('uran'));
      if (match) return match;
    } else if (searchCompressed.includes('ural') || searchCompressed.includes('43206')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('ural') || compressVehicleString(c.vehicleCode).includes('ural'));
      if (match) return match;
    }

    // Other specific models:
    if (searchCompressed.includes('kamaz')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('kamaz') || compressVehicleString(c.vehicleCode).includes('kamaz'));
      if (match) return match;
    }
    if (searchCompressed.includes('zil') || searchCompressed.includes('131')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('zil') || compressVehicleString(c.vehicleCode).includes('zil'));
      if (match) return match;
    }
    if (searchCompressed.includes('daewoo')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('daewoo') || compressVehicleString(c.vehicleCode).includes('daewoo'));
      if (match) return match;
    }
    if (searchCompressed.includes('chevrolet') || searchCompressed.includes('captiva')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('chevrolet') || compressVehicleString(c.vehicleCode).includes('chevrolet'));
      if (match) return match;
    }
    if (searchCompressed.includes('mazda') || searchCompressed.includes('e2000')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('mazda') || compressVehicleString(c.vehicleCode).includes('mazda'));
      if (match) return match;
    }
    if (searchCompressed.includes('kia') || searchCompressed.includes('2700')) {
      const match = candidates.find(c => compressVehicleString(c.vehicleName).includes('kia') || compressVehicleString(c.vehicleCode).includes('kia'));
      if (match) return match;
    }
  }

  // If no specific model or exact match found, return null (NO wrong fallback)
  return null;
}

/**
 * Resolves Handover (Biên bản giao nhận) template for a given vehicle/session input.
 * Priority: vehicleName -> brand -> vehicleType.
 * Returns the template JSON object or null if not found.
 */
export function resolveHandoverTemplate(vehicleInput: any): any | null {
  if (!vehicleInput) return null;
  if (typeof vehicleInput === 'object' && vehicleInput.templateCode) {
    const matchByCode = vehicleTemplates.find(vt => vt.vehicleCode === vehicleInput.templateCode);
    if (matchByCode) return matchByCode.template;
  }
  
  const searchName = typeof vehicleInput === 'string' ? vehicleInput : (vehicleInput.vehicleName || vehicleInput.brand);
  if (searchName) {
    const normalizedSearch = normalizeVehicleString(searchName);
    const exactMatch = vehicleTemplates.find(vt => normalizeVehicleString(vt.vehicleName) === normalizedSearch);
    if (exactMatch) return exactMatch.template;
  }
  
  return null;
}

/**
 * Resolves Selection (Biên bản kiểm chọn) template for a given vehicle/session input.
 * Priority: templateCode -> exact vehicleName.
 * Returns the template JSON object or null if not found.
 */
export function resolveSelectionTemplate(vehicleInput: any): any | null {
  if (!vehicleInput) return null;
  if (typeof vehicleInput === 'object' && vehicleInput.templateCode) {
    const matchByCode = selectionTemplates.find((vt: any) => (vt.templateCode || vt.vehicleCode) === vehicleInput.templateCode);
    if (matchByCode) return matchByCode;
  }
  
  const searchName = typeof vehicleInput === 'string' ? vehicleInput : (vehicleInput.vehicleName || vehicleInput.brand);
  if (searchName) {
    const normalizedSearch = normalizeVehicleString(searchName);
    const exactMatch = selectionTemplates.find((vt: any) => normalizeVehicleString(vt.vehicleName) === normalizedSearch);
    if (exactMatch) return exactMatch;
  }
  
  return null;
}

/**
 * Returns the list of available vehicle names
 */
export function getVehicleList(): string[] {
  return vehicleTemplates.map(vt => vt.vehicleName);
}

/**
 * Retrieves the JSON template for a given vehicle name/input.
 * Uses resolveHandoverTemplate for smart lookup. Returns null if not found.
 */
export function getVehicleTemplate(vehicleInput: any): any | null {
  if (!vehicleInput) return null;
  return resolveHandoverTemplate(vehicleInput);
}

/**
 * Retrieves the entire VehicleTemplate object by its unique name.
 */
export function getVehicleByName(vehicleName: string): VehicleTemplate | undefined {
  if (!vehicleName) return undefined;
  const normalizedSearch = normalizeVehicleString(vehicleName);
  return vehicleTemplates.find(
    vt => normalizeVehicleString(vt.vehicleName) === normalizedSearch
  );
}

/**
 * Retrieves the entire VehicleTemplate object by its unique vehicleCode.
 */
export function getVehicleByCode(vehicleCode: string): VehicleTemplate | undefined {
  if (!vehicleCode) return undefined;
  const normalizedSearch = compressVehicleString(vehicleCode);
  return vehicleTemplates.find(
    vt => compressVehicleString(vt.vehicleCode) === normalizedSearch
  );
}

