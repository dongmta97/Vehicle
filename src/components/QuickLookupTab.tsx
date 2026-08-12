import React, { useState, useEffect } from 'react';
import { DataService } from '../firebase';
import { Circle, Inbox, Wrench, ClipboardCheck, CheckCircle2, ChevronDown, ChevronRight, FileText, AlertTriangle } from 'lucide-react';
import { resolveCampaignName } from '../services/repairCampaignService';
import { RepairSession } from '../types';

export const normalizePlate = (plate?: string): string => {
  if (!plate) return '';
  return plate
    .trim()
    .toUpperCase()
    .replace(/[\s\-\.]/g, '');
};

export interface OpenRecordRequest {
  module: 'INSPECTION' | 'REPAIR_RECORDS' | 'POST_REPAIR_RECORDS';
  formType?: 'DAMAGE_PROTOCOL' | 'REPAIR_HISTORY' | 'POST_REPAIR_INSPECTION' | 'POST_REPAIR_HANDOVER' | string;
  recordId: string;
  repairSessionId?: string;
}

export const mapWorkflowStateText = (state?: string): string => {
  switch (state) {
    case 'REGISTERED':
      return 'Đã đăng ký';
    case 'RECEIVED':
      return 'Đã tiếp nhận';
    case 'REPAIRING':
      return 'Đang sửa chữa';
    case 'INSPECTED':
      return 'Đã kiểm tra hợp cách';
    case 'HANDED_OVER':
      return 'Đã bàn giao';
    default:
      return state || '—';
  }
};

export interface WorkflowStateStyle {
  label: string;
  badgeClass: string;
  icon: React.ReactNode;
}

export const getWorkflowStateStyle = (state?: string): WorkflowStateStyle => {
  switch (state) {
    case 'REGISTERED':
      return {
        label: 'Đã đăng ký',
        badgeClass: 'bg-stone-100 text-stone-700 border border-stone-300',
        icon: <Circle className="w-3 h-3 mr-1 inline-block shrink-0" />,
      };
    case 'RECEIVED':
      return {
        label: 'Đã tiếp nhận',
        badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
        icon: <Inbox className="w-3 h-3 mr-1 inline-block shrink-0" />,
      };
    case 'REPAIRING':
      return {
        label: 'Đang sửa chữa',
        badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
        icon: <Wrench className="w-3 h-3 mr-1 inline-block shrink-0" />,
      };
    case 'INSPECTED':
      return {
        label: 'Đã kiểm tra hợp cách',
        badgeClass: 'bg-purple-100 text-purple-800 border border-purple-200',
        icon: <ClipboardCheck className="w-3 h-3 mr-1 inline-block shrink-0" />,
      };
    case 'HANDED_OVER':
      return {
        label: 'Đã bàn giao',
        badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        icon: <CheckCircle2 className="w-3 h-3 mr-1 inline-block shrink-0" />,
      };
    default:
      return {
        label: state || '—',
        badgeClass: 'bg-stone-100 text-stone-700 border border-stone-300',
        icon: <Circle className="w-3 h-3 mr-1 inline-block shrink-0" />,
      };
  }
};

const formatDate = (val?: any): string => {
  if (!val) return '—';
  if (typeof val === 'string') {
    if (val.trim() === '') return '—';
    if (val.includes('/') || val.length <= 10) return val;
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch {}
    return val;
  }
  if (typeof val === 'object' && val.seconds) {
    const d = new Date(val.seconds * 1000);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return '—';
};

const formatHandoverDate = (session: RepairSession, matchedHandover?: any): string => {
  if (session.workflowState === 'HANDED_OVER' || session.closedAt || session.handoverDate || matchedHandover) {
    const raw = session.handoverDate || session.closedAt || matchedHandover?.handoverDate || matchedHandover?.createdAt;
    if (raw) return formatDate(raw);
  }
  return 'Chưa bàn giao';
};

export interface QuickLookupTabProps {
  onOpenRecord?: (request: OpenRecordRequest) => void;
  selectedRepairSession?: RepairSession | null;
  onSelectRepairSession?: (s: RepairSession | null) => void;
}

export interface SessionDetailItem {
  session: RepairSession;
  repairNumber: number;
  campaignName: string;
  campaignCode: string;
  receiveDate: string;
  handoverDate: string;
  workflowState: string;
  documents: {
    damageProtocol: any | null;
    vehicleInspection: any | null;
    repairHistory: any | null;
    repairFormsCount: number;
    firstRepairFormId?: string | null;
    postRepairInspection: any | null;
    postRepairHandover: any | null;
  };
}

export interface UnassignedRecords {
  damageProtocols: any[];
  repairHistories: any[];
  postRepairRecords: any[];
  hasOrphans: boolean;
}

export function QuickLookupTab({ onOpenRecord, selectedRepairSession, onSelectRepairSession }: QuickLookupTabProps) {
  const [searchPlate, setSearchPlate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [vehicleHeader, setVehicleHeader] = useState<{
    plateNumber: string;
    vehicleName: string;
    vehicleType: string;
    vehicleGroup: string;
    chassisNumber: string;
    engineNumber: string;
    receiverUnit: string;
    totalSessions: number;
  } | null>(null);

  const [sessionResults, setSessionResults] = useState<SessionDetailItem[]>([]);
  const [unassignedRecords, setUnassignedRecords] = useState<UnassignedRecords>({
    damageProtocols: [],
    repairHistories: [],
    postRepairRecords: [],
    hasOrphans: false
  });

  const [expandedSessionIds, setExpandedSessionIds] = useState<Record<string, boolean>>({});

  // Function to load all lookup datasets (Firestore + LocalStorage, filtered isDeleted)
  const loadLookupData = async () => {
    try {
      // 1. Vehicles
      const dbVehicles = (await DataService.load('vehicles')) || [];
      let localVehicles: any[] = [];
      try {
        const str1 = localStorage.getItem('local_vehicles');
        const str2 = localStorage.getItem('vehicles');
        localVehicles = JSON.parse(str1 || str2 || '[]');
        if (!Array.isArray(localVehicles)) localVehicles = [];
      } catch {}
      const combinedVehicles = [...dbVehicles];
      localVehicles.forEach((lv: any) => {
        const keyLV = lv.vehicleId || lv.id;
        const idx = combinedVehicles.findIndex((cv: any) => (cv.vehicleId || cv.id) === keyLV);
        if (idx === -1) {
          combinedVehicles.push(lv);
        } else if (new Date(lv.updatedAt || 0).getTime() > new Date(combinedVehicles[idx].updatedAt || 0).getTime()) {
          combinedVehicles[idx] = lv;
        }
      });
      const cleanVehicles = combinedVehicles.filter((v: any) => v && v.isDeleted !== true);

      // 2. DamageProtocols
      const dbDamageProtocols = (await DataService.load('damageProtocols')) || [];
      let localDamageProtocols: any[] = [];
      try {
        const str1 = localStorage.getItem('local_damage_protocols');
        const str2 = localStorage.getItem('local_damageProtocols');
        localDamageProtocols = JSON.parse(str1 || str2 || '[]');
        if (!Array.isArray(localDamageProtocols)) localDamageProtocols = [];
      } catch {}
      const combinedDPs = [...dbDamageProtocols];
      localDamageProtocols.forEach((lp: any) => {
        const keyLP = lp.protocolId || lp.id;
        const idx = combinedDPs.findIndex((cp: any) => (cp.protocolId || cp.id) === keyLP);
        if (idx === -1) {
          combinedDPs.push(lp);
        } else if (new Date(lp.updatedAt || 0).getTime() > new Date(combinedDPs[idx].updatedAt || 0).getTime()) {
          combinedDPs[idx] = lp;
        }
      });
      const cleanDamageProtocols = combinedDPs.filter((p: any) => p && p.isDeleted !== true);

      // 3. RepairHistory
      const dbRepairHistory = (await DataService.load('repairHistory')) || [];
      let localRepairHistory: any[] = [];
      try {
        const str1 = localStorage.getItem('local_repair_history');
        localRepairHistory = JSON.parse(str1 || '[]');
        if (!Array.isArray(localRepairHistory)) localRepairHistory = [];
      } catch {}
      const combinedRH = [...dbRepairHistory];
      localRepairHistory.forEach((lh: any) => {
        const keyLH = lh.historyId || lh.id;
        const idx = combinedRH.findIndex((ch: any) => (ch.historyId || ch.id) === keyLH);
        if (idx === -1) {
          combinedRH.push(lh);
        } else if (new Date(lh.updatedAt || 0).getTime() > new Date(combinedRH[idx].updatedAt || 0).getTime()) {
          combinedRH[idx] = lh;
        }
      });
      const cleanRepairHistory = combinedRH.filter((h: any) => h && h.isDeleted !== true);

      // 4. PostRepairRecords
      const dbPostRepairRecords = (await DataService.load('postRepairRecords')) || [];
      let localPostRepairRecords: any[] = [];
      try {
        const str1 = localStorage.getItem('local_postRepairRecords');
        localPostRepairRecords = JSON.parse(str1 || '[]');
        if (!Array.isArray(localPostRepairRecords)) localPostRepairRecords = [];
      } catch {}
      const combinedPRR = [...dbPostRepairRecords];
      localPostRepairRecords.forEach((lp: any) => {
        const keyLP = lp.id;
        const idx = combinedPRR.findIndex((cp: any) => cp.id === keyLP);
        if (idx === -1) {
          combinedPRR.push(lp);
        } else if (new Date(lp.updatedAt || 0).getTime() > new Date(combinedPRR[idx].updatedAt || 0).getTime()) {
          combinedPRR[idx] = lp;
        }
      });
      const cleanPostRepairRecords = combinedPRR.filter((r: any) => r && r.isDeleted !== true);

      // 5. VehicleInspectionForms
      const dbInspectionForms = (await DataService.load('vehicleInspectionForms')) || [];
      let localInspectionForms: any[] = [];
      try {
        const str = localStorage.getItem('local_vehicleInspectionForms');
        localInspectionForms = JSON.parse(str || '[]');
        if (!Array.isArray(localInspectionForms)) localInspectionForms = [];
      } catch {}
      const combinedIF = [...dbInspectionForms];
      localInspectionForms.forEach((li: any) => {
        const idx = combinedIF.findIndex((ci: any) => ci.id === li.id);
        if (idx === -1) combinedIF.push(li);
      });
      const cleanInspectionForms = combinedIF.filter((f: any) => f && f.isDeleted !== true);

      // 6. RepairSessions
      const dbRepairSessions = (await DataService.load('repairSessions')) || [];
      let localRepairSessions: any[] = [];
      try {
        const str1 = localStorage.getItem('local_repairSessions');
        localRepairSessions = JSON.parse(str1 || '[]');
        if (!Array.isArray(localRepairSessions)) localRepairSessions = [];
      } catch {}
      const combinedRS = [...dbRepairSessions];
      localRepairSessions.forEach((ls: any) => {
        const keyLS = ls.id;
        const idx = combinedRS.findIndex((cs: any) => cs.id === keyLS);
        if (idx === -1) {
          combinedRS.push(ls);
        } else if (new Date(ls.updatedAt || 0).getTime() > new Date(combinedRS[idx].updatedAt || 0).getTime()) {
          combinedRS[idx] = ls;
        }
      });
      const cleanRepairSessions = combinedRS.filter((s: any) => s && s.isDeleted !== true);

      // 7. RepairCampaigns
      const dbRepairCampaigns = (await DataService.load('repairCampaigns')) || [];
      let localRepairCampaigns: any[] = [];
      try {
        const str1 = localStorage.getItem('local_repairCampaigns');
        localRepairCampaigns = JSON.parse(str1 || '[]');
        if (!Array.isArray(localRepairCampaigns)) localRepairCampaigns = [];
      } catch {}
      const combinedRC = [...dbRepairCampaigns];
      localRepairCampaigns.forEach((lc: any) => {
        const keyLC = lc.id;
        const idx = combinedRC.findIndex((cc: any) => cc.id === keyLC);
        if (idx === -1) combinedRC.push(lc);
      });
      const cleanRepairCampaigns = combinedRC.filter((c: any) => c && c.isDeleted !== true);

      // 8. RepairForms
      const dbRepairForms = (await DataService.load('repairForms')) || [];
      let localRepairForms: any[] = [];
      try {
        const str1 = localStorage.getItem('local_repair_forms');
        const str2 = localStorage.getItem('local_repairForms');
        const str3 = localStorage.getItem('repairForms');
        localRepairForms = JSON.parse(str1 || str2 || str3 || '[]');
        if (!Array.isArray(localRepairForms)) localRepairForms = [];
      } catch {}
      const combinedRF = [...dbRepairForms];
      localRepairForms.forEach((lf: any) => {
        const keyLF = lf.id;
        const idx = combinedRF.findIndex((cf: any) => cf.id === keyLF);
        if (idx === -1) {
          combinedRF.push(lf);
        } else if (new Date(lf.updatedAt || 0).getTime() > new Date(combinedRF[idx].updatedAt || 0).getTime()) {
          combinedRF[idx] = lf;
        }
      });
      const cleanRepairForms = combinedRF.filter((f: any) => f && f.isDeleted !== true && f.isDeleted !== 'true');

      return {
        vehicles: cleanVehicles,
        damageProtocols: cleanDamageProtocols,
        repairHistory: cleanRepairHistory,
        postRepairRecords: cleanPostRepairRecords,
        vehicleInspectionForms: cleanInspectionForms,
        repairSessions: cleanRepairSessions,
        repairCampaigns: cleanRepairCampaigns,
        repairForms: cleanRepairForms,
      };
    } catch (err) {
      console.error("Error loading lookup data in QuickLookupTab:", err);
      return {
        vehicles: [],
        damageProtocols: [],
        repairHistory: [],
        postRepairRecords: [],
        vehicleInspectionForms: [],
        repairSessions: [],
        repairCampaigns: [],
        repairForms: [],
      };
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSearch = searchPlate.trim();
    if (!cleanSearch) {
      setError('Vui lòng nhập Số đăng ký xe.');
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setVehicleHeader(null);
    setSessionResults([]);
    setUnassignedRecords({ damageProtocols: [], repairHistories: [], postRepairRecords: [], hasOrphans: false });

    try {
      const data = await loadLookupData();
      const searchNorm = normalizePlate(cleanSearch);

      // 1. Collect vehicles / damageProtocols matching normalized plate
      const matchedVehicles = data.vehicles.filter((v: any) => normalizePlate(v.plateNumber) === searchNorm);
      const matchedDPs = data.damageProtocols.filter((dp: any) => normalizePlate(dp.plateNumber) === searchNorm);
      
      const vehicleIdSet = new Set<string>();
      matchedVehicles.forEach((v: any) => { if (v.vehicleId || v.id) vehicleIdSet.add(v.vehicleId || v.id); });
      matchedDPs.forEach((dp: any) => { if (dp.vehicleId) vehicleIdSet.add(dp.vehicleId); });

      // 2. Identify all RepairSessions belonging to this vehicle/plate
      const matchedSessions = data.repairSessions.filter((s: RepairSession) => {
        if (s.isDeleted) return false;
        if (normalizePlate(s.plateNumber) === searchNorm) return true;
        if (s.vehicleId && vehicleIdSet.has(s.vehicleId)) return true;
        
        // Check if any damage protocol linked to this session matches plate
        const linkedDP = data.damageProtocols.find((dp: any) => dp.repairSessionId === s.id && normalizePlate(dp.plateNumber) === searchNorm);
        if (linkedDP) return true;
        return false;
      });

      // Sort sessions chronologically or by repairNumber
      matchedSessions.sort((a: RepairSession, b: RepairSession) => {
        const numA = a.repairNumber || 0;
        const numB = b.repairNumber || 0;
        if (numA !== numB) return numA - numB;
        const timeA = new Date(a.openedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.openedAt || b.createdAt || 0).getTime();
        return timeA - timeB;
      });

      // 3. Build Consolidated Vehicle Header Info
      const primaryVehicle = matchedVehicles[0];
      const primaryDP = matchedDPs[0];
      const primarySession = matchedSessions[0];

      const headerInfo = {
        plateNumber: cleanSearch.toUpperCase(),
        vehicleName: primaryVehicle?.brand || primaryVehicle?.vehicleName || primaryDP?.brand || primaryDP?.vehicleName || primarySession?.vehicleName || '—',
        vehicleType: primaryVehicle?.vehicleType || primaryDP?.vehicleType || primaryDP?.headerData?.vehicleType || '—',
        vehicleGroup: primaryVehicle?.vehicleGroup || primaryDP?.headerData?.vehicleGroup || '—',
        chassisNumber: primaryVehicle?.chassisNumber || primaryDP?.chassisNumber || primaryDP?.headerData?.chassisNumber || '—',
        engineNumber: primaryVehicle?.engineNumber || primaryDP?.engineNumber || primaryDP?.headerData?.engineNumber || '—',
        receiverUnit: primaryVehicle?.receiverUnit || primaryDP?.receiverUnit || primaryDP?.headerData?.receiverUnit || primaryDP?.headerData?.giverUnit || '—',
        totalSessions: matchedSessions.length
      };

      // 4. Map records strictly per RepairSession
      const sessionDetails: SessionDetailItem[] = matchedSessions.map((session, idx) => {
        const sessionId = session.id;

        // Find documents linked strictly to THIS RepairSession
        const dp = data.damageProtocols.find((p: any) => p.repairSessionId === sessionId || p.protocolId === session.damageProtocolId || p.id === session.damageProtocolId);
        const vif = data.vehicleInspectionForms.find((v: any) => v.repairSessionId === sessionId || (session.vehicleInspectionIds && session.vehicleInspectionIds.includes(v.id)));
        const rh = data.repairHistory.find((h: any) => h.repairSessionId === sessionId || (session.repairFormsIds && session.repairFormsIds.includes(h.historyId || h.id)));
        const sessionRepairForms = (data.repairForms || []).filter(
          (f: any) => f && f.repairSessionId === sessionId && f.isDeleted !== true && f.isDeleted !== 'true'
        );
        const repairFormsCount = sessionRepairForms.length;
        const firstRepairForm = sessionRepairForms[0] || null;
        const postInspection = data.postRepairRecords.find((pr: any) => pr.templateType === 'POST_REPAIR_INSPECTION' && (pr.repairSessionId === sessionId || pr.id === session.postRepairInspectionId));
        const postHandover = data.postRepairRecords.find((pr: any) => pr.templateType === 'POST_REPAIR_HANDOVER' && (pr.repairSessionId === sessionId || pr.id === session.handoverId));

        return {
          session,
          repairNumber: session.repairNumber || (idx + 1),
          campaignName: resolveCampaignName(session.campaignId, data.repairCampaigns, session.campaignName || dp?.campaignName),
          campaignCode: session.campaignCode || '—',
          receiveDate: formatDate(session.receiveDate || session.openedAt || session.createdAt || dp?.receiveDate || dp?.createdDate),
          handoverDate: formatHandoverDate(session, postHandover),
          workflowState: session.workflowState || 'RECEIVED',
          documents: {
            damageProtocol: dp || null,
            vehicleInspection: vif || null,
            repairHistory: rh || null,
            repairFormsCount,
            firstRepairFormId: firstRepairForm?.id || null,
            postRepairInspection: postInspection || null,
            postRepairHandover: postHandover || null,
          }
        };
      });

      // Automatically expand all sessions initially
      const initExpanded: Record<string, boolean> = {};
      sessionDetails.forEach(sd => { initExpanded[sd.session.id] = true; });
      setExpandedSessionIds(initExpanded);

      // 5. Detect Orphaned Records (records matching plate but NOT assigned to any RepairSession)
      const claimedDPIds = new Set(sessionDetails.map(s => s.documents.damageProtocol?.id || s.documents.damageProtocol?.protocolId).filter(Boolean));
      const claimedVIFIds = new Set(sessionDetails.map(s => s.documents.vehicleInspection?.id).filter(Boolean));
      const claimedRHIds = new Set(sessionDetails.map(s => s.documents.repairHistory?.id || s.documents.repairHistory?.historyId).filter(Boolean));
      const claimedPRRIds = new Set([
        ...sessionDetails.map(s => s.documents.postRepairInspection?.id),
        ...sessionDetails.map(s => s.documents.postRepairHandover?.id)
      ].filter(Boolean));

      const orphanDPs = matchedDPs.filter((dp: any) => !claimedDPIds.has(dp.id) && !claimedDPIds.has(dp.protocolId) && !dp.repairSessionId);
      const orphanRHs = data.repairHistory.filter((rh: any) => !rh.repairSessionId && normalizePlate(rh.plateNumber) === searchNorm && !claimedRHIds.has(rh.id) && !claimedRHIds.has(rh.historyId));
      const orphanPRRs = data.postRepairRecords.filter((pr: any) => !pr.repairSessionId && normalizePlate(pr.plateNumber) === searchNorm && !claimedPRRIds.has(pr.id));

      const hasOrphans = orphanDPs.length > 0 || orphanRHs.length > 0 || orphanPRRs.length > 0;

      if (matchedSessions.length === 0 && !hasOrphans && matchedVehicles.length === 0 && matchedDPs.length === 0) {
        setError(`Không tìm thấy hồ sơ cho biển số xe: ${cleanSearch.toUpperCase()}`);
      } else {
        setVehicleHeader(headerInfo);
        setSessionResults(sessionDetails);
        setUnassignedRecords({
          damageProtocols: orphanDPs,
          repairHistories: orphanRHs,
          postRepairRecords: orphanPRRs,
          hasOrphans
        });
      }

    } catch (err) {
      console.error("Error in lookup:", err);
      setError("Đã xảy ra lỗi trong quá trình tra cứu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSessionExpanded = (sessionId: string) => {
    setExpandedSessionIds(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const handleOpenDocument = (
    session: RepairSession | null,
    module: 'INSPECTION' | 'REPAIR_RECORDS' | 'POST_REPAIR_RECORDS',
    formType: 'DAMAGE_PROTOCOL' | 'REPAIR_HISTORY' | 'POST_REPAIR_INSPECTION' | 'POST_REPAIR_HANDOVER' | string,
    recordId: string
  ) => {
    if (session) {
      onSelectRepairSession?.(session);
    }
    onOpenRecord?.({
      module,
      formType,
      recordId,
      repairSessionId: session?.id
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-10 max-w-3xl mx-auto shadow-sm my-6">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-full mb-4">
          <svg
            className="h-8 w-8"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h2 className="font-extrabold text-stone-900 text-2xl tracking-tight uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
          TRA CỨU NHANH HỒ SƠ XE
        </h2>
        <p className="text-stone-500 text-xs mt-1 font-mono uppercase tracking-widest">
          HỆ THỐNG QUẢN LÝ LỊCH SỬ CÁC LẦN SỬA CHỮA (REPAIR SESSION)
        </p>
      </div>

      {/* Form tìm kiếm */}
      <form onSubmit={handleLookup} className="space-y-4 max-w-lg mx-auto" style={{ fontFamily: 'var(--font-sans)' }}>
        <div>
          <label htmlFor="searchPlateInput" className="block text-sm font-semibold text-stone-700 mb-2">
            Biển số / Số đăng ký xe
          </label>
          <div className="flex space-x-2">
            <input
              id="searchPlateInput"
              type="text"
              value={typeof searchPlate === 'string' ? searchPlate.normalize('NFC') : searchPlate}
              onChange={(e) => {
                setSearchPlate(e.target.value.normalize('NFC'));
                if (error) setError(null);
              }}
              placeholder="Nhập biển số xe (VD: AC-11-22)..."
              className="flex-1 border border-stone-300 rounded-lg px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-stone-50/50 transition-all font-medium uppercase"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition-colors text-sm cursor-pointer disabled:opacity-50 flex justify-center items-center shrink-0"
            >
              {isLoading ? 'Đang tìm...' : 'Tra cứu'}
            </button>
          </div>
        </div>
      </form>

      {/* Kết quả tra cứu */}
      {hasSearched && (
        <div className="mt-8 border-t border-stone-200 pt-6 space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <svg className="animate-spin h-6 w-6 text-emerald-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-3 text-sm text-stone-600 font-medium">Đang truy xuất dữ liệu...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-700 text-sm font-medium">
              {error}
            </div>
          ) : (
            <>
              {/* SECTION I: THÔNG TIN XE */}
              {vehicleHeader && (
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                    <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 mr-2"></span>
                      Thông tin nhận dạng xe
                    </h3>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      Biển số: {vehicleHeader.plateNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs font-medium">
                    <div className="flex justify-between border-b border-stone-200/50 pb-1">
                      <span className="text-stone-500">Tên / Nhãn hiệu xe:</span>
                      <span className="text-stone-900 font-semibold">{vehicleHeader.vehicleName}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200/50 pb-1">
                      <span className="text-stone-500">Loại xe:</span>
                      <span className="text-stone-900 font-semibold">{vehicleHeader.vehicleType}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200/50 pb-1">
                      <span className="text-stone-500">Nhóm xe:</span>
                      <span className="text-stone-900 font-semibold">{vehicleHeader.vehicleGroup}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200/50 pb-1">
                      <span className="text-stone-500">Đơn vị quản lý:</span>
                      <span className="text-stone-900 font-semibold">{vehicleHeader.receiverUnit}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200/50 pb-1">
                      <span className="text-stone-500">Số khung:</span>
                      <span className="text-stone-900 font-semibold">{vehicleHeader.chassisNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200/50 pb-1">
                      <span className="text-stone-500">Số máy:</span>
                      <span className="text-stone-900 font-semibold">{vehicleHeader.engineNumber}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs bg-stone-100/80 px-3 py-2 rounded-lg font-medium">
                    <span className="text-stone-600">Tổng số lần sửa chữa chính thức:</span>
                    <span className="text-emerald-800 font-bold">{vehicleHeader.totalSessions} lần</span>
                  </div>
                </div>
              )}

              {/* SECTION II: LỊCH SỬ CÁC LẦN SỬA CHỮA (REPAIR SESSIONS) */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center">
                  <span className="w-2 h-2 rounded-full bg-stone-500 mr-2"></span>
                  Lịch sử các lần sửa chữa (Repair Sessions)
                </h3>

                {sessionResults.length === 0 ? (
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 text-center text-stone-500 text-xs font-medium">
                    Chưa có lần sửa chữa nào được đăng ký chính thức cho xe này.
                  </div>
                ) : (
                  sessionResults.map((item) => {
                    const sessionId = item.session.id;
                    const isExpanded = !!expandedSessionIds[sessionId];
                    const wfStyle = getWorkflowStateStyle(item.workflowState);
                    const numStr = String(item.repairNumber).padStart(2, '0');

                    return (
                      <div key={sessionId} className="bg-stone-50 hover:bg-stone-100/60 border border-stone-200 rounded-xl p-5 transition-all shadow-sm">
                        {/* Session Header */}
                        <div className="flex items-center justify-between border-b border-stone-200/80 pb-3 mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-900 bg-stone-200/80 px-2.5 py-1 rounded">
                              LẦN SỬA CHỮA {numStr}
                            </span>
                            {item.campaignName && item.campaignName !== '—' && (
                              <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                                Đợt: {item.campaignName}
                              </span>
                            )}
                          </div>
                          <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${wfStyle.badgeClass}`}>
                            {wfStyle.icon}
                            {wfStyle.label}
                          </span>
                        </div>

                        {/* Session Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs font-medium mb-3">
                          <div className="flex justify-between border-b border-stone-200/40 pb-1">
                            <span className="text-stone-500">Mã Lần sửa chữa:</span>
                            <span className="text-stone-800 font-mono font-semibold">{item.session.repairCode || item.session.id}</span>
                          </div>
                          <div className="flex justify-between border-b border-stone-200/40 pb-1">
                            <span className="text-stone-500">Cấp sửa chữa:</span>
                            <span className="text-stone-800 font-semibold">{item.session.repairLevel || '—'}</span>
                          </div>
                          <div className="flex justify-between border-b border-stone-200/40 pb-1">
                            <span className="text-stone-500">Thời gian vào (Tiếp nhận):</span>
                            <span className="text-stone-800 font-semibold">{item.receiveDate}</span>
                          </div>
                          <div className="flex justify-between border-b border-stone-200/40 pb-1">
                            <span className="text-stone-500">Thời gian ra (Bàn giao):</span>
                            <span className={`font-semibold ${item.handoverDate === 'Chưa bàn giao' ? 'text-amber-700 italic' : 'text-stone-800'}`}>
                              {item.handoverDate}
                            </span>
                          </div>
                        </div>

                        {/* Toggle Button for Documents */}
                        <div className="pt-2 flex justify-between items-center border-t border-stone-200/60">
                          <span className="text-[11px] text-stone-500 italic">
                            Khóa liên kết: <code className="font-mono text-[10px] bg-stone-200 px-1 py-0.5 rounded text-stone-700">{sessionId}</code>
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleSessionExpanded(sessionId)}
                            className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-1.5 px-3 rounded-lg border border-stone-300 transition-colors cursor-pointer flex items-center space-x-1.5 shadow-sm"
                          >
                            <FileText className="h-3.5 w-3.5 text-stone-600" />
                            <span>{isExpanded ? 'THU GỌN HỒ SƠ' : 'XEM DANH MỤC HỒ SƠ'}</span>
                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </button>
                        </div>

                        {/* Expanded Documents Panel */}
                        {isExpanded && (
                          <div className="mt-4 pt-3 border-t border-stone-200 bg-white rounded-lg p-4 border border-stone-200 shadow-inner">
                            <h4 className="text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-3 flex items-center">
                              <span className="mr-1.5 h-1.5 w-1.5 bg-emerald-600 rounded-full inline-block"></span>
                              Hồ sơ kỹ thuộc Lần sửa chữa {numStr}
                            </h4>

                            <div className="space-y-2.5 text-xs font-medium">
                              {/* 1. Biên bản giao nhận TBKT */}
                              <div className="flex items-center justify-between p-2.5 rounded-md bg-stone-50 border border-stone-200/80">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-stone-800">1. Biên bản giao nhận TBKT</span>
                                  {item.documents.damageProtocol ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      Đã lập
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-200 text-stone-600">
                                      Chưa lập
                                    </span>
                                  )}
                                </div>
                                {item.documents.damageProtocol ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDocument(
                                      item.session,
                                      'INSPECTION',
                                      'DAMAGE_PROTOCOL',
                                      item.documents.damageProtocol.protocolId || item.documents.damageProtocol.id
                                    )}
                                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-3 py-1 rounded shadow-sm transition-colors cursor-pointer"
                                  >
                                    Mở hồ sơ
                                  </button>
                                ) : (
                                  <span className="text-stone-400 italic text-[11px] pr-1">Chưa lập</span>
                                )}
                              </div>

                              {/* 2. Phiếu kiểm tra đầu vào / kiểm chọn */}
                              <div className="flex items-center justify-between p-2.5 rounded-md bg-stone-50 border border-stone-200/80">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-stone-800">2. Biên bản kiểm chọn / Phiếu kiểm tra đầu vào</span>
                                  {item.documents.vehicleInspection ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      Đã lập
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-200 text-stone-600">
                                      Chưa lập
                                    </span>
                                  )}
                                </div>
                                {item.documents.vehicleInspection ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDocument(
                                      item.session,
                                      'INSPECTION',
                                      'VEHICLE_INSPECTION',
                                      item.documents.vehicleInspection.id
                                    )}
                                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-3 py-1 rounded shadow-sm transition-colors cursor-pointer"
                                  >
                                    Mở hồ sơ
                                  </button>
                                ) : (
                                  <span className="text-stone-400 italic text-[11px] pr-1">Chưa lập</span>
                                )}
                              </div>

                              {/* 3. Hồ sơ sửa chữa */}
                              <div className="flex items-center justify-between p-2.5 rounded-md bg-stone-50 border border-stone-200/80">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-stone-800">3. Hồ sơ sửa chữa</span>
                                  {item.documents.repairFormsCount > 0 ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      Đã lập ({item.documents.repairFormsCount} phiếu)
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-200 text-stone-600">
                                      Chưa lập
                                    </span>
                                  )}
                                </div>
                                {item.documents.repairFormsCount > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDocument(
                                      item.session,
                                      'REPAIR_RECORDS',
                                      'REPAIR_HISTORY',
                                      item.documents.firstRepairFormId || item.documents.repairHistory?.historyId || item.documents.repairHistory?.id || item.session.id
                                    )}
                                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-3 py-1 rounded shadow-sm transition-colors cursor-pointer"
                                  >
                                    Mở hồ sơ
                                  </button>
                                ) : (
                                  <span className="text-stone-400 italic text-[11px] pr-1">Chưa lập</span>
                                )}
                              </div>

                              {/* 4. Phiếu kiểm tra hợp cách xuất xưởng */}
                              <div className="flex items-center justify-between p-2.5 rounded-md bg-stone-50 border border-stone-200/80">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-stone-800">4. Phiếu kiểm tra hợp cách xuất xưởng</span>
                                  {item.documents.postRepairInspection ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      Đã lập
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-200 text-stone-600">
                                      Chưa lập
                                    </span>
                                  )}
                                </div>
                                {item.documents.postRepairInspection ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDocument(
                                      item.session,
                                      'POST_REPAIR_RECORDS',
                                      'POST_REPAIR_INSPECTION',
                                      item.documents.postRepairInspection.id
                                    )}
                                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-3 py-1 rounded shadow-sm transition-colors cursor-pointer"
                                  >
                                    Mở hồ sơ
                                  </button>
                                ) : (
                                  <span className="text-stone-400 italic text-[11px] pr-1">Chưa lập</span>
                                )}
                              </div>

                              {/* 5. Biên bản bàn giao */}
                              <div className="flex items-center justify-between p-2.5 rounded-md bg-stone-50 border border-stone-200/80">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-stone-800">5. Biên bản bàn giao</span>
                                  {item.documents.postRepairHandover ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      Đã lập
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-200 text-stone-600">
                                      Chưa lập
                                    </span>
                                  )}
                                </div>
                                {item.documents.postRepairHandover ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDocument(
                                      item.session,
                                      'POST_REPAIR_RECORDS',
                                      'POST_REPAIR_HANDOVER',
                                      item.documents.postRepairHandover.id
                                    )}
                                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-3 py-1 rounded shadow-sm transition-colors cursor-pointer"
                                  >
                                    Mở hồ sơ
                                  </button>
                                ) : (
                                  <span className="text-stone-400 italic text-[11px] pr-1">Chưa lập</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* SECTION III: HỒ SƠ CHƯA XÁC ĐỊNH ĐƯỢC LẦN SỬA CHỮA (ORPHANED RECORDS) */}
              {unassignedRecords.hasOrphans && (
                <div className="border-t border-stone-200 pt-5 space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200">
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mr-1.5" />
                        HỒ SƠ CHƯA XÁC ĐỊNH ĐƯỢC LẦN SỬA CHỮA
                      </h4>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded border border-amber-300 uppercase">
                        Chưa xác định được hồ sơ sửa chữa
                      </span>
                    </div>

                    <p className="text-xs text-amber-800 mb-3 font-medium">
                      Các biểu mẫu kỹ thuật dưới đây thuộc biển số xe này nhưng chưa được gán chính thức vào một Lần sửa chữa (RepairSession) cụ thể.
                    </p>

                    <div className="space-y-2 text-xs font-medium">
                      {unassignedRecords.damageProtocols.map((dp) => (
                        <div key={dp.id || dp.protocolId} className="flex items-center justify-between p-2 rounded bg-white border border-amber-200">
                          <span className="text-stone-800 font-semibold">Biên bản giao nhận TBKT (#{dp.reportNumber || dp.protocolId})</span>
                          <button
                            type="button"
                            onClick={() => handleOpenDocument(null, 'INSPECTION', 'DAMAGE_PROTOCOL', dp.protocolId || dp.id)}
                            className="text-xs bg-amber-800 hover:bg-amber-900 text-white px-2.5 py-1 rounded shadow-sm"
                          >
                            Xem
                          </button>
                        </div>
                      ))}

                      {unassignedRecords.repairHistories.map((rh) => (
                        <div key={rh.id || rh.historyId} className="flex items-center justify-between p-2 rounded bg-white border border-amber-200">
                          <span className="text-stone-800 font-semibold">Hồ sơ sửa chữa (#{rh.reportNumber || rh.historyId})</span>
                          <button
                            type="button"
                            onClick={() => handleOpenDocument(null, 'REPAIR_RECORDS', 'REPAIR_HISTORY', rh.historyId || rh.id)}
                            className="text-xs bg-amber-800 hover:bg-amber-900 text-white px-2.5 py-1 rounded shadow-sm"
                          >
                            Xem
                          </button>
                        </div>
                      ))}

                      {unassignedRecords.postRepairRecords.map((pr) => (
                        <div key={pr.id} className="flex items-center justify-between p-2 rounded bg-white border border-amber-200">
                          <span className="text-stone-800 font-semibold">
                            {pr.templateType === 'POST_REPAIR_INSPECTION' ? 'Phiếu kiểm tra hợp cách' : 'Biên bản bàn giao'} (#{pr.id})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenDocument(null, 'POST_REPAIR_RECORDS', pr.templateType, pr.id)}
                            className="text-xs bg-amber-800 hover:bg-amber-900 text-white px-2.5 py-1 rounded shadow-sm"
                          >
                            Xem
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
