import { dbService } from './src/services/dbService';

async function check() {
  try {
    const vehiclesList = await dbService.getAllVehicles();
    const formsList = await dbService.getAllVehicleInspectionForms();
    
    console.log("=== vehicleInspectionForms ===");
    const forms = Array.isArray(formsList) ? formsList : [];
    const firstForm = forms.find((f: any) => !f.isDeleted);
    console.log("Form:", firstForm ? {
      docId: firstForm.docId,
      vehicleId: firstForm.vehicleId,
      vehicleName: firstForm.vehicleName
    } : "No forms");

    console.log("\n=== savedVehicles ===");
    const vehicles = Array.isArray(vehiclesList) ? vehiclesList : [];
    
    if (firstForm) {
      const match1 = vehicles.find((v: any) => v.vehicleId === firstForm.vehicleId);
      const match2 = vehicles.find((v: any) => v.id === firstForm.vehicleId);
      
      console.log("Tìm theo v.vehicleId === form.vehicleId:", match1 ? {
        vehicleId: match1.vehicleId,
        id: match1.id,
        plateNumber: match1.plateNumber
      } : "undefined");
      
      console.log("Tìm theo v.id === form.vehicleId:", match2 ? {
        vehicleId: match2.vehicleId,
        id: match2.id,
        plateNumber: match2.plateNumber
      } : "undefined");
      
      const county = vehicles.find((v: any) => v.brand === 'Hyundai County');
      console.log("Hyundai County:", county ? {
        vehicleId: county.vehicleId,
        id: county.id,
        plateNumber: county.plateNumber
      } : "undefined");
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

check();
