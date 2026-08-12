import { getVehicleTemplate } from './src/templates/index';
import { validateVehicleTemplate } from './src/templates/validator';

const tpl = getVehicleTemplate('KIA 2700');
const val = validateVehicleTemplate(tpl);
console.log(val.errors);
