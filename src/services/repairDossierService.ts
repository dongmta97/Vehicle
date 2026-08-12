import { RepairDossier } from '../types';

/**
 * Helper to construct a RepairDossier object in memory.
 * Does NOT write to Firestore or any database.
 */
export function createRepairDossier(data: Partial<RepairDossier> & {
  vehicleId: string;
  damageProtocolId: string;
  plateNumber: string;
}): RepairDossier {
  const now = new Date().toISOString();
  return {
    id: data.id || `DOSSIER_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    vehicleId: data.vehicleId,
    damageProtocolId: data.damageProtocolId,
    plateNumber: data.plateNumber,
    vehicleName: data.vehicleName || '',
    repairLevel: data.repairLevel || '',
    workflowState: data.workflowState || 'RECEIVED',
    createdAt: data.createdAt || now,
    createdBy: data.createdBy || '',
    updatedAt: data.updatedAt || now,
    isDeleted: data.isDeleted ?? false,
  };
}
