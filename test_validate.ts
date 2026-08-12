import { validateVehicleTemplate } from './src/templates/validator';
import zinger from './src/templates/MitsubishiZingerTemplate.json';

const res = validateVehicleTemplate(zinger);
console.log('Valid:', res.valid);
if (!res.valid) console.log('Errors:', res.errors);
