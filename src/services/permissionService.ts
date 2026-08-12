import { UserRole } from '../types';
import { permissionMatrix, ModuleKey, PermissionLevel } from '../config/permissionMatrix';

export const getModulePermission = (userRole: UserRole | string, moduleKey: ModuleKey): PermissionLevel => {
  if (!userRole || !permissionMatrix[userRole as UserRole]) {
    return 'NONE';
  }
  return permissionMatrix[userRole as UserRole][moduleKey] || 'NONE';
};

export const canViewModule = (userRole: UserRole | string, moduleKey: ModuleKey): boolean => {
  const permission = getModulePermission(userRole, moduleKey);
  return permission === 'VIEW' || permission === 'DATA_MANAGEMENT' || permission === 'FULL';
};

export const canEditModule = (userRole: UserRole | string, moduleKey: ModuleKey): boolean => {
  const permission = getModulePermission(userRole, moduleKey);
  return permission === 'DATA_MANAGEMENT' || permission === 'FULL';
};

export const canManageModuleData = (userRole: UserRole | string, moduleKey: ModuleKey): boolean => {
  const permission = getModulePermission(userRole, moduleKey);
  return permission === 'DATA_MANAGEMENT' || permission === 'FULL';
};

