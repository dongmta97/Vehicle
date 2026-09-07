import { RepairCampaign, CampaignStatus } from '../types';

/**
Helper tạo mới đợt sửa chữa (RepairCampaign) trong bộ nhớ (in-memory).
Chưa ghi Firestore, chưa can thiệp DB hay module khác.
 */
export function createRepairCampaign(
  data: Partial<RepairCampaign> & { campaignCode: string; campaignName: string; year: number }
): RepairCampaign {
  const now = new Date().toISOString();
  return {
    id: data.id || `CAMPAIGN_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    campaignCode: data.campaignCode,
    campaignName: data.campaignName,
    year: data.year,
    round: data.round ?? 1,
    description: data.description || '',
    startDate: data.startDate || now.split('T')[0],
    endDate: data.endDate || '',
    status: data.status || 'PLANNING',
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    createdBy: data.createdBy || '',
    isDeleted: data.isDeleted ?? false,
  };
}

/**
Helper cập nhật đợt sửa chữa (RepairCampaign) trong bộ nhớ (in-memory).
 */
export function updateRepairCampaign(
  campaign: RepairCampaign,
  updates: Partial<RepairCampaign>
): RepairCampaign {
  return {
    ...campaign,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

/**
Helper đóng đợt sửa chữa (chuyển status thành CLOSED) trong bộ nhớ (in-memory).
 */
export function closeRepairCampaign(campaign: RepairCampaign): RepairCampaign {
  return updateRepairCampaign(campaign, { status: 'CLOSED' });
}

/**
Helper mở lại đợt sửa chữa (chuyển status thành OPEN) trong bộ nhớ (in-memory).
 */
export function openRepairCampaign(campaign: RepairCampaign): RepairCampaign {
  return updateRepairCampaign(campaign, { status: 'OPEN' });
}

/**
Helper tìm kiếm đợt sửa chữa theo ID hoặc campaignCode trong danh sách in-memory.
 */
export function findRepairCampaign(
  campaigns: RepairCampaign[],
  identifier: string
): RepairCampaign | undefined {
  if (!identifier || !campaigns) return undefined;
  return campaigns.find(
    c => !c.isDeleted && (c.id === identifier || c.campaignCode === identifier)
  );
}

/**
 * Helper tra cứu tên đợt sửa chữa từ campaignId và danh sách RepairCampaign.
 * Hỗ trợ fallback từ session.campaignName đối với dữ liệu cũ (backward compatibility).
 */
export function resolveCampaignName(
  campaignId?: string | null,
  campaigns?: RepairCampaign[] | null,
  fallbackName?: string | null
): string {
  if (campaignId && campaigns && campaigns.length > 0) {
    const found = campaigns.find(c => c.id === campaignId && !c.isDeleted);
    if (found) return found.campaignName;
  }
  if (fallbackName && fallbackName.trim()) return fallbackName;
  return '';
}

/**
 * Helper xác định năm nghiệp vụ của RepairSession dựa trên RepairCampaign mà session thuộc về.
 * 
 * Thứ tự ưu tiên:
 * 1. Tìm RepairCampaign (theo session.campaignId hoặc session.campaignName). Nếu có campaign.year -> String(campaign.year)
 * 2. session.campaignYear hoặc session.year
 * 3. Trích xuất năm 4 chữ số từ session.campaignName (regex /\b(19|20)\d{2}\b/)
 * 4. Suy ra năm từ session.openedAt hoặc session.createdAt
 * 5. Fallback: "Không rõ năm" (tuyệt đối KHÔNG mặc định là "2026")
 */
export function resolveSessionYear(
  session: any,
  campaigns?: RepairCampaign[] | null
): string {
  if (!session) return "Không rõ năm";

  // ƯU TIÊN 1: Tìm RepairCampaign tương ứng
  if (campaigns && campaigns.length > 0) {
    let found = session.campaignId
      ? campaigns.find(c => c.id === session.campaignId && !c.isDeleted)
      : undefined;
    
    if (!found && session.campaignName) {
      found = campaigns.find(c => c.campaignName === session.campaignName && !c.isDeleted);
    }

    if (found && found.year && Number(found.year) > 0) {
      return String(found.year);
    }
  }

  // ƯU TIÊN 2: session.campaignYear hoặc session.year
  if (session.campaignYear && Number(session.campaignYear) > 0) {
    return String(session.campaignYear);
  }
  if (session.year && Number(session.year) > 0) {
    return String(session.year);
  }

  // ƯU TIÊN 3: Trích xuất năm 4 chữ số từ session.campaignName
  if (session.campaignName && typeof session.campaignName === 'string') {
    const match = session.campaignName.match(/\b(19|20)\d{2}\b/);
    if (match) {
      return match[0];
    }
  }

  // ƯU TIÊN 4: session.openedAt hoặc session.createdAt
  const openedYear = extractYearFromDateString(session.openedAt);
  if (openedYear) return openedYear;

  const createdYear = extractYearFromDateString(session.createdAt);
  if (createdYear) return createdYear;

  // ƯU TIÊN 5: Fallback "Không rõ năm"
  return "Không rõ năm";
}

function extractYearFromDateString(dateVal?: any): string | null {
  if (!dateVal) return null;
  try {
    let d: Date | null = null;
    if (typeof dateVal === 'string') {
      d = new Date(dateVal);
    } else if (typeof dateVal === 'number') {
      d = new Date(dateVal);
    } else if (dateVal && typeof dateVal.toDate === 'function') {
      d = dateVal.toDate();
    }
    if (d && !isNaN(d.getTime())) {
      const y = d.getFullYear();
      if (y >= 1900 && y <= 2100) return String(y);
    }
  } catch (e) {
    // ignore parse error
  }
  return null;
}


