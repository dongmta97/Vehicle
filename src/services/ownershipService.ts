import { ModuleKey } from '../config/permissionMatrix';
import { getModulePermission } from './permissionService';

export const isDocumentOwner = (
  currentUser: any,
  document: any
): boolean => {
  if (!currentUser || !document) return false;

  // Newly initialized documents without createdBy
  if (!document.createdBy && !document.id) {
    return true;
  }

  const uid = currentUser.uid;
  const username = currentUser.username;
  const fullName = currentUser.fullName;

  return (
    (uid && document.createdBy === uid) ||
    (username && document.createdBy === username) ||
    (fullName && document.createdByName === fullName)
  );
};

export const inferModuleKey = (document: any): ModuleKey | null => {
  if (!document) return null;
  if (document.moduleKey) return document.moduleKey as ModuleKey;

  const type = String(document.templateType || document.type || document.templateCode || '').toUpperCase();
  if (!type) return null;

  if (type === 'RECEPTION_PROTOCOL' || type === 'RECEPTION') return 'RECEPTION';
  if (type === 'CAMPAIGN' || type === 'REPAIR_CAMPAIGN') return 'CAMPAIGN';
  if (type === 'DAMAGE_PROTOCOL' || type === 'MILITARY_INSPECTION' || type.includes('INSPECTION') || type.endsWith('_PRE_REPAIR')) {
    return 'INSPECTION';
  }
  if (type.endsWith('_POST_REPAIR') || type.includes('POST_REPAIR') || type.includes('SAU_SUA_CHUA') || type.includes('TONG_LAP')) {
    return 'POST_REPAIR';
  }
  if (type === 'HANDOVER_PROTOCOL' || type === 'HANDOVER') return 'HANDOVER';
  if (type === 'OPERATIONS' || type.startsWith('TASK_')) return 'OPERATIONS';

  if (
    type.includes('DISASSEMBLY') ||
    type.includes('REPAIR') ||
    type.includes('CLEANING') ||
    type.includes('ASSEMBLY') ||
    type.includes('PAINT') ||
    type.includes('SON') ||
    type.includes('GAM') ||
    type.includes('DIEN') ||
    type.includes('DONG_CO')
  ) {
    return 'REPAIR';
  }

  return null;
};

export const canEditDocument = (
  currentUser: any,
  document: any,
  moduleKey?: ModuleKey
): boolean => {
  if (!currentUser || !currentUser.role) return false;

  if (currentUser.role === 'admin') {
    return true;
  }

  if (currentUser.role === 'quan_ly_cap_tren') {
    return false;
  }

  const key = moduleKey || inferModuleKey(document);

  if (key) {
    const permLevel = getModulePermission(currentUser.role, key);
    if (permLevel === 'FULL') {
      return true;
    }
    if (permLevel === 'DATA_MANAGEMENT') {
      return isDocumentOwner(currentUser, document);
    }
    return false;
  }

  return isDocumentOwner(currentUser, document);
};

export const canDeleteDocument = (
  currentUser: any,
  document: any,
  moduleKey?: ModuleKey
): boolean => {
  return canEditDocument(currentUser, document, moduleKey);
};


