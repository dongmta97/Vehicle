import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./src/firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS = [
  'users',
  'vehicles',
  'damageProtocols',
  'vehicleInspectionForms',
  'repairHistory',
  'repairCampaigns',
  'repairSessions',
  'repairForms',
  'postRepairRecords',
  'formData'
];

async function runAudit() {
  for (const colName of COLLECTIONS) {
    const snap = await getDocs(collection(db, colName));
    console.log(`=== COLLECTION: ${colName} (${snap.docs.length} docs) ===`);

    snap.docs.forEach((doc, idx) => {
      const d = doc.data();
      console.log(`[${idx + 1}] Doc ID: ${doc.id}`);
      console.log(`    createdBy: ${d.createdBy || 'N/A'}, createdByName: ${d.createdByName || 'N/A'}, isDeleted: ${d.isDeleted}`);
      if (colName === 'repairCampaigns') {
        console.log(`    Code: ${d.campaignCode}, Name: ${d.campaignName}, Year: ${d.year}, Round: ${d.round}, Status: ${d.status}`);
      } else if (colName === 'repairSessions') {
        console.log(`    SessionCode: ${d.repairCode}, Plate: ${d.plateNumber}, Vehicle: ${d.vehicleName}, CampaignName: ${d.campaignName}, CampaignId: ${d.campaignId}`);
      } else if (colName === 'users') {
        console.log(`    User: ${d.username}, Name: ${d.fullName}, Role: ${d.role}`);
      } else if (colName === 'vehicles') {
        console.log(`    Plate: ${d.plateNumber}, Brand: ${d.brand}`);
      } else if (colName === 'damageProtocols') {
        console.log(`    ID: ${d.id || doc.id}, Plate: ${d.plateNumber || d.vehicleId}`);
      } else {
        console.log(`    JSON: ${JSON.stringify(d).substring(0, 180)}`);
      }
    });
    console.log('');
  }

  process.exit(0);
}

runAudit().catch(console.error);
