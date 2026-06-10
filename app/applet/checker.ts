import { DataService } from './src/services/dbService';

async function check() {
  try {
    const list = await DataService.load('vehicleInspectionForms');
    if (Array.isArray(list) && list.length > 0) {
      const doc = list[0]; // just grab the first one
      console.log('Doc found:', doc.vehicleName, doc.vehicleId);
      console.log('plateNumber:', doc.plateNumber ?? 'Không tồn tại');
      console.log('vehicleNumber:', doc.vehicleNumber ?? 'Không tồn tại');
      console.log('metadata.plateNumber:', doc.metadata?.plateNumber ?? 'Không tồn tại');
      console.log('vehicleId:', doc.vehicleId ?? 'Không tồn tại');
      console.log('vehicleName:', doc.vehicleName ?? 'Không tồn tại');
    } else {
      console.log('No documents found in vehicleInspectionForms.');
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

check();
