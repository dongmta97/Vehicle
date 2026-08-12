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

