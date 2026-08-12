import { getVehicleList, getVehicleTemplate } from './src/templates/index';
import { validateVehicleTemplate } from './src/templates/validator';

console.log('Vehicle List:', getVehicleList());
console.log('---');

const vehicles = getVehicleList();
vehicles.forEach(vehicle => {
    const tpl = getVehicleTemplate(vehicle);
    console.log(`${vehicle} Valid:`, validateVehicleTemplate(tpl).valid);
});
