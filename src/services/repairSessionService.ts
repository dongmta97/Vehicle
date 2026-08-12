import { 
  RepairSession, 
  WorkflowState, 
  RepairForm, 
  EngineInspectionForm, 
  VehicleInspectionForm, 
  PostRepairRecord 
} from '../types';

/**
 * Helper to construct a new RepairSession in memory.
 * Does NOT read or write to Firestore or any database.
 */
export function createRepairSession(data: Partial<RepairSession> & {
  vehicleId: string;
  damageProtocolId: string;
  plateNumber: string;
}): RepairSession {
  const now = new Date().toISOString();
  return {
    id: data.id || `SESSION_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    vehicleId: data.vehicleId,
    damageProtocolId: data.damageProtocolId,
    campaignId: data.campaignId || '',
    campaignName: data.campaignName || '',
    campaignCode: data.campaignCode || '',
    repairNumber: data.repairNumber || 0, // Will be properly calculated in dbService
    repairCode: data.repairCode || "",
    openedAt: data.openedAt || now,
    closedAt: data.closedAt || null,
    plateNumber: data.plateNumber,
    vehicleName: data.vehicleName || '',
    repairLevel: data.repairLevel || '',
    workflowState: data.workflowState || WorkflowState.RECEIVED,
    status: data.status || {
      hasDamageProtocol: true,
      hasInspectionForm: false,
      hasRepairHistory: false,
      hasPostRepairRecord: false,
    },
    receiveDate: data.receiveDate || new Date().toISOString().split('T')[0],
    handoverDate: data.handoverDate || '',
    repairFormsIds: data.repairFormsIds || [],
    engineInspectionIds: data.engineInspectionIds || [],
    vehicleInspectionIds: data.vehicleInspectionIds || [],
    postRepairInspectionId: data.postRepairInspectionId ?? null,
    handoverId: data.handoverId ?? null,
    handoverTemplateCode: data.handoverTemplateCode ?? null,
    selectionTemplateCode: data.selectionTemplateCode ?? null,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    createdBy: data.createdBy || '',
    isDeleted: data.isDeleted ?? false,
  };
}

/**
 * Helper to update a RepairSession object in memory.
 * Returns a new object with updated properties.
 */
export function updateRepairSession(
  session: RepairSession,
  updates: Partial<RepairSession>
): RepairSession {
  return {
    ...session,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Helper to close a RepairSession in memory upon handover completion.
 * Sets workflowState to HANDED_OVER and updates handoverDate.
 */
export function closeRepairSession(
  session: RepairSession,
  handoverDate?: string
): RepairSession {
  const now = new Date().toISOString();
  return {
    ...session,
    workflowState: WorkflowState.HANDED_OVER,
    handoverDate: handoverDate || now.split('T')[0],
    updatedAt: now,
  };
}

/**
 * Helper to attach a repair form ID to a RepairSession in memory.
 */
export function attachRepairForm(session: RepairSession, formId: string): RepairSession {
  if (!formId || session.repairFormsIds.includes(formId)) return session;
  return {
    ...session,
    repairFormsIds: [...session.repairFormsIds, formId],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Helper to attach an engine inspection form ID to a RepairSession in memory.
 */
export function attachEngineInspection(session: RepairSession, inspectionId: string): RepairSession {
  if (!inspectionId || session.engineInspectionIds.includes(inspectionId)) return session;
  return {
    ...session,
    engineInspectionIds: [...session.engineInspectionIds, inspectionId],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Helper to attach a vehicle inspection form ID to a RepairSession in memory.
 */
export function attachVehicleInspection(session: RepairSession, inspectionId: string): RepairSession {
  if (!inspectionId || session.vehicleInspectionIds.includes(inspectionId)) return session;
  return {
    ...session,
    vehicleInspectionIds: [...session.vehicleInspectionIds, inspectionId],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Helper to attach a post-repair inspection form ID to a RepairSession in memory.
 */
export function attachPostRepairInspection(session: RepairSession, inspectionId: string): RepairSession {
  return {
    ...session,
    postRepairInspectionId: inspectionId,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Helper to attach a handover protocol ID to a RepairSession in memory.
 */
export function attachHandover(session: RepairSession, handoverId: string): RepairSession {
  return {
    ...session,
    handoverId,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Helper to find a specific RepairSession in an in-memory list.
 */
export function findRepairSession(
  sessions: RepairSession[],
  criteria: {
    sessionId?: string;
    vehicleId?: string;
    plateNumber?: string;
    activeOnly?: boolean;
  }
): RepairSession | undefined {
  return sessions.find(session => {
    if (session.isDeleted) return false;
    if (criteria.sessionId && session.id !== criteria.sessionId) return false;
    if (criteria.vehicleId && session.vehicleId !== criteria.vehicleId) return false;
    if (criteria.plateNumber && session.plateNumber !== criteria.plateNumber) return false;
    if (criteria.activeOnly && session.workflowState === WorkflowState.HANDED_OVER) return false;
    return true;
  });
}

// =========================================================================
// HELPER TỰ ĐỘNG LIÊN KẾT REPAIR SESSION KHI TẠO/CẬP NHẬT PHIẾU SỬA CHỮA
// =========================================================================

/**
 * Tự động tìm RepairSession đang OPEN theo damageProtocolId (ưu tiên) hoặc vehicleId.
 * Nếu tìm được, gán repairSessionId vào document trước khi lưu.
 * Nếu không tìm được, ghi warning log và trả về document gốc.
 */
export function findAndAttachOpenRepairSession<T extends { repairSessionId?: string; damageProtocolId?: string; vehicleId?: string; formData?: any }>(
  docData: T,
  sessions: RepairSession[],
  collectionName?: string
): T {
  if (docData.repairSessionId) {
    return docData;
  }

  const dpId = docData.damageProtocolId || docData.formData?.damageProtocolId;
  const vId = docData.vehicleId || docData.formData?.vehicleId;

  const openSessions = sessions.filter(
    s => !s.isDeleted && s.workflowState !== 'HANDED_OVER' && (s.status as any) !== 'CLOSED'
  );

  let matchedSession: RepairSession | undefined = undefined;
  // Ưu tiên damageProtocolId
  if (dpId) {
    matchedSession = openSessions.find(s => s.damageProtocolId === dpId);
  }
  // Nếu không tìm thấy hoặc không có damageProtocolId, tìm theo vehicleId
  if (!matchedSession && vId) {
    matchedSession = openSessions.find(s => s.vehicleId === vId);
  }

  if (matchedSession) {
    console.info(
      `[REPAIR_SESSION_LINK] Tự động gán repairSessionId: "${matchedSession.id}" cho ${collectionName || 'document'} (vehicleId: "${vId || 'N/A'}", damageProtocolId: "${dpId || 'N/A'}")`
    );
    return {
      ...docData,
      repairSessionId: matchedSession.id,
    };
  } else {
    console.warn(
      `[REPAIR_SESSION_LINK] Không tìm thấy RepairSession OPEN cho ${collectionName || 'document'} (vehicleId: "${vId || 'N/A'}", damageProtocolId: "${dpId || 'N/A'}"). Tiến hành lưu không có repairSessionId.`
    );
  }

  return docData;
}

// =========================================================================
// HELPER TẠO MỚI BIỂU MẪU CÓ KHẢ NĂNG NHẬN repairSessionId (IN-MEMORY ONLY)
// Note: repairSessionId sẽ là khóa liên kết chuẩn của toàn hệ thống.
// Chưa ghi Firestore, chưa thay đổi logic lưu hay UI hiện tại.
// =========================================================================

/**
 * Tạo mới mẫu RepairForm chuẩn bị khả năng nhận repairSessionId (in-memory)
 * repairSessionId sẽ là khóa liên kết chuẩn của toàn hệ thống.
 */
export function createRepairFormDoc(
  data: Partial<RepairForm> & { vehicleId: string; templateType: string },
  repairSessionId?: string
): RepairForm {
  const now = new Date().toISOString();
  return {
    id: data.id || `RF_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    vehicleId: data.vehicleId,
    templateType: data.templateType,
    // repairSessionId sẽ là khóa liên kết chuẩn của toàn hệ thống
    repairSessionId: repairSessionId || data.repairSessionId,
    createdBy: data.createdBy || '',
    createdByName: data.createdByName || '',
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    isDeleted: data.isDeleted ?? false,
    formData: data.formData || {},
  };
}

/**
 * Tạo mới mẫu EngineInspectionForm chuẩn bị khả năng nhận repairSessionId (in-memory)
 * repairSessionId sẽ là khóa liên kết chuẩn của toàn hệ thống.
 */
export function createEngineInspectionFormDoc(
  data: Partial<EngineInspectionForm> & { vehicleId: string; templateType: string },
  repairSessionId?: string
): EngineInspectionForm {
  const now = new Date().toISOString();
  return {
    id: data.id || `EIF_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    vehicleId: data.vehicleId,
    templateType: data.templateType,
    // repairSessionId sẽ là khóa liên kết chuẩn của toàn hệ thống
    repairSessionId: repairSessionId || data.repairSessionId,
    createdBy: data.createdBy || '',
    createdByName: data.createdByName || '',
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    isDeleted: data.isDeleted ?? false,
    formData: data.formData || {},
  };
}

/**
 * Tạo mới mẫu VehicleInspectionForm chuẩn bị khả năng nhận repairSessionId (in-memory)
 * repairSessionId sẽ là khóa liên kết chuẩn của toàn hệ thống.
 */
export function createVehicleInspectionFormDoc(
  data: Partial<VehicleInspectionForm> & { vehicleId: string },
  repairSessionId?: string
): VehicleInspectionForm {
  const now = new Date().toISOString();
  return {
    id: data.id || `VIF_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    vehicleId: data.vehicleId,
    templateType: data.templateType || 'MILITARY_INSPECTION',
    reportNumber: data.reportNumber || '',
    // repairSessionId sẽ là khóa liên kết chuẩn của toàn hệ thống
    repairSessionId: repairSessionId || data.repairSessionId,
    createdBy: data.createdBy || '',
    createdByName: data.createdByName || '',
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    isDeleted: data.isDeleted ?? false,
    formData: data.formData || {},
  };
}

/**
 * Tạo mới mẫu PostRepairRecord chuẩn bị khả năng nhận repairSessionId (in-memory)
 * repairSessionId sẽ là khóa liên kết chuẩn của toàn hệ thống.
 */
export function createPostRepairRecordDoc(
  data: Partial<PostRepairRecord> & { vehicleId: string; templateType: string },
  repairSessionId?: string
): PostRepairRecord {
  const now = new Date().toISOString();
  return {
    id: data.id || `PRR_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    vehicleId: data.vehicleId,
    templateType: data.templateType,
    repairRecordId: data.repairRecordId,
    // repairSessionId sẽ là khóa liên kết chuẩn của toàn hệ thống
    repairSessionId: repairSessionId || data.repairSessionId,
    createdBy: data.createdBy || '',
    createdByName: data.createdByName || '',
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    isDeleted: data.isDeleted ?? false,
    formData: data.formData || {},
  };
}
