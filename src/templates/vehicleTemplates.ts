import LapRapDongCoTemplate from './LapRapDongCoTemplate.json';
import AS55_URAN43206Template from './AS55_URAN43206Template.json';
import YAZ452_3962Template from './YAZ452_3962Template.json';
import YAZ451_3303Template from './YAZ451_3303Template.json';
import Ural43206Template from './Ural43206Template.json';
import HyundaiCountyTemplate from './HyundaiCountyTemplate.json';
import MitsubishiZingerTemplate from './MitsubishiZingerTemplate.json';
import ToyotaFortunerTemplate from './ToyotaFortunerTemplate.json';
import Kia2700Template from './Kia2700Template.json';
import ToyotaInnovaTemplate from './ToyotaInnovaTemplate.json';
import HyundaiStarexTemplate from './HyundaiStarexTemplate.json';
import FordEscapeTemplate from './FordEscapeTemplate.json';
import HyundaiPorterTemplate from './HyundaiPorterTemplate.json';
import ToyotaPradoTemplate from './ToyotaPradoTemplate.json';
import MitsubishiPajeroTemplate from './MitsubishiPajeroTemplate.json';
import UAZ31512Template from './UAZ31512Template.json';
import { validateVehicleTemplate } from './validator';

export interface TemplateItem {
  id?: string;
  tt: number;
  name: string;
  quantity: string;
}

export interface TemplateSection {
  name: string;
  items: TemplateItem[];
}

export interface VehicleTemplate {
  id: string;
  vehicleName: string;
  vehicleCode: string;
  manufacturer: string;
  category: string;
  template: {
    templateVersion: number;
    vehicleCode: string;
    vehicleName: string;
    manufacturer: string;
    category: string;
    sections: TemplateSection[];
  };
}

// Register imported raw JSON templates with metadata here
const rawTemplates = [
  AS55_URAN43206Template,
  YAZ452_3962Template,
  YAZ451_3303Template,
  Ural43206Template,
  HyundaiCountyTemplate,
  MitsubishiZingerTemplate,
  ToyotaFortunerTemplate,
  Kia2700Template,
  ToyotaInnovaTemplate,
  HyundaiStarexTemplate,
  FordEscapeTemplate,
  HyundaiPorterTemplate,
  ToyotaPradoTemplate,
  MitsubishiPajeroTemplate,
  UAZ31512Template
];

export const vehicleTemplates: VehicleTemplate[] = rawTemplates.map((tpl: any) => ({
  id: tpl.vehicleName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  vehicleName: tpl.vehicleName,
  vehicleCode: tpl.vehicleCode,
  manufacturer: tpl.manufacturer,
  category: tpl.category,
  template: tpl
}));

// Automatically run template validation in development mode
if ((import.meta as any).env?.DEV) {
  rawTemplates.forEach((tpl: any) => {
    const res = validateVehicleTemplate(tpl);
    if (!res.valid) {
      console.warn(`[Template Validation Warning] Template "${tpl.vehicleName || 'Unknown'}" has validation errors:`, res.errors);
    } else {
      console.log(`[Template Validation Success] Template "${tpl.vehicleName}" is valid.`);
    }
  });
}

