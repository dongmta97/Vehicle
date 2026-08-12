import { getVehicleList, getVehicleTemplate } from './src/templates/index';
import { validateVehicleTemplate } from './src/templates/validator';

console.log('Vehicle List:', getVehicleList());
console.log('---');
const fortuner = getVehicleTemplate('Toyota Fortuner');
console.log('Template Name:', fortuner.vehicleName);
console.log('Sections Count:', fortuner.sections.length);

console.log('Fortuner Valid:', validateVehicleTemplate(fortuner).valid);
