import { TemplateSection, TemplateItem } from './vehicleTemplates';

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validates a raw vehicle template JSON object.
 * Checks for required fields, array shapes, and item properties (including duplicate item IDs).
 */
export function validateVehicleTemplate(template: any): ValidationResult {
  const errors: ValidationError[] = [];

  // 1. Check Root Fields
  if (template.templateVersion === undefined || template.templateVersion === null) {
    errors.push({ path: 'root', message: 'Missing "templateVersion"' });
  } else if (typeof template.templateVersion !== 'number') {
    errors.push({ path: 'root', message: '"templateVersion" must be a number' });
  }

  if (!template.vehicleCode) {
    errors.push({ path: 'root', message: 'Missing "vehicleCode"' });
  }

  if (!template.vehicleName) {
    errors.push({ path: 'root', message: 'Missing "vehicleName"' });
  }

  if (!template.manufacturer) {
    errors.push({ path: 'root', message: 'Missing "manufacturer"' });
  }

  if (!template.category) {
    errors.push({ path: 'root', message: 'Missing "category"' });
  }

  // 2. Check Sections
  if (!template.sections) {
    errors.push({ path: 'root', message: 'Missing "sections" array' });
  } else if (!Array.isArray(template.sections)) {
    errors.push({ path: 'root', message: '"sections" must be an array' });
  } else {
    const itemIds = new Set<string>();

    template.sections.forEach((section: any, sIdx: number) => {
      const sectionPath = `sections[${sIdx}]`;

      if (!section.name) {
        errors.push({ path: sectionPath, message: 'Missing section "name"' });
      }

      if (!section.items) {
        errors.push({ path: sectionPath, message: 'Missing "items" array in section' });
      } else if (!Array.isArray(section.items)) {
        errors.push({ path: sectionPath, message: '"items" must be an array in section' });
      } else {
        section.items.forEach((item: any, iIdx: number) => {
          const itemPath = `${sectionPath}.items[${iIdx}]`;

          // Required fields for items
          if (item.tt === undefined || item.tt === null) {
            errors.push({ path: itemPath, message: 'Missing item order identifier "tt"' });
          }

          if (!item.name) {
            errors.push({ path: itemPath, message: 'Missing item "name"' });
          }

          if (item.quantity === undefined || item.quantity === null) {
            errors.push({ path: itemPath, message: 'Missing item "quantity"' });
          }

          // Optional unique ID check
          if (item.id) {
            if (itemIds.has(item.id)) {
              errors.push({ path: itemPath, message: `Duplicate item ID detected: "${item.id}"` });
            } else {
              itemIds.add(item.id);
            }
          }
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
