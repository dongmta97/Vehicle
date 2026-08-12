import ToyotaInnovaTemplate from './src/templates/ToyotaInnovaTemplate.json';
import { validateVehicleTemplate } from './src/templates/validator';

const result = validateVehicleTemplate(ToyotaInnovaTemplate as any);
console.log(result.errors);
