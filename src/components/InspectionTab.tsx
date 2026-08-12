import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  PlusCircle, 
  FileText, 
  Printer, 
  FileDown, 
  Trash2, 
  Search, 
  RefreshCw, 
  Calendar, 
  Layers, 
  Folder, 
  Truck, 
  Activity,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Vehicle, DamageProtocol, RepairSession, RepairCampaign } from '../types';
import { MilitaryInspectionForm } from './MilitaryInspectionForm';
import { DetailedSelectionProtocolForm } from './DetailedSelectionProtocolForm';
import { DamageProtocolList } from './DamageProtocolList';
import { DamageProtocolForm } from './DamageProtocolForm';
import { resolveHandoverTemplate, vehicleTemplates, selectionTemplates } from '../templates';
import { formatVNTime, parseDate } from '../utils/time';
import { canEditModule } from '../services/permissionService';
import { canEditDocument } from '../services/ownershipService';
import { dbService, getCurrentUserSession, normalizePlate } from '../services/dbService';

interface InspectionTabProps {
  viewMode: string;
  setViewMode: (mode: any) => void;
  selectedVehicle: Vehicle | null;
  setSelectedVehicle?: (v: Vehicle | null) => void;
  selectedRepairSession?: RepairSession | null;
  onSelectRepairSession?: (s: RepairSession | null) => void;
  savedVehicles: Vehicle[];
  showDetailedInspectionForm: boolean;
  setShowDetailedInspectionForm: (show: boolean) => void;
  activeDamageProtocol: DamageProtocol | null;
  setActiveDamageProtocol: (p: DamageProtocol | null) => void;
  allDamageProtocols: DamageProtocol[];
  allVehicleInspectionForms: any[];
  loadAllDamageProtocols: () => Promise<void>;
  handleSaveDamageProtocol: (payload: any) => Promise<void>;
  handleDeleteDamageProtocol: (id: string) => Promise<void>;
  handleDeleteVehicleInspectionForm: (id: string) => Promise<void>;
  handlePrintDamageProtocol: (protocol: DamageProtocol) => void;
  currentUserRole?: string;
  pendingOpenRequest?: any;
  onClearPendingOpenRequest?: () => void;
}

interface TreeSessionNode {
  session: RepairSession;
  sessionId: string;
  vehicleId: string;
  plateNumber: string;
  vehicleName: string;
  repairNumber: number;
  campaignId: string;
  campaignName: string;
  year: number;
}

interface TreeVehicleGroupNode {
  key: string;
  vehicleName: string;
  sessions: TreeSessionNode[];
}

interface TreeCampaignNode {
  key: string;
  campaignId: string;
  campaignCode: string;
  campaignName: string;
  year: number;
  round?: number;
  status: string;
  vehicleGroups: TreeVehicleGroupNode[];
  totalSessionsCount: number;
}

interface TreeYearNode {
  key: string;
  year: number;
  campaigns: TreeCampaignNode[];
  totalSessionsCount: number;
}

// Helper functions for RepairSession status
export function isRepairSessionOpen(session: RepairSession | any): boolean {
  if (!session) return false;
  if (session.isDeleted === true) return false;
  if (session.workflowState === 'HANDED_OVER') return false;
  if (session.status === 'CLOSED') return false;
  if (session.closedAt) return false;
  return true;
}

export function isRepairSessionClosed(session: RepairSession | any): boolean {
  if (!session) return false;
  if (session.workflowState === 'HANDED_OVER' || session.status === 'CLOSED' || Boolean(session.closedAt)) {
    return true;
  }
  return false;
}

export function InspectionTab({
  viewMode,
  setViewMode,
  selectedVehicle,
  setSelectedVehicle,
  selectedRepairSession,
  onSelectRepairSession,
  savedVehicles,
  showDetailedInspectionForm,
  setShowDetailedInspectionForm,
  activeDamageProtocol,
  setActiveDamageProtocol,
  allDamageProtocols,
  allVehicleInspectionForms,
  loadAllDamageProtocols,
  handleSaveDamageProtocol,
  handleDeleteDamageProtocol,
  handleDeleteVehicleInspectionForm: originalHandleDeleteVehicleInspectionForm,
  handlePrintDamageProtocol,
  currentUserRole,
  pendingOpenRequest,
  onClearPendingOpenRequest
}: InspectionTabProps) {
  
  const currentVehicleOrFallback = selectedVehicle || (savedVehicles.length > 0 ? savedVehicles[0] : null);
  const canEdit = currentUserRole ? canEditModule(currentUserRole as any, 'INSPECTION') : false;
  const currentUser = getCurrentUserSession();

  const canModifyInspectionDocument = (document: any) => {
    return canEditDocument(currentUser, document, 'INSPECTION');
  };

  const handleDeleteVehicleInspectionForm = async (id: string) => {
    const form = allVehicleInspectionForms.find(f => f.protocolId === id || f.id === id);
    if (!canModifyInspectionDocument(form)) {
      alert('Bạn chỉ có quyền xem dữ liệu.');
      return;
    }
    await originalHandleDeleteVehicleInspectionForm(id);
  };

  // State management
  const [activeFormMode, setActiveFormMode] = useState<'NONE' | 'GIAO_NHAN' | 'KIEM_CHON' | 'VIEW_PROTOCOL'>('NONE');
  const [protocolListTab, setProtocolListTab] = useState<'GIAO_NHAN' | 'KIEM_CHON'>('GIAO_NHAN');
  const [activeDetailedVehicle, setActiveDetailedVehicle] = useState<Vehicle | null>(currentVehicleOrFallback);
  const [activeDetailedFormId, setActiveDetailedFormId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Tree View data & state
  const [repairCampaigns, setRepairCampaigns] = useState<RepairCampaign[]>([]);
  const [repairSessions, setRepairSessions] = useState<RepairSession[]>([]);
  const [isLoadingTree, setIsLoadingTree] = useState<boolean>(true);
  const [treeSearchQuery, setTreeSearchQuery] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<RepairSession | null>(selectedRepairSession || null);

  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const [expandedVehicles, setExpandedVehicles] = useState<Record<string, boolean>>({});
  const [expandedPlates, setExpandedPlates] = useState<Record<string, boolean>>({});

  const isSearching = Boolean(treeSearchQuery.trim());

  // Sync selectedSession when prop updates
  useEffect(() => {
    if (selectedRepairSession) {
      setSelectedSession(selectedRepairSession);
    }
  }, [selectedRepairSession]);

  // Load real campaigns and sessions from Firestore
  const loadTreeData = useCallback(async () => {
    setIsLoadingTree(true);
    try {
      const [cList, sList] = await Promise.all([
        dbService.getAllRepairCampaigns(),
        dbService.getAllRepairSessions()
      ]);
      setRepairCampaigns(cList || []);
      setRepairSessions(sList || []);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu Tree trong InspectionTab:", err);
    } finally {
      setIsLoadingTree(false);
    }
  }, []);

  useEffect(() => {
    loadTreeData();
  }, [loadTreeData]);

  const toggleYear = (y: string) => setExpandedYears((prev) => ({ ...prev, [y]: !prev[y] }));
  const toggleCampaign = (y: string, c: string) => setExpandedCampaigns((prev) => ({ ...prev, [`${y}-${c}`]: !prev[`${y}-${c}`] }));
  const toggleVehicle = (y: string, c: string, v: string) => setExpandedVehicles((prev) => ({ ...prev, [`${y}-${c}-${v}`]: !prev[`${y}-${c}-${v}`] }));
  const togglePlate = (y: string, c: string, v: string, p: string) => setExpandedPlates((prev) => ({ ...prev, [`${y}-${c}-${v}-${p}`]: !prev[`${y}-${c}-${v}-${p}`] }));

  const filteredSessionsForTree = useMemo(() => {
    const q = treeSearchQuery.toLowerCase().trim();
    if (!q) return repairSessions;
    return repairSessions.filter((s) => {
      if (s.isDeleted) return false;
      const plate = (s.plateNumber || '').toLowerCase();
      const vehicle = (s.vehicleName || '').toLowerCase();
      const campaign = (s.campaignName || '').toLowerCase();
      const numStr = s.repairNumber ? `lần sửa chữa ${s.repairNumber}` : 'lần sửa chữa 01';
      const numOnly = s.repairNumber ? `lần ${s.repairNumber}` : '';

      return (
        plate.includes(q) ||
        vehicle.includes(q) ||
        campaign.includes(q) ||
        numStr.includes(q) ||
        numOnly.includes(q)
      );
    });
  }, [repairSessions, treeSearchQuery]);

  // Build 5-Level Tree Data (Năm -> Đợt sửa chữa -> Tên/chủng loại xe -> Biển số xe -> Lần sửa chữa)
  const treeData = useMemo(() => {
    const tree: Record<string, Record<string, Record<string, Record<string, RepairSession[]>>>> = {};

    filteredSessionsForTree.forEach((s) => {
      if (s.isDeleted) return;

      const year = (s.openedAt ? parseDate(s.openedAt)?.getFullYear().toString() : null) || 
        (s.createdAt ? parseDate(s.createdAt)?.getFullYear().toString() : null) || 
        '2026';

      const matchedCampaign = repairCampaigns.find((c) => c.id === s.campaignId && !c.isDeleted);
      const campaign = s.campaignName || matchedCampaign?.campaignName || 'Chưa xác định đợt sửa chữa';

      const matchedVeh = (savedVehicles || []).find(
        (v) =>
          v.vehicleId === s.vehicleId ||
          normalizePlate(v.plateNumber || '') === normalizePlate(s.plateNumber || '') ||
          normalizePlate(v.vehicleId || '') === normalizePlate(s.vehicleId || '')
      );
      const matchedDp = allDamageProtocols.find(
        (dp) =>
          dp.protocolId === s.damageProtocolId ||
          dp.vehicleId === s.vehicleId ||
          normalizePlate(dp.plateNumber || '') === normalizePlate(s.plateNumber || '')
      );
      const vehicleName =
        matchedVeh?.brand ||
        (matchedVeh as any)?.vehicleName ||
        s.vehicleName ||
        matchedDp?.brand ||
        matchedDp?.vehicleType ||
        'Xe chưa xác định';

      const plate = s.plateNumber || matchedVeh?.plateNumber || s.vehicleId || 'Chưa rõ';

      if (!tree[year]) tree[year] = {};
      if (!tree[year][campaign]) tree[year][campaign] = {};
      if (!tree[year][campaign][vehicleName]) tree[year][campaign][vehicleName] = {};
      if (!tree[year][campaign][vehicleName][plate]) tree[year][campaign][vehicleName][plate] = [];

      tree[year][campaign][vehicleName][plate].push(s);
    });

    Object.keys(tree).forEach((y) => {
      Object.keys(tree[y]).forEach((c) => {
        Object.keys(tree[y][c]).forEach((v) => {
          Object.keys(tree[y][c][v]).forEach((p) => {
            tree[y][c][v][p].sort((a, b) => (a.repairNumber || 1) - (b.repairNumber || 1));
          });
        });
      });
    });

    return tree;
  }, [filteredSessionsForTree, repairCampaigns, savedVehicles, allDamageProtocols]);

  // Mandatory debug logs requested by user
  useEffect(() => {
    console.log('[InspectionTab] repairCampaigns:', repairCampaigns);
    console.log('[InspectionTab] repairSessions:', repairSessions);
    console.log('[InspectionTab] Tree data:', treeData);
  }, [repairCampaigns, repairSessions, treeData]);

  const [targetSessionId, setTargetSessionId] = useState<string | null>(null);

  useEffect(() => {
    // 1. If prop selectedRepairSession is provided, prioritize it
    if (selectedRepairSession) {
      setSelectedSession(selectedRepairSession);
      setTargetSessionId(selectedRepairSession.id);
      return;
    }

    // 2. Keep existing selectedSession / targetSessionId if valid
    if (targetSessionId || selectedSession) {
      const currentId = targetSessionId || selectedSession?.id;
      const matched = repairSessions.find(s => s.id === currentId && !s.isDeleted);
      if (matched) {
        setSelectedSession(matched);
        setTargetSessionId(matched.id);
        return;
      }
    }

    // 3. Fallback to selectedVehicle if no session currently selected
    if (selectedVehicle) {
      const normVId = normalizePlate(selectedVehicle.vehicleId || '');
      const normVPlate = normalizePlate(selectedVehicle.plateNumber || '');

      const vehicleSessions = repairSessions.filter((s) => {
        if (s.isDeleted) return false;
        const normSId = normalizePlate(s.vehicleId || '');
        const normSPlate = normalizePlate(s.plateNumber || '');
        return (normVId && normSId === normVId) ||
               (normVPlate && normSPlate === normVPlate) ||
               (normVId && normSPlate === normVId) ||
               (normVPlate && normSId === normVPlate);
      });

      const openSession = vehicleSessions.find((s) => isRepairSessionOpen(s));
      if (openSession) {
        setSelectedSession(openSession);
        setTargetSessionId(openSession.id);
      } else if (vehicleSessions.length > 0) {
        vehicleSessions.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setSelectedSession(vehicleSessions[0]);
        setTargetSessionId(vehicleSessions[0].id);
      } else {
        setSelectedSession(null);
        setTargetSessionId(null);
      }
    } else {
      setSelectedSession(null);
      setTargetSessionId(null);
    }
  }, [selectedRepairSession, selectedVehicle, repairSessions]);

  // Handle tree session selection
  const handleSelectTreeSession = (s: RepairSession) => {
    console.log('[InspectionTab] SELECT SESSION', {
      sessionId: s?.id,
      plateNumber: s?.plateNumber,
      repairNumber: s?.repairNumber,
      workflowState: s?.workflowState,
      status: s?.status,
      closedAt: s?.closedAt
    });

    setSelectedSession(s);
    setTargetSessionId(s.id);
    onSelectRepairSession?.(s);

    const matchedVehicle = savedVehicles.find(v => 
      (v.vehicleId && s.vehicleId && v.vehicleId === s.vehicleId) || 
      (v.plateNumber && s.plateNumber && normalizePlate(v.plateNumber) === normalizePlate(s.plateNumber))
    ) || {
      vehicleId: s.vehicleId || s.plateNumber,
      plateNumber: s.plateNumber || s.vehicleId,
      brand: s.vehicleName || 'Xe chưa xác định',
      vehicleType: 'Xe quân sự',
      chassisNumber: '',
      engineNumber: '',
    } as Vehicle;

    setSelectedVehicle?.(matchedVehicle);
    setActiveDetailedVehicle(matchedVehicle);

    // Keep right panel in list mode ("DANH SÁCH BIÊN BẢN ĐÃ LƯU")
    setActiveFormMode('NONE');
  };

  // Search & Filter derived state for right-side saved protocols
  const filteredDamageProtocols = allDamageProtocols.filter(p => {
    if (targetSessionId) {
      if (p.repairSessionId !== targetSessionId) return false;
    } else if (selectedVehicle) {
      if (p.vehicleId !== selectedVehicle.vehicleId && p.plateNumber !== selectedVehicle.plateNumber) return false;
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const pPlate = (p.plateNumber || '').toLowerCase();
    const pBrand = (p.brand || '').toLowerCase();
    const pReportNumber = (p.reportNumber || '').toLowerCase();
    return pPlate.includes(q) || pBrand.includes(q) || pReportNumber.includes(q);
  }).sort((a: any, b: any) => {
    const dateA = new Date(a.updatedAt || a.createdDate || a.createdAt || 0).getTime();
    const dateB = new Date(b.updatedAt || b.createdDate || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  const filteredVehicleInspectionForms = allVehicleInspectionForms.filter(form => {
    if (targetSessionId) {
      if (form.repairSessionId !== targetSessionId) return false;
    } else if (selectedVehicle) {
      if (form.vehicleId !== selectedVehicle.vehicleId) return false;
    }
    
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const vehicleInfo = savedVehicles.find(v => v.vehicleId === form.vehicleId);
    const displayPlateNumber = (form.plateNumber || vehicleInfo?.plateNumber || '').toLowerCase();
    const vehicleName = (form.vehicleName || '').toLowerCase();
    return displayPlateNumber.includes(q) || vehicleName.includes(q);
  }).sort((a: any, b: any) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  useEffect(() => {
    if (selectedVehicle) {
      setActiveDetailedVehicle(selectedVehicle);
    }
  }, [selectedVehicle]);

  useEffect(() => {
    if (pendingOpenRequest && pendingOpenRequest.module === 'INSPECTION' && pendingOpenRequest.formType === 'DAMAGE_PROTOCOL') {
      const recordId = pendingOpenRequest.recordId;
      const matched = allDamageProtocols.find(p => p.protocolId === recordId || (p as any).id === recordId);
      if (matched) {
        setCurrentInspection(matched);
        setActiveFormMode('GIAO_NHAN');
      }
      onClearPendingOpenRequest?.();
    }
  }, [pendingOpenRequest, allDamageProtocols, onClearPendingOpenRequest]);

  // Build list of vehicles for selection in form dropdowns
  let availableVehiclesForSelection = savedVehicles.filter(v => {
    const normVId = (v.vehicleId || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const normVPlate = (v.plateNumber || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    return allDamageProtocols.some(p => {
      const normPId = (p.vehicleId || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const normPPlate = (p.plateNumber || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      return (normVId && normPId === normVId) || (normVPlate && normPPlate === normVPlate) || (normPId === normVPlate) || (normPPlate === normVId);
    });
  });

  availableVehiclesForSelection = availableVehiclesForSelection.filter((v, i, self) => 
    i === self.findIndex((t) => t.vehicleId === v.vehicleId)
  );

  allDamageProtocols.forEach(p => {
    const id = p.vehicleId || p.plateNumber;
    if (id && !availableVehiclesForSelection.some(v => v.vehicleId === id || v.plateNumber === id || v.plateNumber === p.plateNumber)) {
      availableVehiclesForSelection.push({
        vehicleId: id,
        plateNumber: p.plateNumber || id || 'Không rõ',
        brand: p.brand || '',
        vehicleType: p.vehicleType || 'Xe quân sự',
        vehicleGroup: '',
        chassisNumber: p.chassisNumber || '',
        engineNumber: p.engineNumber || '',
        yearOfManufacture: '',
        countryOfOrigin: '',
        createdAt: p.createdDate || new Date().toISOString(),
        createdBy: p.createdBy || p.createdByName || ''
      } as any);
    }
  });

  allVehicleInspectionForms.forEach(f => {
    const id = f.vehicleId;
    if (id && !availableVehiclesForSelection.some(v => v.vehicleId === id || (v as any).id === id)) {
      availableVehiclesForSelection.push({
        vehicleId: id,
        plateNumber: id || 'Không rõ',
        brand: f.vehicleName || '',
        vehicleType: 'Xe quân sự',
        vehicleGroup: '',
        chassisNumber: '',
        engineNumber: '',
        yearOfManufacture: '',
        countryOfOrigin: '',
        createdAt: f.createdAt || new Date().toISOString(),
        createdBy: f.createdBy || f.createdByName || ''
      } as any);
    }
  });

  const emptyInspection = {
    headerData: {},
    formData: {},
    vehicle: currentVehicleOrFallback
  };

  const [currentInspection, setCurrentInspection] = useState<any>(emptyInspection);
  const [viewedProtocol, setViewedProtocol] = useState<DamageProtocol | null>(null);

  useEffect(() => {
    setCurrentInspection({
      headerData: {},
      formData: {},
      vehicle: currentVehicleOrFallback
    });
  }, [selectedVehicle]);

  const createNewInspection = () => {
    if (!canEdit) {
      alert('Bạn chỉ có quyền xem dữ liệu.');
      return;
    }
    const currentSession = selectedSession || selectedRepairSession;
    if (currentSession && isRepairSessionClosed(currentSession)) {
      alert('Hồ sơ sửa chữa lần này đã hoàn tất bàn giao và đã đóng. Không thể lập thêm biên bản cho hồ sơ này.');
      return;
    }
    const currentSessionId = targetSessionId || currentSession?.id;
    if (!currentSessionId) {
      alert('Không xác định được hồ sơ sửa chữa. Vui lòng chọn đúng Lần sửa chữa trước khi lập biên bản.');
      return;
    }
    setActiveFormMode('GIAO_NHAN');
    const v = activeDetailedVehicle || selectedVehicle || currentVehicleOrFallback;
    setCurrentInspection({
      repairSessionId: currentSessionId,
      templateCode: currentSession.handoverTemplateCode,
      headerData: {
        reportNo: '',
        docDate: 'Gia Lai, ngày      tháng      năm 2026',
        repairLevel: '',
        repairGroup: '',
        vehicleName: undefined,
        plateNumber: v?.plateNumber || '',
        chassisNumber: v?.chassisNumber || '',
        actualChassisNumber: v?.chassisNumber || '',
        engineNumber: v?.engineNumber || '',
        actualEngineNumber: v?.engineNumber || '',
        giverUnit: (v as any)?.unit || (v as any)?.createdByUnit || ''
      },
      formData: {},
      vehicle: v
    });
  };

  const createNewSelection = () => {
    if (!canEdit) {
      alert('Bạn chỉ có quyền xem dữ liệu.');
      return;
    }
    const currentSession = selectedSession || selectedRepairSession;
    if (currentSession && isRepairSessionClosed(currentSession)) {
      alert('Hồ sơ sửa chữa lần này đã hoàn tất bàn giao và đã đóng. Không thể lập thêm biên bản cho hồ sơ này.');
      return;
    }
    const currentSessionId = targetSessionId || currentSession?.id;
    if (!currentSessionId) {
      alert('Không xác định được hồ sơ sửa chữa. Vui lòng chọn đúng Lần sửa chữa trước khi lập biên bản.');
      return;
    }
    setActiveDetailedVehicle(activeDetailedVehicle || selectedVehicle || currentVehicleOrFallback);
    setActiveDetailedFormId(null);
    setActiveFormMode('KIEM_CHON');
  };

  const resetForm = () => {
    setCurrentInspection((prev: any) => ({
      ...prev,
      headerData: {},
      formData: {}
    }));
  };

  const handleDeleteAndSync = async (id: string) => {
    const protocol = allDamageProtocols.find(p => p.protocolId === id || (p as any).id === id);
    if (!canModifyInspectionDocument(protocol)) {
      alert('Bạn chỉ có quyền xem dữ liệu.');
      return;
    }
    if (currentInspection && currentInspection.protocolId === id) {
      resetForm();
    }
    if (viewedProtocol && viewedProtocol.protocolId === id) {
      setViewedProtocol(null);
      setActiveFormMode('NONE');
    }
    await handleDeleteDamageProtocol(id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans animate-fade-in mt-3">
      {/* 1. Left TREE VIEW column */}
      <div className="lg:col-span-4 lg:sticky lg:top-4 space-y-4">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 md:p-5 overflow-hidden animate-fade-in space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-150 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-800" />
              <h3 className="font-extrabold text-stone-900 text-sm tracking-tight uppercase">
                Danh mục hồ sơ
              </h3>
            </div>
            <button
              onClick={loadTreeData}
              className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
              title="Làm mới cây danh mục"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingTree ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          {/* Search box inside Tree */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm đợt, loại xe, biển số..."
              value={treeSearchQuery}
              onChange={(e) => setTreeSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            />
            {treeSearchQuery && (
              <button 
                onClick={() => setTreeSearchQuery('')} 
                className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* 5-Level Tree View */}
          <div className="space-y-1 text-xs select-none max-h-[620px] overflow-y-auto pr-1 font-sans">
            {isLoadingTree ? (
              <div className="text-center py-8 text-xs text-emerald-700 font-semibold animate-pulse flex flex-col items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
                <span>Đang tải danh mục hồ sơ...</span>
              </div>
            ) : Object.keys(treeData).length === 0 ? (
              <div className="text-center py-8 text-xs text-stone-500 italic bg-stone-50 border border-dashed border-stone-200 rounded-xl p-4">
                {treeSearchQuery ? 'Không tìm thấy hồ sơ phù hợp.' : 'Chưa có đợt hoặc hồ sơ sửa chữa nào.'}
              </div>
            ) : (
              Object.keys(treeData).sort((a, b) => b.localeCompare(a)).map((year) => {
                const isYearExpanded = isSearching || Boolean(expandedYears[year]);
                const campaignsObj = treeData[year];

                return (
                  <div key={year} className="mb-1">
                    {/* Cấp 1: Năm */}
                    <div 
                      className="flex items-center gap-1.5 cursor-pointer py-1.5 px-2 hover:bg-stone-100 rounded-lg text-stone-800 font-bold transition-colors"
                      onClick={() => toggleYear(year)}
                    >
                      {isYearExpanded ? <ChevronDown className="w-4 h-4 text-emerald-700 shrink-0" /> : <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />}
                      <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{year}</span>
                    </div>

                    {isYearExpanded && (
                      <div className="pl-3 border-l border-stone-200 ml-3.5 space-y-0.5 mt-0.5">
                        {Object.keys(campaignsObj).map((campaign) => {
                          const campaignKey = `${year}-${campaign}`;
                          const isCampaignExpanded = isSearching || Boolean(expandedCampaigns[campaignKey]);
                          const vehiclesObj = campaignsObj[campaign];

                          return (
                            <div key={campaign}>
                              {/* Cấp 2: Đợt sửa chữa */}
                              <div 
                                className="flex items-center gap-1.5 cursor-pointer py-1 px-2 hover:bg-stone-100 rounded-lg text-stone-700 font-semibold text-xs transition-colors"
                                onClick={() => toggleCampaign(year, campaign)}
                              >
                                {isCampaignExpanded ? <ChevronDown className="w-3.5 h-3.5 text-emerald-700 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />}
                                <Folder className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span className="truncate">{campaign}</span>
                              </div>

                              {isCampaignExpanded && (
                                <div className="pl-3 border-l border-stone-200 ml-3 space-y-0.5 mt-0.5">
                                  {Object.keys(vehiclesObj).map((vehicle) => {
                                    const vehicleKey = `${year}-${campaign}-${vehicle}`;
                                    const isVehicleExpanded = isSearching || Boolean(expandedVehicles[vehicleKey]);
                                    const platesObj = vehiclesObj[vehicle];

                                    return (
                                      <div key={vehicle}>
                                        {/* Cấp 3: Tên/chủng loại xe */}
                                        <div 
                                          className="flex items-center gap-1.5 cursor-pointer py-1 px-2 hover:bg-stone-100 rounded-lg text-stone-700 text-xs font-medium transition-colors"
                                          onClick={() => toggleVehicle(year, campaign, vehicle)}
                                        >
                                          {isVehicleExpanded ? <ChevronDown className="w-3.5 h-3.5 text-emerald-700 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />}
                                          <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                          <span className="truncate">{vehicle}</span>
                                        </div>

                                        {isVehicleExpanded && (
                                          <div className="pl-3 border-l border-stone-200 ml-3 space-y-0.5 mt-0.5">
                                            {Object.keys(platesObj).map((plate) => {
                                              const plateKey = `${year}-${campaign}-${vehicle}-${plate}`;
                                              const isPlateExpanded = isSearching || Boolean(expandedPlates[plateKey]);
                                              const sessionsList = platesObj[plate];

                                              return (
                                                <div key={plate}>
                                                  {/* Cấp 4: Biển số xe */}
                                                  <div 
                                                    className="flex items-center gap-1.5 cursor-pointer py-1 px-2 hover:bg-stone-100 rounded-lg text-stone-600 text-xs transition-colors"
                                                    onClick={() => togglePlate(year, campaign, vehicle, plate)}
                                                  >
                                                    {isPlateExpanded ? <ChevronDown className="w-3 h-3 text-emerald-700 shrink-0" /> : <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />}
                                                    <span className="font-mono font-bold text-stone-800">{plate}</span>
                                                  </div>

                                                  {isPlateExpanded && (
                                                    <div className="pl-3 py-1 space-y-1">
                                                      {sessionsList.map((session: RepairSession, idx: number) => {
                                                        const isSelected = selectedSession?.id === session.id || targetSessionId === session.id;
                                                        const sessionNumberStr = `Lần sửa chữa ${String(session.repairNumber || idx + 1).padStart(2, '0')}`;

                                                        return (
                                                          /* Cấp 5: Lần sửa chữa */
                                                          <div 
                                                            key={session.id}
                                                            className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer transition-all text-xs ${
                                                              isSelected 
                                                                ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 shadow-2xs' 
                                                                : 'hover:bg-stone-100 text-stone-600 font-medium'
                                                            }`}
                                                            onClick={() => handleSelectTreeSession(session)}
                                                          >
                                                            <div className="flex items-center gap-2 min-w-0">
                                                              <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-emerald-600 ring-2 ring-emerald-300' : 'bg-stone-400'}`}></div>
                                                              <span className="truncate">{sessionNumberStr}</span>
                                                            </div>
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 2. Right/Main Detailed Form layout (GIỮ NGUYÊN) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-stone-200 shadow-sm animate-fade-in flex flex-col h-full min-h-[500px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-stone-150">
            <div>
              <h3 className="font-extrabold text-stone-900 text-base uppercase tracking-tight flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-800" />
                {activeFormMode === 'GIAO_NHAN' ? 'Lập biên bản giao nhận TBKT vào sửa chữa' :
                 activeFormMode === 'KIEM_CHON' ? 'Biên bản kiểm chọn tình trạng' :
                 activeFormMode === 'VIEW_PROTOCOL' ? 'Chi tiết biên bản đã lưu' :
                 'Danh sách biên bản đã lưu'}
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                {activeFormMode === 'NONE' ? 'Quản lý các biên bản kiểm tra tình trạng vũ khí, trang bị kỹ thuật' : 'Lưu trữ biểu mẫu kiểm tra gầm bệ, động cơ cơ giới quân dụng dã chiến'}
              </p>
            </div>
            
            {activeFormMode !== 'NONE' ? (
              <button
                onClick={() => {
                  resetForm();
                  setActiveFormMode('NONE');
                }}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg shadow-sm transition-all cursor-pointer"
                title="Đóng biểu mẫu / Xem trước"
              >
                <span>Đóng không gian hiển thị</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {protocolListTab === 'GIAO_NHAN' && canEdit && (
                  <button
                    onClick={() => createNewInspection()}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Lập biên bản giao nhận</span>
                  </button>
                )}
                {protocolListTab === 'KIEM_CHON' && canEdit && (
                  <button
                    onClick={() => createNewSelection()}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Lập biên bản kiểm chọn</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            {activeFormMode === 'GIAO_NHAN' ? (
              <MilitaryInspectionForm
                vehicle={activeDetailedVehicle || selectedVehicle || currentVehicleOrFallback}
                initialForm={currentInspection}
                repairSessionId={targetSessionId || selectedSession?.id || selectedRepairSession?.id || undefined}
                currentUserRole={currentUserRole}
                onClose={async () => {
                  resetForm();
                  setActiveFormMode('NONE');
                }}
                onSave={async (savedForm: any, isSilent: boolean) => {
                  if (!isSilent) {
                    await loadAllDamageProtocols();
                    if (savedForm) {
                      setActiveFormMode('NONE');
                    }
                  }
                }}
                onReset={resetForm}
              />
            ) : activeFormMode === 'VIEW_PROTOCOL' && viewedProtocol ? (
              <div className="bg-stone-100 flex flex-col h-full font-sans overflow-y-auto space-y-6 pb-20 rounded-xl relative">
                {/* Unified Views Header */}
                <div className="bg-white border-b border-stone-200 p-4 sticky top-0 z-20 flex shadow-sm justify-between items-center shrink-0">
                  <div className="font-bold text-stone-800 md:text-lg flex items-center gap-2">
                    <FileText className="h-6 w-6 text-emerald-600" />
                    Hồ sơ chi tiết xe: <span className="text-emerald-700">{viewedProtocol.vehicleId || (viewedProtocol as any).plateNumber || 'Không rõ'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setActiveFormMode('NONE')} className="px-5 py-2 cursor-pointer bg-stone-50 border border-stone-300 rounded-lg hover:bg-stone-100 font-bold text-sm text-stone-700 transition">
                      Đóng màn hình
                    </button>
                  </div>
                </div>

                <div className="p-4 md:p-6 space-y-8 flex-1">
                   {/* BIÊN BẢN GIAO NHẬN (DAMAGE PROTOCOL) */}
                   <div className="bg-white rounded-xl shadow border border-stone-200 overflow-hidden shrink-0">
                      <div className="bg-emerald-50 border-b border-emerald-100 p-4">
                         <h3 className="font-bold text-emerald-800 text-lg uppercase">I. Biên bản giao nhận TBKT</h3>
                      </div>
                      <div className="p-2 pointer-events-none opacity-95 relative">
                         <DamageProtocolForm 
                           initialProtocol={viewedProtocol} 
                           currentUserRole={currentUserRole}
                           savedVehicles={availableVehiclesForSelection}
                           onClose={() => {}}
                           onSave={async () => {}}
                           onReset={() => {}}
                         />
                      </div>
                      <div className="p-4 bg-stone-50 border-t border-stone-200 text-center">
                        <button onClick={() => { setCurrentInspection(viewedProtocol); setActiveFormMode('GIAO_NHAN'); }} className="px-6 py-2 pointer-events-auto bg-emerald-600 cursor-pointer text-white rounded-lg font-bold shadow hover:bg-emerald-700 transition">
                          Mở chi tiết Biên bản giao nhận
                        </button>
                      </div>
                   </div>

                   {/* BIÊN BẢN KIỂM CHỌN (MILITARY INSPECTION) */}
                   <div className="bg-white rounded-xl shadow border border-stone-200 overflow-hidden shrink-0">
                      <div className="bg-blue-50 border-b border-blue-100 p-4">
                         <h3 className="font-bold text-blue-800 text-lg uppercase">II. Biên bản kiểm chọn chi tiết</h3>
                      </div>
                      <div className="p-2 pointer-events-none opacity-95 relative">
                         <DetailedSelectionProtocolForm 
                           vehicle={{ vehicleId: viewedProtocol.vehicleId, plateNumber: (viewedProtocol as any).plateNumber, brand: viewedProtocol.brand || (viewedProtocol as any).vehicleName || '' } as any}
                           savedVehicles={availableVehiclesForSelection}
                           repairSessionId={targetSessionId || selectedSession?.id || selectedRepairSession?.id || undefined}
                           templateCode={selectedSession?.selectionTemplateCode || undefined}
                           onClose={() => {}}
                           currentUserRole={currentUserRole}
                         />
                      </div>
                      <div className="p-4 bg-stone-50 border-t border-stone-200 text-center">
                        <button 
                          onClick={() => { 
                            setActiveDetailedVehicle({ vehicleId: viewedProtocol.vehicleId, plateNumber: (viewedProtocol as any).plateNumber, brand: viewedProtocol.brand || (viewedProtocol as any).vehicleName || '' } as any);
                            createNewSelection();
                          }} 
                          className="px-6 py-2 pointer-events-auto bg-blue-600 cursor-pointer text-white rounded-lg font-bold shadow hover:bg-blue-700 transition"
                        >
                          Mở chi tiết Biên bản kiểm chọn
                        </button>
                      </div>
                   </div>
                </div>
              </div>
            ) : activeFormMode === 'KIEM_CHON' ? (
              <DetailedSelectionProtocolForm
                vehicle={activeDetailedVehicle || selectedVehicle || currentVehicleOrFallback}
                savedVehicles={availableVehiclesForSelection}
                initialFormId={activeDetailedFormId}
                repairSessionId={targetSessionId || selectedSession?.id || selectedRepairSession?.id || undefined}
                templateCode={selectedSession?.selectionTemplateCode || undefined}
                currentUserRole={currentUserRole}
                onClose={() => setActiveFormMode('NONE')}
                onSaveSuccess={async () => {
                  await loadAllDamageProtocols();
                }}
              />
            ) : (
              <div className="flex-1 flex flex-col p-2">

                {/* Search Bar */}
                <div className="mb-4 relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-stone-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm theo số đăng ký xe, tên xe hoặc số biên bản..."
                    value={typeof (searchQuery) === 'string' ? (searchQuery).normalize('NFC') : (searchQuery)}
                    onChange={(e) => setSearchQuery(e.target.value.normalize('NFC'))}
                    className="block w-full pl-10 pr-3 py-2 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:font-normal text-stone-800"
                  />
                </div>

                {/* Subtabs */}
                <div className="flex flex-wrap sm:flex-nowrap gap-2 mb-6 border-b border-stone-200 pb-3">
                  <button
                    onClick={() => setProtocolListTab('GIAO_NHAN')}
                    className={`flex-1 sm:flex-none text-center px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      protocolListTab === 'GIAO_NHAN'
                        ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-700'
                        : 'bg-stone-100 text-stone-700 hover:text-emerald-900 hover:bg-stone-200/80 border border-stone-200'
                    }`}
                  >
                    Biên bản giao nhận TBKT
                  </button>
                  <button
                    onClick={() => setProtocolListTab('KIEM_CHON')}
                    className={`flex-1 sm:flex-none text-center px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      protocolListTab === 'KIEM_CHON'
                        ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-700'
                        : 'bg-stone-100 text-stone-700 hover:text-emerald-900 hover:bg-stone-200/80 border border-stone-200'
                    }`}
                  >
                    Biên bản kiểm chọn chi tiết
                  </button>
                </div>

                {protocolListTab === 'GIAO_NHAN' && (() => {
                  console.log('[InspectionTab] HANDOVER CONTEXT', {
                    targetSessionId,
                    selectedSessionId: selectedSession?.id,
                    selectedPlate: selectedSession?.plateNumber,
                    handoverCount: filteredDamageProtocols?.length
                  });

                  if (filteredDamageProtocols.length > 0) {
                    return (
                      <div className="animate-fade-in">
                        <DamageProtocolList
                          protocols={filteredDamageProtocols}
                          onDeleteProtocol={handleDeleteAndSync}
                          activeProtocolId={activeFormMode === 'VIEW_PROTOCOL' ? viewedProtocol?.protocolId : undefined}
                          onPrintSelect={(protocol) => {
                            setCurrentInspection(protocol);
                            setActiveFormMode('GIAO_NHAN');
                          }}
                          onViewSelect={(protocol) => {
                            setCurrentInspection(protocol);
                            setActiveFormMode('GIAO_NHAN');
                          }}
                          currentUserRole={currentUserRole}
                        />
                      </div>
                    );
                  }

                  return (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                      <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8" />
                      </div>
                      
                      {searchQuery ? (
                        <>
                          <h3 className="text-sm font-bold text-stone-800 mb-1">Không tìm thấy biên bản phù hợp</h3>
                          <p className="text-xs text-stone-500 mb-6">Đã tìm kiếm với từ khóa "{searchQuery}".</p>
                        </>
                      ) : selectedSession ? (
                        <>
                          <h3 className="text-sm font-bold text-stone-800 mb-1">
                            Chưa có biên bản giao nhận cho {selectedSession.plateNumber || 'xe này'} (Lần {selectedSession.repairNumber || 1})
                          </h3>
                          <p className="text-xs text-stone-500 max-w-md mb-6">
                            Hồ sơ sửa chữa này chưa lập biên bản giao nhận vũ khí, trang bị kỹ thuật. Vui lòng nhấn nút bên dưới để lập biên bản.
                          </p>
                        </>
                      ) : selectedVehicle ? (
                        <>
                          <h3 className="text-sm font-bold text-stone-800 mb-1">
                            Chưa có biên bản giao nhận cho xe {selectedVehicle.plateNumber}
                          </h3>
                          <p className="text-xs text-stone-500 max-w-md mb-6">
                            Vui lòng chọn đúng Lần sửa chữa từ danh mục bên trái hoặc nhấn nút để tạo mới biên bản giao nhận.
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-sm font-bold text-stone-800 mb-1">Chưa có biên bản giao nhận nào</h3>
                          <p className="text-xs text-stone-500 max-w-md mb-6">
                            Chưa có biên bản giao nhận nào trong danh mục hiện tại.
                          </p>
                        </>
                      )}

                      {canEdit && (
                        <button
                          onClick={() => createNewInspection()}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/20"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>+ Lập biên bản giao nhận</span>
                        </button>
                      )}
                    </div>
                  );
                })()}

                {protocolListTab === 'KIEM_CHON' && (
                  filteredVehicleInspectionForms.length > 0 ? (
                    <div className="animate-fade-in space-y-3.5">
                      {filteredVehicleInspectionForms.map((form, index) => {
                        const vehicleInfo = savedVehicles.find(v => v.vehicleId === form.vehicleId);
                        const displayPlateNumber = form.plateNumber || vehicleInfo?.plateNumber || 'Biển số không xác định';
                        
                        return (
                        <div 
                          key={form.docId || form.protocolId || form.vehicleId ? `${form.docId}-${form.protocolId}-${form.vehicleId}-${index}` : index}
                          className="border border-stone-200 bg-white hover:border-stone-300 rounded-xl transition-all overflow-hidden p-4 cursor-pointer flex items-center justify-between flex-wrap gap-4 select-none"
                          onClick={() => {
                            const formId = form.id || form.docId || form.protocolId || form.vehicleId;
                            setActiveDetailedFormId(formId);
                            setActiveDetailedVehicle({ vehicleId: form.vehicleId, plateNumber: displayPlateNumber, brand: form.vehicleName || '' } as any);
                            setActiveFormMode('KIEM_CHON');
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 text-emerald-600">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-[15px] text-stone-800">
                                  {displayPlateNumber}
                                </h4>
                                <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-bold rounded">
                                  CHI TIẾT
                                </span>
                              </div>
                              <p className="text-xs text-stone-500 font-medium font-mono">
                                {form.vehicleName || 'Biên bản kiểm chọn'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-xs text-stone-500 font-medium">
                            <div className="flex items-center gap-1.5">
                              Người lập: <span className="font-bold text-stone-700">{form.createdByName || 'Người dùng'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 hidden sm:flex">
                              Vai trò: <span className="font-bold text-stone-700">{form.createdByRole || 'Không xác định'}</span>
                            </div>
                            
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              {canEdit && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const idToDelete = form.id || form.docId || form.protocolId || form.vehicleId;
                                    if (idToDelete) {
                                      if (activeDetailedFormId === idToDelete) {
                                        setActiveDetailedFormId(null);
                                        setActiveFormMode('NONE');
                                      }
                                      if (viewedProtocol && viewedProtocol.protocolId === idToDelete) {
                                        setViewedProtocol(null);
                                        setActiveFormMode('NONE');
                                      }
                                      await handleDeleteVehicleInspectionForm(idToDelete);
                                    }
                                  }}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-all cursor-pointer"
                                  title="Xóa biên bản kiểm chọn"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                      <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8" />
                      </div>

                      {searchQuery ? (
                        <>
                          <h3 className="text-sm font-bold text-stone-800 mb-1">Không tìm thấy kết quả phù hợp</h3>
                          <p className="text-xs text-stone-500 mb-6">Đã tìm kiếm với từ khóa "{searchQuery}".</p>
                        </>
                      ) : selectedSession ? (
                        <>
                          <h3 className="text-sm font-bold text-stone-800 mb-1">
                            Chưa có biên bản kiểm chọn cho {selectedSession.plateNumber || 'xe này'} (Lần {selectedSession.repairNumber || 1})
                          </h3>
                          <p className="text-xs text-stone-500 max-w-md mb-6">
                            Chưa có biên bản kiểm chọn chi tiết nào được lập cho đợt sửa chữa này.
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-sm font-bold text-stone-800 mb-1">Chưa có biên bản kiểm chọn nào</h3>
                          <p className="text-xs text-stone-500 max-w-md mb-6">
                            Chưa có biên bản kiểm chọn chi tiết nào trong hệ thống.
                          </p>
                        </>
                      )}

                      {canEdit && (
                        <button
                          onClick={() => createNewSelection()}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-sm shadow-blue-600/20"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>+ Lập biên bản kiểm chọn</span>
                        </button>
                      )}
                    </div>
                  )
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
