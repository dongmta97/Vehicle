/**
 * Shared Type Definitions for repair vehicles and histories
 */

export type UserRole = 'admin' | 'pho_dai_doi_truong' | 'trung_doi_truong' | 'to_truong' | 'kcs' | 'tro_ly_ky_thuat' | 'quan_ly_cap_tren';

export interface User {
  uid: string;
  username: string;
  fullName: string;
  rank: string;
  unit: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  password?: string;
  _firestoreDocId?: string;
}

export interface Vehicle {
  vehicleId: string;
  plateNumber: string;
  brand: string;
  vehicleType: string;
  vehicleGroup: string;
  chassisNumber: string;
  engineNumber: string;
  createdBy?: string;
  createdByName?: string;
  createdByRank?: string;
  createdByUnit?: string;
  createdByRole?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedAt?: string;
}

export type TechnicalStatus = string;

export interface RepairHistory {
  historyId: string;
  vehicleId: string;
  reportNumber: string;
  receiveDate: string;
  giver: string;
  receiver: string;
  engineStatus: TechnicalStatus;
  electricalStatus: TechnicalStatus;
  chassisStatus: TechnicalStatus;
  bodyStatus: TechnicalStatus;
  cushionStatus: TechnicalStatus;
  tireBatteryStatus: TechnicalStatus;
  specialEquipmentStatus: TechnicalStatus;
  accessoryStatus: TechnicalStatus;
  paintStatus: TechnicalStatus;
  note: string;
  unitComment: string;
  createdAt: string; // ISO String stored client side or timestamp parsed to string
  createdBy?: string;
  createdByName?: string;
  createdByRank?: string;
  createdByUnit?: string;
  createdByRole?: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedAt?: string;
}

export interface TechnicalSections {
  engineStatus: string;
  electricalStatus: string;
  chassisStatus: string;
  bodyStatus: string;
  cushionStatus: string;
  tireBatteryStatus: string;
  specialEquipmentStatus: string;
  accessoryStatus: string;
  paintStatus: string;
}

export interface DamageItem {
  id: string;
  itemName: string;     // Tên cụm, chi tiết hư hỏng
  damageDetail: string; // Hiện trạng hư hỏng cụ thể, chi tiết
  solution: string;     // Biện pháp đề xuất khắc phục
}

export interface DamageProtocol {
  protocolId: string;
  vehicleId: string;
  /** repairSessionId sẽ là khóa liên kết chuẩn của toàn hệ thống */
  repairSessionId?: string;
  reportNumber: string; // Số hiệu biên bản
  createdDate: string;  // Ngày lập
  place: string;        // Địa điểm lập
  representativeGeneral: string;     // Đại diện Ban Chỉ huy / Trạm trưởng
  representativeTechnical: string;   // Đại diện Ban Kỹ thuật
  technician: string;                // Thợ sửa chữa phụ trách
  driver: string;                    // Lái xe / Trưởng xe
  plateNumber: string;               // Biển số đăng ký
  brand: string;                     // Nhãn hiệu nhãn mác
  vehicleType: string;               // Loại xe
  chassisNumber: string;             // Số khung
  engineNumber: string;              // Số máy
  odometer: string;                  // Số km xe chạy (Odometer)
  items: DamageItem[];               // Danh sách cụm chi tiết lỗi hỏng
  conclusion: string;                // Kết luận chung của hội đồng
  createdAt: string;                 // ISO String
  createdBy?: string;
  createdByName?: string;
  createdByRank?: string;
  createdByUnit?: string;
  createdByRole?: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedAt?: string;
  lastEditedBy?: string;
}

export const TECHNICAL_SECTIONS_LABEL: { [key in keyof TechnicalSections]: string } = {
  engineStatus: "Hệ thống động cơ",
  electricalStatus: "Hệ thống điện",
  chassisStatus: "Hệ thống gầm",
  bodyStatus: "Thân xe/thùng bệ",
  cushionStatus: "Đệm bạt",
  tireBatteryStatus: "Săm lốp/bình điện",
  specialEquipmentStatus: "Phần đặc chủng",
  accessoryStatus: "Dụng cụ phụ kiện",
  paintStatus: "Phần sơn"
};

export interface PostRepairRecord {
  id: string;
  templateType: string;
  vehicleId: string;
  repairRecordId?: string; // Links to the repair history/session record
  /** repairSessionId sẽ là khóa liên kết chuẩn của toàn hệ thống */
  repairSessionId?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  formData: Record<string, any>;
}

/**
 * Interface cho các biểu mẫu sửa chữa (repairForms)
 */
export interface RepairForm {
  id: string;
  templateType: string;
  vehicleId: string;
  /** repairSessionId sẽ là khóa liên kết chuẩn của toàn hệ thống */
  repairSessionId?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  formData: Record<string, any>;
}

/**
 * Interface cho các phiếu kiểm tra động cơ / chi tiết trước sửa chữa (engineInspectionForms)
 */
export interface EngineInspectionForm {
  id: string;
  templateType: string;
  vehicleId: string;
  /** repairSessionId sẽ là khóa liên kết chuẩn của toàn hệ thống */
  repairSessionId?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  formData: Record<string, any>;
}

/**
 * Interface cho các biên bản kiểm tra quân sự / xe (vehicleInspectionForms)
 */
export interface VehicleInspectionForm {
  id: string;
  templateType?: string;
  vehicleId: string;
  reportNumber?: string;
  /** repairSessionId sẽ là khóa liên kết chuẩn của toàn hệ thống */
  repairSessionId?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  formData: Record<string, any>;
}

export interface RepairDossier {
  id: string;
  vehicleId: string;
  damageProtocolId: string;
  plateNumber: string;
  vehicleName: string;
  repairLevel: string;
  workflowState: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  isDeleted: boolean;
}

export enum WorkflowState {
  REGISTERED = 'REGISTERED',
  RECEIVED = 'RECEIVED',
  REPAIRING = 'REPAIRING',
  INSPECTED = 'INSPECTED',
  HANDED_OVER = 'HANDED_OVER'
}

export interface RepairSession {
  id: string;
  vehicleId: string;
  damageProtocolId: string;
  campaignId?: string;
  campaignName?: string;
  campaignCode?: string;
  repairNumber: number;
  repairCode: string;
  openedAt: string;
  closedAt: string | null;
  plateNumber: string;
  vehicleName: string;
  repairLevel: string;
  workflowState: WorkflowState | string;
  status: any;
  receiveDate: string;
  handoverDate: string;
  repairFormsIds: string[];
  engineInspectionIds: string[];
  vehicleInspectionIds: string[];
  postRepairInspectionId: string | null;
  handoverId: string | null;
  handoverTemplateCode?: string | null;
  selectionTemplateCode?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isDeleted: boolean;
}

export type CampaignStatus = 'PLANNING' | 'OPEN' | 'CLOSED';

export interface RepairCampaign {
  id: string;
  campaignCode: string;
  campaignName: string;
  year: number;
  round?: number | string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isDeleted: boolean;
}

export interface TaskItem {
  id: number | string;
  date: string;
  content: string;
  assignedTo: string;
  performer?: string;
}

export type TaskPlanItem = TaskItem;
export type TaskReportItem = TaskItem;


