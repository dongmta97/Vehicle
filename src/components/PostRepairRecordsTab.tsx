import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PlusCircle, FileText, Printer, Trash2, Search, RefreshCw, Folder, ChevronRight, ChevronDown, Maximize2, Minimize2, Save, Truck } from 'lucide-react';
import { Vehicle, RepairSession } from '../types';
import { DataService } from '../firebase';
import { dbService, getCurrentUserSession, getCreatorAuditParams, getUpdaterAuditParams } from '../services/dbService';
import { canEditModule } from '../services/permissionService';
import { canEditDocument, canDeleteDocument } from '../services/ownershipService';
import { formatVNTime, parseDate } from '../utils/time';
import { AutoResizeTextarea } from './AutoResizeTextarea';
import { PostRepairHandoverForm, PostRepairHandoverPrintView } from './PostRepairVehicleHandoverForm';

interface PostRepairRecordsTabProps {
  viewMode: string;
  setViewMode: (mode: any) => void;
  selectedVehicle: Vehicle | null;
  selectedRepairSession?: RepairSession | null;
  onSelectRepairSession?: (s: RepairSession | null) => void;
  savedVehicles: Vehicle[];
  currentUserRole?: string;
  pendingOpenRequest?: any;
  onClearPendingOpenRequest?: () => void;
}

type FormMode = 'NONE' | 'POST_REPAIR_INSPECTION' | 'POST_REPAIR_HANDOVER' | 'VIEW_FORM';

export function PostRepairRecordsTab({
  viewMode,
  setViewMode,
  selectedVehicle,
  selectedRepairSession,
  onSelectRepairSession,
  savedVehicles,
  currentUserRole,
  pendingOpenRequest,
  onClearPendingOpenRequest
}: PostRepairRecordsTabProps) {
  const currentUser = getCurrentUserSession();
  const canEdit = currentUser?.role ? canEditModule(currentUser.role as any, 'POST_REPAIR') : false;

  const [activeFormMode, setActiveFormMode] = useState<FormMode>('NONE');
  const [listTab, setListTab] = useState<'INSPECTION' | 'HANDOVER'>('INSPECTION');
  const [activeDetailedVehicle, setActiveDetailedVehicle] = useState<Vehicle | null>(selectedVehicle);
  const [activeDetailedFormId, setActiveDetailedFormId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [treeSearchQuery, setTreeSearchQuery] = useState('');
  const [allForms, setAllForms] = useState<any[]>([]);
  const [repairSessions, setRepairSessions] = useState<any[]>([]);
  const [selectedFormForView, setSelectedFormForView] = useState<any>(null);
  const [handoverVehiclesList, setHandoverVehiclesList] = useState<any[]>([]);
  const [selectedInspectionForm, setSelectedInspectionForm] = useState<any | null>(null);

  // Tree expansion states
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const [expandedVehicles, setExpandedVehicles] = useState<Record<string, boolean>>({});
  const [expandedPlates, setExpandedPlates] = useState<Record<string, boolean>>({});

  // Sync activeDetailedVehicle if selectedRepairSession or selectedVehicle updates
  useEffect(() => {
    if (selectedRepairSession) {
      const matched = savedVehicles.find(v => v.vehicleId === selectedRepairSession.vehicleId || v.plateNumber === selectedRepairSession.plateNumber);
      if (matched) {
        setActiveDetailedVehicle(matched);
      } else {
        setActiveDetailedVehicle({
          vehicleId: selectedRepairSession.vehicleId || 'unknown',
          plateNumber: selectedRepairSession.plateNumber || '',
          brand: selectedRepairSession.vehicleName || '',
          vehicleType: '',
          vehicleGroup: '',
          chassisNumber: '',
          engineNumber: ''
        });
      }
    } else if (selectedVehicle) {
      setActiveDetailedVehicle(selectedVehicle);
    }
  }, [selectedRepairSession, selectedVehicle, savedVehicles]);

  // Handle pending unified open requests for post-repair records
  useEffect(() => {
    if (pendingOpenRequest && pendingOpenRequest.module === 'POST_REPAIR_RECORDS') {
      const { formType, recordId } = pendingOpenRequest;
      const found = allForms.find((f: any) => 
        (f.repairRecordId === recordId || f.id === recordId) && 
        f.templateType === formType
      );
      if (found) {
        if (found.repairSessionId) {
          const matchedSession = repairSessions.find(s => s.id === found.repairSessionId);
          if (matchedSession) {
            onSelectRepairSession?.(matchedSession);
          }
        }
        setActiveDetailedFormId(found.id);
        setActiveFormMode(formType as FormMode);
        
        const matchedVehicle = savedVehicles.find(v => v.vehicleId === found.vehicleId || v.plateNumber === found.plateNumber);
        if (matchedVehicle) {
          setActiveDetailedVehicle(matchedVehicle);
        }
        onClearPendingOpenRequest?.();
      } else if (allForms.length > 0) {
        onClearPendingOpenRequest?.();
      }
    }
  }, [pendingOpenRequest, allForms, repairSessions, savedVehicles, onClearPendingOpenRequest, onSelectRepairSession]);

  // Load forms from DB and local storage
  const loadForms = async () => {
    let combined: any[] = [];
    try {
      const stored = await DataService.load('postRepairRecords');
      if (Array.isArray(stored)) {
        combined = stored.filter((f: any) => 
          (f.templateType === 'POST_REPAIR_INSPECTION' || f.templateType === 'POST_REPAIR_HANDOVER') && 
          !f.isDeleted
        ).map((f: any) => ({
          ...f,
          createdAt: f.createdAt && typeof f.createdAt.toDate === 'function' ? f.createdAt.toDate().toISOString() : f.createdAt,
          updatedAt: f.updatedAt && typeof f.updatedAt.toDate === 'function' ? f.updatedAt.toDate().toISOString() : f.updatedAt
        }));
      }
    } catch (e) {
      console.warn("Failed to load post-repair forms from Firestore:", e);
    }

    const localKey = 'local_postRepairRecords';
    const localStored = localStorage.getItem(localKey);
    if (localStored) {
      try {
        const parsed = JSON.parse(localStored);
        if (Array.isArray(parsed)) {
          const visible = parsed.filter((p: any) => !p.isDeleted);
          visible.forEach((lf: any) => {
            const idx = combined.findIndex((cf: any) => cf.id === lf.id);
            if (idx === -1) {
              combined.push(lf);
            } else if (new Date(lf.updatedAt || 0) > new Date(combined[idx].updatedAt || 0)) {
              combined[idx] = lf;
            }
          });
        }
      } catch (err) {
        console.warn("Local storage parse failed for post-repair forms:", err);
      }
    }

    combined.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
    setAllForms(combined);
  };

  const loadHandoverVehicles = async () => {
    let combinedProtocols: any[] = [];
    try {
      const storedList = await DataService.load('damageProtocols');
      if (Array.isArray(storedList)) {
        const visibleList = storedList.filter((p: any) => !p.isDeleted && p.isDeleted !== 'true');
        combinedProtocols = visibleList;
      }
    } catch (e) {
      console.warn("Failed to load damage protocols from Firestore:", e);
    }

    const mapped = combinedProtocols.map((p: any) => ({
      inspectionFormId: p.protocolId || p.id,
      vehicleId: p.vehicleId || p.plateNumber,
      repairSessionId: p.repairSessionId || null,
      reportNumber: p.reportNumber || '',
      plateNumber: p.plateNumber || '',
      vehicleName: p.brand || p.vehicleName || '',
      receiveDate: p.createdDate || p.createdAt || '',
      vehicleType: p.vehicleType || '',
      vehicleGroup: p.vehicleGroup || '',
      chassisNumber: p.chassisNumber || p.formData?.chassisNumber || p.headerData?.chassisNumber || '',
      engineNumber: p.engineNumber || p.formData?.engineNumber || p.headerData?.engineNumber || '',
      repairLevel: p.repairLevel || p.formData?.repairLevel || p.headerData?.repairLevel || '',
      formData: p.formData || null,
      isDeleted: p.isDeleted || false,
      _original: p
    }));

    setHandoverVehiclesList(mapped);
  };

  const loadRepairSessions = async () => {
    try {
      const sessions = (await DataService.load('repairSessions')) || [];
      if (Array.isArray(sessions)) {
        const active = sessions.filter((s: any) => !s.isDeleted && s.isDeleted !== 'true');
        setRepairSessions(active);
      }
    } catch (e) {
      console.warn("Failed to load repairSessions:", e);
    }
  };

  useEffect(() => {
    loadForms();
    loadHandoverVehicles();
    loadRepairSessions();
  }, []);

  // Tree computation
  const filteredSessionsForTree = useMemo(() => {
    if (!treeSearchQuery.trim()) return repairSessions;
    const q = treeSearchQuery.toLowerCase().trim();
    return repairSessions.filter(s => {
      const plate = (s.plateNumber || '').toLowerCase();
      const vName = (s.vehicleName || '').toLowerCase();
      const camp = (s.campaignName || '').toLowerCase();
      const numStr = s.repairNumber ? `lần sửa chữa ${s.repairNumber}` : "lần sửa chữa 01";
      const numOnly = s.repairNumber ? `lần ${s.repairNumber}` : "";
      return plate.includes(q) || vName.includes(q) || camp.includes(q) || numStr.includes(q) || numOnly.includes(q);
    });
  }, [repairSessions, treeSearchQuery]);

  const treeData = useMemo(() => {
    const tree: Record<string, Record<string, Record<string, Record<string, any[]>>>> = {};
    filteredSessionsForTree.forEach(session => {
      if (session.isDeleted === true || session.isDeleted === 'true') return;
      
      const year = (session.openedAt ? parseDate(session.openedAt)?.getFullYear().toString() : null) || 
        (session.createdAt ? parseDate(session.createdAt)?.getFullYear().toString() : null) || 
        "2026";
        
      const campaign = session.campaignName || "Không thuộc đợt";
      const vehicleName = session.vehicleName || "Xe không xác định";
      const plate = session.plateNumber || "Không rõ biển số";
      
      if (!tree[year]) tree[year] = {};
      if (!tree[year][campaign]) tree[year][campaign] = {};
      if (!tree[year][campaign][vehicleName]) tree[year][campaign][vehicleName] = {};
      if (!tree[year][campaign][vehicleName][plate]) tree[year][campaign][vehicleName][plate] = [];
      
      tree[year][campaign][vehicleName][plate].push(session);
    });
    return tree;
  }, [filteredSessionsForTree]);

  const toggleYear = (y: string) => setExpandedYears(prev => ({ ...prev, [y]: !prev[y] }));
  const toggleCampaign = (y: string, c: string) => setExpandedCampaigns(prev => ({ ...prev, [`${y}-${c}`]: !prev[`${y}-${c}`] }));
  const toggleVehicle = (y: string, c: string, v: string) => setExpandedVehicles(prev => ({ ...prev, [`${y}-${c}-${v}`]: !prev[`${y}-${c}-${v}`] }));
  const togglePlate = (y: string, c: string, v: string, p: string) => setExpandedPlates(prev => ({ ...prev, [`${y}-${c}-${v}-${p}`]: !prev[`${y}-${c}-${v}-${p}`] }));

  const handleSaveFormLocalAndFirestore = async (payload: any) => {
    const localKey = 'local_postRepairRecords';
    const localStored = localStorage.getItem(localKey);
    let localList: any[] = [];
    if (localStored) {
      try {
        localList = JSON.parse(localStored);
      } catch {
        localList = [];
      }
    }

    localList = localList.filter((x: any) => x.id !== payload.id);
    localList.push(payload);
    localStorage.setItem(localKey, JSON.stringify(localList));

    try {
      let docExists = false;
      try {
        const check = await DataService.get('postRepairRecords', payload.id);
        if (check) docExists = true;
      } catch {}

      if (docExists) {
        await DataService.update('postRepairRecords', payload.id, payload);
      } else {
        await DataService.save('postRepairRecords', payload);
      }
    } catch (e) {
      console.warn("Failed to sync post-repair form to Firestore:", e);
    }

    // Auto-close RepairSession when POST_REPAIR_HANDOVER is saved successfully
    const sessionIdToClose = payload.repairSessionId || selectedRepairSession?.id;
    if (payload.templateType === 'POST_REPAIR_HANDOVER' && sessionIdToClose) {
      const nowIso = new Date().toISOString();
      const handoverDate = payload.handoverDate || payload.receiveDate || nowIso.split('T')[0];
      const closePayload = {
        workflowState: 'HANDED_OVER' as any,
        status: 'CLOSED' as any,
        handoverId: payload.id,
        handoverDate: handoverDate,
        closedAt: nowIso,
      };
      try {
        const updated = await dbService.updateRepairSession(sessionIdToClose, closePayload);
        if (updated) {
          onSelectRepairSession?.(updated);
        }
      } catch (err) {
        console.warn("Failed to update repair session status on handover:", err);
      }
    }

    await loadForms();
  };

  const handleDeleteForm = async (formId: string) => {
    const form = allForms.find(f => f.id === formId);
    if (!form) return;

    if (!canDeleteDocument(currentUser, form, 'POST_REPAIR')) {
      alert('Bạn chỉ có quyền xem dữ liệu.');
      return;
    }

    const nextForms = allForms.filter(f => f.id !== formId);
    setAllForms(nextForms);

    const localKey = 'local_postRepairRecords';
    const localStored = localStorage.getItem(localKey);
    if (localStored) {
      try {
        let localList = JSON.parse(localStored);
        if (Array.isArray(localList)) {
          const idx = localList.findIndex((item: any) => item.id === formId);
          if (idx >= 0) {
            localList[idx] = {
              ...localList[idx],
              isDeleted: true,
              deletedAt: new Date().toISOString(),
              deletedBy: currentUser?.uid || currentUser?.username || 'unknown',
              deletedByName: currentUser?.fullName || currentUser?.username || 'Người dùng',
              deletedByRole: currentUser?.role || 'Không xác định'
            };
            localStorage.setItem(localKey, JSON.stringify(localList));
          }
        }
      } catch (err) {}
    }

    try {
      await DataService.update('postRepairRecords', formId, {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: currentUser?.uid || currentUser?.username || 'unknown',
        deletedByName: currentUser?.fullName || currentUser?.username || 'Người dùng',
        deletedByRole: currentUser?.role || 'Không xác định'
      });
    } catch (err) {
      console.warn("Firestore soft delete failed for form:", err);
    }

    await loadForms();
    if (selectedFormForView?.id === formId) {
      setSelectedFormForView(null);
      setActiveFormMode('NONE');
    }
  };

  const handleSelectSession = (session: any) => {
    onSelectRepairSession?.(session);
    setActiveDetailedFormId(null);
    setSelectedFormForView(null);
    setSelectedInspectionForm(null);
    setActiveFormMode('NONE');
  };

  const handleCreateFormClick = (mode: 'POST_REPAIR_INSPECTION' | 'POST_REPAIR_HANDOVER') => {
    if (!selectedRepairSession) {
      alert("Vui lòng chọn đúng Lần sửa chữa trước khi lập hồ sơ.");
      return;
    }
    setActiveDetailedFormId(null);
    setSelectedFormForView(null);
    setSelectedInspectionForm(null);
    setActiveFormMode(mode);
  };

  // Strictly filter records by selected RepairSession ID
  const targetSessionId = selectedRepairSession?.id || null;

  useEffect(() => {
    if (selectedInspectionForm) {
      const formSessionId = selectedInspectionForm.repairSessionId || selectedInspectionForm._original?.repairSessionId;
      if (targetSessionId && formSessionId && formSessionId !== targetSessionId) {
        setSelectedInspectionForm(null);
      }
    }
  }, [targetSessionId, selectedInspectionForm]);

  const currentSessionHandoverVehicles = useMemo(() => {
    if (!targetSessionId) return [];
    return handoverVehiclesList.filter(item => {
      if (item.isDeleted || item.isDeleted === 'true' || item._original?.isDeleted) return false;
      const itemSessionId = item.repairSessionId || item._original?.repairSessionId;
      return itemSessionId === targetSessionId;
    });
  }, [handoverVehiclesList, targetSessionId]);

  const filteredForms = useMemo(() => {
    if (!targetSessionId) return [];
    return allForms.filter(form => {
      if (form.repairSessionId !== targetSessionId) return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const plate = (form.plateNumber || '').toLowerCase();
      const name = (form.vehicleName || '').toLowerCase();
      const repNo = (form.reportNo || '').toLowerCase();
      return plate.includes(q) || name.includes(q) || repNo.includes(q);
    });
  }, [allForms, targetSessionId, searchQuery]);

  const inspectionFormsList = filteredForms.filter(f => f.templateType === 'POST_REPAIR_INSPECTION');
  const handoverFormsList = filteredForms.filter(f => f.templateType === 'POST_REPAIR_HANDOVER');

  return (
    <div className="flex h-[calc(100vh-6rem)] overflow-hidden bg-stone-50 rounded-xl border border-stone-200 mt-2 font-sans">
      {/* 1. Left Sidebar - Tree View */}
      <div className="w-80 bg-white border-r border-stone-200 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
          <h2 className="font-bold text-stone-800 flex items-center gap-2 text-sm uppercase tracking-tight">
            <Folder className="w-4 h-4 text-emerald-700" />
            HỒ SƠ SAU SỬA CHỮA
          </h2>
          <button 
            onClick={() => {
              loadForms();
              loadHandoverVehicles();
              loadRepairSessions();
            }} 
            className="p-1 hover:bg-stone-200 rounded text-stone-500 cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Tree Search Box */}
        <div className="p-2 border-b border-stone-100 bg-stone-50/50">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm đợt, xe, biển số..."
              value={treeSearchQuery}
              onChange={(e) => setTreeSearchQuery(e.target.value)}
              className="w-full pl-8 pr-6 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {treeSearchQuery && (
              <button 
                onClick={() => setTreeSearchQuery('')} 
                className="absolute right-2 top-1.5 text-stone-400 hover:text-stone-600 text-xs font-bold cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Tree Navigation */}
        <div className="p-3 overflow-y-auto flex-1 text-sm">
          {(() => {
            const isSearching = Boolean(treeSearchQuery.trim());
            const sortedYears = Object.keys(treeData).sort((a, b) => b.localeCompare(a));
            if (sortedYears.length === 0) {
              return (
                <div className="p-4 text-center text-stone-500 italic text-xs">
                  {treeSearchQuery ? 'Không tìm thấy hồ sơ phù hợp.' : 'Chưa có dữ liệu Lần sửa chữa nào.'}
                </div>
              );
            }

            return sortedYears.map(year => {
              const campaignsObj = treeData[year];
              const isYearExpanded = isSearching || Boolean(expandedYears[year]);

              return (
                <div key={year} className="mb-1">
                  {/* Level 1: Year */}
                  <div 
                    className="flex items-center gap-1.5 cursor-pointer py-1.5 px-2 hover:bg-stone-100 rounded-lg text-stone-800 font-bold select-none transition-colors"
                    onClick={() => toggleYear(year)}
                  >
                    {isYearExpanded ? <ChevronDown className="w-4 h-4 text-emerald-700" /> : <ChevronRight className="w-4 h-4 text-stone-400" />}
                    <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{year}</span>
                  </div>
                  
                  {isYearExpanded && (
                    <div className="pl-3 border-l border-stone-200 ml-3.5 space-y-0.5 mt-0.5">
                      {Object.keys(campaignsObj).map(campaign => {
                        const vehiclesObj = campaignsObj[campaign];
                        const campaignKey = `${year}-${campaign}`;
                        const isCampaignExpanded = isSearching || Boolean(expandedCampaigns[campaignKey]);

                        return (
                          <div key={campaign}>
                            {/* Level 2: Repair Campaign */}
                            <div 
                              className="flex items-center gap-1.5 cursor-pointer py-1 px-2 hover:bg-stone-100 rounded-lg text-stone-700 font-semibold text-xs select-none transition-colors"
                              onClick={() => toggleCampaign(year, campaign)}
                            >
                              {isCampaignExpanded ? <ChevronDown className="w-3.5 h-3.5 text-emerald-700" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
                              <Folder className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span className="truncate">{campaign}</span>
                            </div>
                            
                            {isCampaignExpanded && (
                              <div className="pl-3 border-l border-stone-200 ml-3 space-y-0.5 mt-0.5">
                                {Object.keys(vehiclesObj).map(vehicle => {
                                  const platesObj = vehiclesObj[vehicle];
                                  const vehicleKey = `${year}-${campaign}-${vehicle}`;
                                  const isVehicleExpanded = isSearching || Boolean(expandedVehicles[vehicleKey]);

                                  return (
                                    <div key={vehicle}>
                                      {/* Level 3: Vehicle Type/Name */}
                                      <div 
                                        className="flex items-center gap-1.5 cursor-pointer py-1 px-2 hover:bg-stone-100 rounded-lg text-stone-700 text-xs font-medium select-none transition-colors"
                                        onClick={() => toggleVehicle(year, campaign, vehicle)}
                                      >
                                        {isVehicleExpanded ? <ChevronDown className="w-3.5 h-3.5 text-emerald-700" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
                                        <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                        <span className="truncate">{vehicle}</span>
                                      </div>
                                      
                                      {isVehicleExpanded && (
                                        <div className="pl-3 border-l border-stone-200 ml-3 space-y-0.5 mt-0.5">
                                          {Object.keys(platesObj).map(plate => {
                                            const sessionsList = platesObj[plate];
                                            const plateKey = `${year}-${campaign}-${vehicle}-${plate}`;
                                            const isPlateExpanded = isSearching || Boolean(expandedPlates[plateKey]);

                                            return (
                                              <div key={plate}>
                                                {/* Level 4: Plate Number */}
                                                <div 
                                                  className="flex items-center gap-1.5 cursor-pointer py-1 px-2 hover:bg-stone-100 rounded-lg text-stone-600 text-xs select-none transition-colors"
                                                  onClick={() => togglePlate(year, campaign, vehicle, plate)}
                                                >
                                                  {isPlateExpanded ? <ChevronDown className="w-3 h-3 text-emerald-700" /> : <ChevronRight className="w-3 h-3 text-stone-400" />}
                                                  <span className="font-mono font-bold text-stone-800">{plate}</span>
                                                </div>
                                                
                                                {isPlateExpanded && (
                                                  <div className="pl-3 py-1 space-y-1">
                                                    {sessionsList.map((session: any) => {
                                                      const isSelected = selectedRepairSession?.id === session.id;
                                                      return (
                                                        /* Level 5: Repair Session */
                                                        <div 
                                                          key={session.id}
                                                          className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg cursor-pointer transition-all text-xs ${isSelected ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 shadow-sm' : 'hover:bg-stone-100 text-stone-600 font-medium'}`}
                                                          onClick={() => handleSelectSession(session)}
                                                        >
                                                          <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-emerald-600 ring-2 ring-emerald-300' : 'bg-stone-400'}`}></div>
                                                          <span>Lần sửa chữa {session.repairNumber ? String(session.repairNumber).padStart(2, '0') : '01'}</span>
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
            });
          })()}
        </div>
      </div>

      {/* 2. Right Canvas Area */}
      <div className="flex-1 overflow-y-auto bg-stone-50 p-4 md:p-6 relative">
        {!selectedRepairSession ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-stone-200 shadow-sm min-h-[450px]">
            <div className="h-16 w-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mb-4">
              <Folder className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-stone-800 mb-2">Chưa chọn Lần sửa chữa</h3>
            <p className="text-xs text-stone-500 max-w-md mb-4 leading-relaxed">
              Vui lòng chọn một <strong>Lần sửa chữa</strong> từ Cây hồ sơ bên trái để xem, lập hoặc quản lý các hồ sơ sau sửa chữa của lần sửa chữa đó.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Card for Selected Session */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-150">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    HỒ SƠ SAU SỬA CHỮA
                  </span>
                  <h2 className="text-xl font-extrabold text-stone-900 mt-1 uppercase tracking-tight flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-800" />
                    {selectedRepairSession.vehicleName || 'Xe không xác định'} — {selectedRepairSession.plateNumber || 'Chưa rõ biển số'}
                  </h2>
                </div>

                {canEdit && activeFormMode === 'NONE' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCreateFormClick('POST_REPAIR_INSPECTION')}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Lập phiếu kiểm tra hợp cách</span>
                    </button>
                    <button
                      onClick={() => handleCreateFormClick('POST_REPAIR_HANDOVER')}
                      className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Lập biên bản bàn giao</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs">
                <div>
                  <span className="text-stone-400 font-medium block">Đợt sửa chữa</span>
                  <strong className="text-stone-800 font-bold text-sm">{selectedRepairSession.campaignName || 'Không thuộc đợt'}</strong>
                </div>
                <div>
                  <span className="text-stone-400 font-medium block">Biển số đăng ký</span>
                  <strong className="text-stone-800 font-bold text-sm">{selectedRepairSession.plateNumber || '—'}</strong>
                </div>
                <div>
                  <span className="text-stone-400 font-medium block">Lần sửa chữa</span>
                  <strong className="text-emerald-700 font-bold text-sm">Lần {selectedRepairSession.repairNumber ? String(selectedRepairSession.repairNumber).padStart(2, '0') : '01'}</strong>
                </div>
                <div>
                  <span className="text-stone-400 font-medium block">Session ID</span>
                  <strong className="text-stone-600 font-mono text-[11px] truncate block">{selectedRepairSession.id}</strong>
                </div>
              </div>
            </div>

            {/* Active Mode Form / Detail / List View */}
            {activeFormMode === 'POST_REPAIR_INSPECTION' ? (
              <div className="bg-white p-4 md:p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-150">
                  <h3 className="font-extrabold text-stone-900 text-base uppercase tracking-tight flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-800" />
                    {activeDetailedFormId ? 'Cập nhật phiếu kiểm tra hợp cách xuất xưởng' : 'Lập phiếu kiểm tra hợp cách xuất xưởng'}
                  </h3>
                  <button
                    onClick={() => {
                      setActiveDetailedFormId(null);
                      setSelectedFormForView(null);
                      setActiveFormMode('NONE');
                    }}
                    className="text-xs font-bold px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer transition"
                  >
                    Đóng
                  </button>
                </div>
                <PostRepairInspectionForm
                  targetSessionId={selectedRepairSession.id}
                  vehicle={activeDetailedVehicle}
                  existingFormId={activeDetailedFormId}
                  savedVehicles={savedVehicles}
                  onClose={() => setActiveFormMode('NONE')}
                  onSave={handleSaveFormLocalAndFirestore}
                  initialData={activeDetailedFormId ? allForms.find(f => f.id === activeDetailedFormId) : null}
                  handoverVehiclesList={currentSessionHandoverVehicles}
                  selectedInspectionForm={selectedInspectionForm}
                  setSelectedInspectionForm={setSelectedInspectionForm}
                />
              </div>
            ) : activeFormMode === 'POST_REPAIR_HANDOVER' ? (
              <div className="bg-white p-4 md:p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-150">
                  <h3 className="font-extrabold text-stone-900 text-base uppercase tracking-tight flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-800" />
                    {activeDetailedFormId ? 'Cập nhật biên bản bàn giao xe' : 'Biên bản bàn giao xe hoàn thành sửa chữa'}
                  </h3>
                  <button
                    onClick={() => {
                      setActiveDetailedFormId(null);
                      setSelectedFormForView(null);
                      setActiveFormMode('NONE');
                    }}
                    className="text-xs font-bold px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer transition"
                  >
                    Đóng
                  </button>
                </div>
                <PostRepairHandoverForm
                  targetSessionId={selectedRepairSession.id}
                  vehicle={activeDetailedVehicle}
                  existingFormId={activeDetailedFormId}
                  savedVehicles={savedVehicles}
                  onClose={() => setActiveFormMode('NONE')}
                  onSave={handleSaveFormLocalAndFirestore}
                  initialData={activeDetailedFormId ? allForms.find(f => f.id === activeDetailedFormId) : null}
                  handoverVehiclesList={currentSessionHandoverVehicles}
                  selectedInspectionForm={selectedInspectionForm}
                  setSelectedInspectionForm={setSelectedInspectionForm}
                />
              </div>
            ) : activeFormMode === 'VIEW_FORM' && selectedFormForView ? (
              <div className="bg-white p-4 md:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                <div className="flex justify-end gap-2 shrink-0 print:hidden mb-2">
                  <button
                    onClick={() => {
                      setActiveDetailedFormId(selectedFormForView.id);
                      setActiveFormMode(selectedFormForView.templateType);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow cursor-pointer transition"
                  >
                    Sửa đổi biểu mẫu
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-lg shadow cursor-pointer transition flex items-center gap-1.5"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>In hồ sơ (A4)</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFormForView(null);
                      setActiveFormMode('NONE');
                    }}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg cursor-pointer transition"
                  >
                    Quay lại danh sách
                  </button>
                </div>

                {selectedFormForView.templateType === 'POST_REPAIR_INSPECTION' ? (
                  <PostRepairInspectionPrintView data={selectedFormForView} />
                ) : (
                  <PostRepairHandoverPrintView data={selectedFormForView} />
                )}
              </div>
            ) : (
              <div className="bg-white p-4 md:p-6 rounded-2xl border border-stone-200 shadow-sm flex-1 flex flex-col">
                {/* Search query */}
                <div className="mb-4 relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-stone-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm theo số đăng ký xe, tên xe hoặc số hiệu..."
                    value={typeof (searchQuery) === 'string' ? (searchQuery).normalize('NFC') : (searchQuery)}
                    onChange={(e) => setSearchQuery(e.target.value.normalize('NFC'))}
                    className="block w-full pl-10 pr-3 py-2 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-stone-800 placeholder:font-normal"
                  />
                </div>

                {/* Tabs inside Main content */}
                <div className="flex flex-wrap sm:flex-nowrap gap-2 mb-6 border-b border-stone-200 pb-3">
                  <button
                    onClick={() => setListTab('INSPECTION')}
                    className={`flex-1 sm:flex-none text-center px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      listTab === 'INSPECTION'
                        ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-700'
                        : 'bg-stone-100 text-stone-700 hover:text-emerald-900 hover:bg-stone-200/80 border border-stone-200'
                    }`}
                  >
                    Phiếu kiểm tra hợp cách xuất xưởng ({inspectionFormsList.length})
                  </button>
                  <button
                    onClick={() => setListTab('HANDOVER')}
                    className={`flex-1 sm:flex-none text-center px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      listTab === 'HANDOVER'
                        ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-700'
                        : 'bg-stone-100 text-stone-700 hover:text-emerald-900 hover:bg-stone-200/80 border border-stone-200'
                    }`}
                  >
                    Biên bản bàn giao xe ({handoverFormsList.length})
                  </button>
                </div>

                {/* Lists rendering */}
                {listTab === 'INSPECTION' && (
                  inspectionFormsList.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-stone-50 rounded-xl border border-dashed border-stone-300 min-h-[250px]">
                      <div className="h-14 w-14 bg-stone-100 rounded-full flex items-center justify-center mb-3 text-stone-400">
                        <FileText className="h-7 w-7" />
                      </div>
                      <h3 className="text-sm font-bold text-stone-700 mb-1">Chưa có phiếu kiểm tra hợp cách cho lần sửa chữa này</h3>
                      <p className="text-xs text-stone-500 max-w-sm mb-5">Nhấn nút bên dưới để lập phiếu kiểm tra chất lượng xe sau sửa chữa.</p>
                      {canEdit && (
                        <button
                          onClick={() => handleCreateFormClick('POST_REPAIR_INSPECTION')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>Lập phiếu kiểm tra hợp cách</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {inspectionFormsList.map((form) => (
                        <div
                          key={form.id}
                          className="border border-stone-200 bg-white hover:border-emerald-300 rounded-xl transition-all p-4 cursor-pointer flex items-center justify-between gap-4 shadow-sm"
                          onClick={() => {
                            setSelectedFormForView(form);
                            setActiveFormMode('VIEW_FORM');
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-[15px] text-stone-800 flex items-center gap-2">
                                {form.plateNumber || selectedRepairSession.plateNumber}
                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded font-bold uppercase">Hợp cách</span>
                              </h4>
                              <p className="text-xs text-stone-500 font-semibold">{form.vehicleName || selectedRepairSession.vehicleName} — Số hiệu: {form.reportNo || 'Không rõ'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-stone-500 font-medium" onClick={e => e.stopPropagation()}>
                            <span className="hidden md:inline">Ngày lập: {form.docDate || 'Không rõ'}</span>
                            <span>Người lập: <strong className="text-stone-700 font-bold">{form.createdByName || 'Người dùng'}</strong></span>
                            
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setActiveDetailedFormId(form.id);
                                  setActiveFormMode('POST_REPAIR_INSPECTION');
                                }}
                                className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <FileText className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteForm(form.id)}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Xóa mềm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {listTab === 'HANDOVER' && (
                  handoverFormsList.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-stone-50 rounded-xl border border-dashed border-stone-300 min-h-[250px]">
                      <div className="h-14 w-14 bg-stone-100 rounded-full flex items-center justify-center mb-3 text-stone-400">
                        <FileText className="h-7 w-7" />
                      </div>
                      <h3 className="text-sm font-bold text-stone-700 mb-1">Chưa có biên bản bàn giao cho lần sửa chữa này</h3>
                      <p className="text-xs text-stone-500 max-w-sm mb-5">Nhấn nút bên dưới để lập biên bản bàn giao xe hoàn thành sửa chữa.</p>
                      {canEdit && (
                        <button
                          onClick={() => handleCreateFormClick('POST_REPAIR_HANDOVER')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>Lập biên bản bàn giao</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {handoverFormsList.map((form) => (
                        <div
                          key={form.id}
                          className="border border-stone-200 bg-white hover:border-emerald-300 rounded-xl transition-all p-4 cursor-pointer flex items-center justify-between gap-4 shadow-sm"
                          onClick={() => {
                            setSelectedFormForView(form);
                            setActiveFormMode('VIEW_FORM');
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-[15px] text-stone-800 flex items-center gap-2">
                                {form.plateNumber || selectedRepairSession.plateNumber}
                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded font-bold uppercase">Bàn giao</span>
                              </h4>
                              <p className="text-xs text-stone-500 font-semibold">{form.formData?.vehicleName || form.vehicleName || selectedRepairSession.vehicleName} — Số hiệu: {form.formData?.reportNo || form.reportNo || 'Không rõ'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-stone-500 font-medium" onClick={e => e.stopPropagation()}>
                            <span className="hidden md:inline">Ngày lập: {form.formData?.docDateDay ? `Ngày ${form.formData.docDateDay}/${form.formData.docDateMonth}/${form.formData.docDateYear}` : (form.formData?.docDate || form.docDate || 'Không rõ')}</span>
                            <span>Người lập: <strong className="text-stone-700 font-bold">{form.createdByName || 'Người dùng'}</strong></span>
                            
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setActiveDetailedFormId(form.id);
                                  setActiveFormMode('POST_REPAIR_HANDOVER');
                                }}
                                className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <FileText className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteForm(form.id)}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Xóa mềm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================
   1. FORM: PHIẾU KIỂM TRA HỢP CÁCH XUẤT XƯỞNG
   ========================================================== */
interface FormProps {
  targetSessionId?: string;
  vehicle: Vehicle | null;
  existingFormId: string | null;
  savedVehicles: Vehicle[];
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
  initialData?: any;
  handoverVehiclesList?: any[];
  selectedInspectionForm?: any | null;
  setSelectedInspectionForm?: (val: any | null) => void;
}

function PostRepairInspectionForm({
  targetSessionId,
  vehicle,
  existingFormId,
  savedVehicles,
  onClose,
  onSave,
  initialData,
  handoverVehiclesList = [],
  selectedInspectionForm = null,
  setSelectedInspectionForm
}: FormProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [repairRecordId, setRepairRecordId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');

  const [isHandoverDropdownOpen, setIsHandoverDropdownOpen] = useState(false);
  const [handoverSearch, setHandoverSearch] = useState('');

  // Load repair histories for selected vehicle to enable linking
  useEffect(() => {
    const loadRepairHistories = async () => {
      try {
        const stored = await DataService.load('repairHistory');
        if (Array.isArray(stored)) {
          const filtered = stored.filter((rh: any) => 
            rh.vehicleId === selectedVehicleId && !rh.isDeleted
          );
          if (filtered.length > 0) {
            setRepairRecordId(filtered[0].historyId || filtered[0].id || '');
          }
        }
      } catch (err) {
        console.warn("Failed to load repair histories:", err);
      }
    };
    if (selectedVehicleId) {
      loadRepairHistories();
    }
  }, [selectedVehicleId]);

  const [reportNo, setReportNo] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [engineBrand, setEngineBrand] = useState('');
  const [newEngineNumber, setNewEngineNumber] = useState('');
  const [newEngineBrand, setNewEngineBrand] = useState('');
  const [generatorNumber, setGeneratorNumber] = useState('');
  const [generatorBrand, setGeneratorBrand] = useState('');
  const [repairLevel, setRepairLevel] = useState('Lớn');

  const [receiveDay, setReceiveDay] = useState('');
  const [receiveMonth, setReceiveMonth] = useState('');
  const [receiveYear, setReceiveYear] = useState('');

  const [handoverDay, setHandoverDay] = useState('');
  const [handoverMonth, setHandoverMonth] = useState('');
  const [handoverYear, setHandoverYear] = useState('');

  const [docDay, setDocDay] = useState('');
  const [docMonth, setDocMonth] = useState('');
  const [docYear, setDocYear] = useState('');

  // Tech params
  const [enginePower, setEnginePower] = useState('');
  const [pressureCylinder1, setPressureCylinder1] = useState('');
  const [pressureCylinder2, setPressureCylinder2] = useState('');
  const [pressureCylinder3, setPressureCylinder3] = useState('');
  const [pressureCylinder4, setPressureCylinder4] = useState('');
  const [pressureCylinder5, setPressureCylinder5] = useState('');
  const [pressureCylinder6, setPressureCylinder6] = useState('');
  const [minOilPressure, setMinOilPressure] = useState('');
  const [maxOilPressure, setMaxOilPressure] = useState('');
  const [minCrankshaftSpeed, setMinCrankshaftSpeed] = useState('');
  const [maxCrankshaftSpeed, setMaxCrankshaftSpeed] = useState('');

  const [pistonDiameters, setPistonDiameters] = useState('');
  const [pistonCode, setPistonCode] = useState('');
  const [pistonClearance, setPistonClearance] = useState('');

  const [crankshaftDiameter, setCrankshaftDiameter] = useState('');
  const [crankshaftCode, setCrankshaftCode] = useState('');
  const [crankshaftClearance, setCrankshaftClearance] = useState('');
  const [crankshaftClearanceCode, setCrankshaftClearanceCode] = useState('');

  const [rodJournalDiameter, setRodJournalDiameter] = useState('');
  const [rodJournalCode, setRodJournalCode] = useState('');
  const [rodJournalClearance, setRodJournalClearance] = useState('');
  const [rodJournalClearanceCode, setRodJournalClearanceCode] = useState('');

  // Conditions
  const [engineCondition, setEngineCondition] = useState('');
  const [chassisCondition, setChassisCondition] = useState('');
  const [electricalCondition, setElectricalCondition] = useState('');
  const [bodyCondition, setBodyCondition] = useState('');
  const [specialEquipmentCondition, setSpecialEquipmentCondition] = useState('');
  const [fluidsCondition, setFluidsCondition] = useState('');

  const [inspectorName, setInspectorName] = useState('');
  const [commanderName, setCommanderName] = useState('');

  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const vId = vehicle?.vehicleId || (vehicle as any)?.id;
    if (vId) {
      setSelectedVehicleId(vId);
    } else if (savedVehicles.length > 0) {
      setSelectedVehicleId(savedVehicles[0].vehicleId);
    }
  }, [vehicle, savedVehicles]);

  const activeVehicle = savedVehicles.find(v => v.vehicleId === selectedVehicleId) || vehicle;

  const filteredVehicles = (savedVehicles || []).filter(v => {
    const plate = (v.plateNumber || '').toLowerCase();
    const term = dropdownSearch.toLowerCase().trim();
    return plate.includes(term);
  });

  const filteredHandoverList = (handoverVehiclesList || []).filter(item => {
    if (item.isDeleted || item.isDeleted === 'true' || item._original?.isDeleted) return false;
    if (targetSessionId) {
      const itemSessionId = item.repairSessionId || item._original?.repairSessionId;
      if (itemSessionId !== targetSessionId) return false;
    }
    const plate = (item.plateNumber || '').toLowerCase();
    const term = handoverSearch.toLowerCase().trim();
    return plate.includes(term);
  });

  const lastFilledFormId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedInspectionForm) {
      const formId = selectedInspectionForm.inspectionFormId || selectedInspectionForm.id;
      if (lastFilledFormId.current !== formId) {
        const extractedChassis = selectedInspectionForm.formData?.chassisNumber ||
                                 selectedInspectionForm.chassisNumber ||
                                 selectedInspectionForm._original?.formData?.chassisNumber ||
                                 selectedInspectionForm._original?.chassisNumber ||
                                 '';

        const extractedRepairLevel = selectedInspectionForm.formData?.repairLevel ||
                                     selectedInspectionForm.repairLevel ||
                                     selectedInspectionForm._original?.formData?.repairLevel ||
                                     selectedInspectionForm._original?.repairLevel ||
                                     '';

        if (extractedChassis) {
          setChassisNumber(extractedChassis);
        }
        if (extractedRepairLevel) {
          setRepairLevel(extractedRepairLevel);
        }

        lastFilledFormId.current = formId;
      }
    }
  }, [selectedInspectionForm]);

  useEffect(() => {
    if (initialData) {
      setReportNo(initialData.reportNo || '');
      setPlateNumber(initialData.plateNumber || activeVehicle?.plateNumber || '');
      setVehicleName(initialData.vehicleName || activeVehicle?.brand || '');
      setChassisNumber(initialData.chassisNumber || activeVehicle?.chassisNumber || '');
      setEngineNumber(initialData.engineNumber || activeVehicle?.engineNumber || '');
      setEngineBrand(initialData.engineBrand || '');
      setNewEngineNumber(initialData.newEngineNumber || '');
      setNewEngineBrand(initialData.newEngineBrand || '');
      setGeneratorNumber(initialData.generatorNumber || '');
      setGeneratorBrand(initialData.generatorBrand || '');
      setRepairLevel(initialData.repairLevel || 'Lớn');

      setReceiveDay(initialData.receiveDay || '');
      setReceiveMonth(initialData.receiveMonth || '');
      setReceiveYear(initialData.receiveYear || '');

      setHandoverDay(initialData.handoverDay || '');
      setHandoverMonth(initialData.handoverMonth || '');
      setHandoverYear(initialData.handoverYear || '');

      setDocDay(initialData.docDay || '');
      setDocMonth(initialData.docMonth || '');
      setDocYear(initialData.docYear || '');

      setEnginePower(initialData.enginePower || '');
      setPressureCylinder1(initialData.pressureCylinder1 || '');
      setPressureCylinder2(initialData.pressureCylinder2 || '');
      setPressureCylinder3(initialData.pressureCylinder3 || '');
      setPressureCylinder4(initialData.pressureCylinder4 || '');
      setPressureCylinder5(initialData.pressureCylinder5 || '');
      setPressureCylinder6(initialData.pressureCylinder6 || '');
      setMinOilPressure(initialData.minOilPressure || '');
      setMaxOilPressure(initialData.maxOilPressure || '');
      setMinCrankshaftSpeed(initialData.minCrankshaftSpeed || '');
      setMaxCrankshaftSpeed(initialData.maxCrankshaftSpeed || '');

      setPistonDiameters(initialData.pistonDiameters || '');
      setPistonCode(initialData.pistonCode || '');
      setPistonClearance(initialData.pistonClearance || '');

      setCrankshaftDiameter(initialData.crankshaftDiameter || '');
      setCrankshaftCode(initialData.crankshaftCode || '');
      setCrankshaftClearance(initialData.crankshaftClearance || '');
      setCrankshaftClearanceCode(initialData.crankshaftClearanceCode || '');

      setRodJournalDiameter(initialData.rodJournalDiameter || '');
      setRodJournalCode(initialData.rodJournalCode || '');
      setRodJournalClearance(initialData.rodJournalClearance || '');
      setRodJournalClearanceCode(initialData.rodJournalClearanceCode || '');

      setEngineCondition(initialData.engineCondition || initialData.engineStatus || '');
      setChassisCondition(initialData.chassisCondition || initialData.chassisStatus || '');
      setElectricalCondition(initialData.electricalCondition || initialData.electricalStatus || '');
      setBodyCondition(initialData.bodyCondition || initialData.bodyStatus || '');
      setSpecialEquipmentCondition(initialData.specialEquipmentCondition || '');
      setFluidsCondition(initialData.fluidsCondition || '');

      setInspectorName(initialData.inspectorName || '');
      setCommanderName(initialData.commanderName || '');
      setRepairRecordId(initialData.repairRecordId || '');
    } else {
      setRepairRecordId('');
      setReportNo('');
      setPlateNumber(activeVehicle?.plateNumber || '');
      setVehicleName(activeVehicle?.brand || '');
      setChassisNumber(activeVehicle?.chassisNumber || '');
      setEngineNumber(activeVehicle?.engineNumber || '');
      setEngineBrand('');
      setNewEngineNumber('');
      setNewEngineBrand('');
      setGeneratorNumber('');
      setGeneratorBrand('');
      setRepairLevel('');

      setReceiveDay('');
      setReceiveMonth('');
      setReceiveYear('');

      setHandoverDay('');
      setHandoverMonth('');
      setHandoverYear('');

      setDocDay('');
      setDocMonth('');
      setDocYear('');

      setEnginePower('');
      setPressureCylinder1('');
      setPressureCylinder2('');
      setPressureCylinder3('');
      setPressureCylinder4('');
      setPressureCylinder5('');
      setPressureCylinder6('');
      setMinOilPressure('');
      setMaxOilPressure('');
      setMinCrankshaftSpeed('');
      setMaxCrankshaftSpeed('');

      setPistonDiameters('');
      setPistonCode('');
      setPistonClearance('');

      setCrankshaftDiameter('');
      setCrankshaftCode('');
      setCrankshaftClearance('');
      setCrankshaftClearanceCode('');

      setRodJournalDiameter('');
      setRodJournalCode('');
      setRodJournalClearance('');
      setRodJournalClearanceCode('');

      setEngineCondition('');
      setChassisCondition('');
      setElectricalCondition('');
      setBodyCondition('');
      setSpecialEquipmentCondition('');
      setFluidsCondition('');

      setInspectorName('');
      setCommanderName('');
    }
  }, [activeVehicle, initialData]);

  useEffect(() => {
    if (!existingFormId && activeVehicle) {
      setPlateNumber(activeVehicle.plateNumber || '');
      setVehicleName(activeVehicle.brand || '');
      setChassisNumber(activeVehicle.chassisNumber || '');
      setEngineNumber(activeVehicle.engineNumber || '');
    }
  }, [activeVehicle, existingFormId]);

  const handleSaveClick = async () => {
    setIsSaving(true);
    const auditCreator = initialData?.createdBy ? {
      createdBy: initialData.createdBy,
      createdAt: initialData.createdAt,
      createdByName: initialData.createdByName,
      createdByRole: initialData.createdByRole
    } : getCreatorAuditParams();
    const auditUpdater = getUpdaterAuditParams();

    const payload = {
      id: initialData?.id || `POST_REP_INSP_${Date.now()}`,
      templateType: 'POST_REPAIR_INSPECTION',
      templateName: 'Phiếu kiểm tra hợp cách xuất xưởng',
      vehicleId: activeVehicle?.vehicleId || 'unknown_id',
      repairSessionId: targetSessionId || initialData?.repairSessionId || null,
      repairRecordId: repairRecordId || initialData?.repairRecordId || '',
      inspectionFormId: selectedInspectionForm?.id || selectedInspectionForm?.inspectionFormId || initialData?.inspectionFormId || '',
      plateNumber,
      vehicleName,
      vehicleType: activeVehicle?.vehicleType || initialData?.vehicleType || '',
      vehicleGroup: activeVehicle?.vehicleGroup || initialData?.vehicleGroup || '',
      repairLevel,
      receiveDate: (receiveDay && receiveMonth && receiveYear) ? `${receiveDay}/${receiveMonth}/${receiveYear}` : (initialData?.receiveDate || ''),
      handoverDate: (handoverDay && handoverMonth && handoverYear) ? `${handoverDay}/${handoverMonth}/${handoverYear}` : (initialData?.handoverDate || ''),
      senderUnit: initialData?.senderUnit || '',
      receiverUnit: initialData?.receiverUnit || '',
      reportNumber: reportNo,
      formData: initialData?.formData || null,
      reportNo,
      chassisNumber,
      engineNumber,
      engineBrand,
      newEngineNumber,
      newEngineBrand,
      generatorNumber,
      generatorBrand,
      receiveDay,
      receiveMonth,
      receiveYear,
      handoverDay,
      handoverMonth,
      handoverYear,
      docDay,
      docMonth,
      docYear,
      enginePower,
      pressureCylinder1,
      pressureCylinder2,
      pressureCylinder3,
      pressureCylinder4,
      pressureCylinder5,
      pressureCylinder6,
      minOilPressure,
      maxOilPressure,
      minCrankshaftSpeed,
      maxCrankshaftSpeed,
      pistonDiameters,
      pistonCode,
      pistonClearance,
      crankshaftDiameter,
      crankshaftCode,
      crankshaftClearance,
      crankshaftClearanceCode,
      rodJournalDiameter,
      rodJournalCode,
      rodJournalClearance,
      rodJournalClearanceCode,
      engineCondition,
      chassisCondition,
      electricalCondition,
      bodyCondition,
      specialEquipmentCondition,
      fluidsCondition,
      inspectorName,
      commanderName,
      ...auditCreator,
      ...auditUpdater,
      isDeleted: false
    };

    await onSave(payload);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className={`bg-stone-100 p-3 sm:p-6 rounded-xl flex flex-col space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto' : ''}`}>
      {/* 1. TOP CONTROL BAR */}
      <div className="flex flex-wrap justify-end items-center bg-white p-3 rounded-lg border border-stone-200 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-stone-50 px-2 py-1 rounded border border-stone-200">
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="text-xs font-bold px-1.5 py-0.5 text-stone-600 cursor-pointer">-</button>
            <span className="text-xs font-mono font-bold text-stone-700 min-w-[35px] text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="text-xs font-bold px-1.5 py-0.5 text-stone-600 cursor-pointer">+</button>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-stone-50 border border-stone-200 hover:bg-stone-100 rounded text-stone-600"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer transition-all border border-stone-200"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu & Khóa'}</span>
          </button>
        </div>
      </div>

      {/* 2. DIRECT A4 DOCUMENT SHEET EDITOR */}
      <div className="w-full overflow-x-auto bg-stone-300 p-4 rounded-xl flex justify-center shadow-inner min-h-[800px]">
        <div 
          className="bg-white p-8 md:p-12 shadow-2xl border border-stone-400 text-black shrink-0"
          style={{ 
            width: '210mm', 
            minHeight: '297mm',
            transform: `scale(${zoom / 100})`, 
            transformOrigin: 'top center',
            fontFamily: '"Times New Roman", Times, serif',
            lineHeight: '1.4'
          }}
        >
          {/* HEADER */}
          <div className="grid grid-cols-2 text-center items-start mb-6" style={{ fontSize: '11pt' }}>
            <div>
              <div className="font-bold uppercase">CỤC HẬU CẦN – KỸ THUẬT QĐ34</div>
              <div className="font-bold uppercase underline">TIỂU ĐOÀN SCTH 30</div>
              <div className="mt-1">
                Số: <input type="text" value={typeof (reportNo) === 'string' ? (reportNo).normalize('NFC') : (reportNo)} onChange={e => setReportNo(e.target.value.normalize('NFC'))} className="w-24 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" placeholder="..." /> /KCS
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold italic">Mẫu số: 11a/HD-SC</div>
            </div>
          </div>

          {/* TITLE */}
          <div className="text-center space-y-1 mb-6" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <h1 className="font-bold uppercase" style={{ fontSize: '15pt', lineHeight: '1.2' }}>
              PHIẾU KIỂM TRA HỢP CÁCH XUẤT XƯỞNG
            </h1>
            <div className="w-24 h-[1px] bg-stone-800 mx-auto mt-1.5"></div>
          </div>

          {/* VEHICLE INFO FIELDS */}
          <div className="space-y-1.5 text-[11.5pt] mb-4">
            <div className="flex items-center flex-wrap gap-x-1">
              <span>- Số đăng ký:</span>
              
              {/* SEARCHABLE DROPDOWN INTEGRATED DIRECTLY INTO THE PLATE NUMBER AREA */}
              <div className="relative inline-block text-left select-none">
                {isHandoverDropdownOpen && (
                  <div className="fixed inset-0 z-40 print:hidden" onClick={() => setIsHandoverDropdownOpen(false)} />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsHandoverDropdownOpen(!isHandoverDropdownOpen);
                    setHandoverSearch('');
                  }}
                  className="min-w-[12rem] px-2 border-b border-dotted border-stone-600 focus:outline-none bg-transparent font-bold text-center cursor-pointer min-h-[24px] inline-block align-bottom text-stone-900"
                  style={{ fontFamily: '"Times New Roman", Times, serif' }}
                >
                  {plateNumber ? (vehicleName ? `${plateNumber} | ${vehicleName}` : plateNumber) : 'Chọn xe ...................'}
                </button>
                
                {isHandoverDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-80 bg-white border border-stone-200 rounded-lg shadow-xl z-50 p-2 space-y-2 print:hidden" style={{ fontFamily: 'var(--font-sans)' }}>
                    <input
                      type="text"
                      placeholder="Tìm theo Số Đăng Ký (Biển kiểm soát)..."
                      value={typeof (handoverSearch) === 'string' ? (handoverSearch).normalize('NFC') : (handoverSearch)}
                      onChange={(e) => setHandoverSearch(e.target.value.normalize('NFC'))}
                      className="w-full border border-stone-200 rounded px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-normal bg-stone-50 text-left"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
                      {filteredHandoverList.length === 0 ? (
                        <div className="text-stone-400 text-xs text-center py-2 font-normal">Không tìm thấy xe</div>
                      ) : (
                        filteredHandoverList.map((item: any) => (
                          <div
                            key={item.inspectionFormId || item.id}
                            onClick={() => {
                              if (setSelectedInspectionForm) {
                                setSelectedInspectionForm(item);
                              }
                              setPlateNumber(item.plateNumber || '');
                              setVehicleName(item.vehicleName || '');
                              setIsHandoverDropdownOpen(false);
                            }}
                            className={`px-2 py-1.5 text-xs rounded cursor-pointer text-left transition-colors font-normal text-stone-700 hover:bg-emerald-50 hover:text-emerald-950 ${
                              (selectedInspectionForm?.inspectionFormId === item.inspectionFormId || selectedInspectionForm?.id === item.id) ? 'bg-emerald-50 text-emerald-900 font-medium' : ''
                            }`}
                          >
                            {`${item.plateNumber || 'N/A'} - ${item.vehicleName || 'N/A'}`}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center flex-wrap gap-x-1">
              <span>- Số khung:</span>
              <input type="text" value={typeof (chassisNumber) === 'string' ? (chassisNumber).normalize('NFC') : (chassisNumber)} onChange={e => setChassisNumber(e.target.value.normalize('NFC'))} className="flex-1 border-b border-dotted border-stone-600 focus:outline-none bg-transparent text-center font-bold" placeholder="........................................" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-1">
                <span>- Số động cơ:</span>
                <input type="text" value={typeof (engineNumber) === 'string' ? (engineNumber).normalize('NFC') : (engineNumber)} onChange={e => setEngineNumber(e.target.value.normalize('NFC'))} className="flex-1 border-b border-dotted border-stone-600 focus:outline-none bg-transparent text-center font-bold" placeholder="............" />
              </div>
              <div className="flex items-center gap-1">
                <span>Nhãn hiệu:</span>
                <input type="text" value={typeof (engineBrand) === 'string' ? (engineBrand).normalize('NFC') : (engineBrand)} onChange={e => setEngineBrand(e.target.value.normalize('NFC'))} className="flex-1 border-b border-dotted border-stone-600 focus:outline-none bg-transparent text-center font-bold" placeholder="............" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-1">
                <span>- Số động cơ mới:</span>
                <input type="text" value={typeof (newEngineNumber) === 'string' ? (newEngineNumber).normalize('NFC') : (newEngineNumber)} onChange={e => setNewEngineNumber(e.target.value.normalize('NFC'))} className="flex-1 border-b border-dotted border-stone-600 focus:outline-none bg-transparent text-center font-bold" placeholder="............" />
              </div>
              <div className="flex items-center gap-1">
                <span>Nhãn hiệu:</span>
                <input type="text" value={typeof (newEngineBrand) === 'string' ? (newEngineBrand).normalize('NFC') : (newEngineBrand)} onChange={e => setNewEngineBrand(e.target.value.normalize('NFC'))} className="flex-1 border-b border-dotted border-stone-600 focus:outline-none bg-transparent text-center font-bold" placeholder="............" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-1">
                <span>- Số máy phát điện chính:</span>
                <input type="text" value={typeof (generatorNumber) === 'string' ? (generatorNumber).normalize('NFC') : (generatorNumber)} onChange={e => setGeneratorNumber(e.target.value.normalize('NFC'))} className="flex-1 border-b border-dotted border-stone-600 focus:outline-none bg-transparent text-center font-bold" placeholder="............" />
              </div>
              <div className="flex items-center gap-1">
                <span>Nhãn hiệu:</span>
                <input type="text" value={typeof (generatorBrand) === 'string' ? (generatorBrand).normalize('NFC') : (generatorBrand)} onChange={e => setGeneratorBrand(e.target.value.normalize('NFC'))} className="flex-1 border-b border-dotted border-stone-600 focus:outline-none bg-transparent text-center font-bold" placeholder="............" />
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-x-1">
              <span>- Mức sửa chữa:</span>
              <input type="text" value={typeof (repairLevel) === 'string' ? (repairLevel).normalize('NFC') : (repairLevel)} onChange={e => setRepairLevel(e.target.value.normalize('NFC'))} className="w-32 border-b border-dotted border-stone-600 focus:outline-none bg-transparent text-center font-bold" placeholder="..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center flex-wrap gap-x-1">
                <span>- Ngày nhận xe: Ngày</span>
                <input type="text" value={typeof (receiveDay) === 'string' ? (receiveDay).normalize('NFC') : (receiveDay)} onChange={e => setReceiveDay(e.target.value.normalize('NFC'))} className="w-8 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" placeholder=".." />
                <span>tháng</span>
                <input type="text" value={typeof (receiveMonth) === 'string' ? (receiveMonth).normalize('NFC') : (receiveMonth)} onChange={e => setReceiveMonth(e.target.value.normalize('NFC'))} className="w-8 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" placeholder=".." />
                <span>năm</span>
                <input type="text" value={typeof (receiveYear) === 'string' ? (receiveYear).normalize('NFC') : (receiveYear)} onChange={e => setReceiveYear(e.target.value.normalize('NFC'))} className="w-14 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" placeholder="...." />
              </div>

              <div className="flex items-center flex-wrap gap-x-1">
                <span>- Ngày giao xe: Ngày</span>
                <input type="text" value={typeof (handoverDay) === 'string' ? (handoverDay).normalize('NFC') : (handoverDay)} onChange={e => setHandoverDay(e.target.value.normalize('NFC'))} className="w-8 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" placeholder=".." />
                <span>tháng</span>
                <input type="text" value={typeof (handoverMonth) === 'string' ? (handoverMonth).normalize('NFC') : (handoverMonth)} onChange={e => setHandoverMonth(e.target.value.normalize('NFC'))} className="w-8 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" placeholder=".." />
                <span>năm</span>
                <input type="text" value={typeof (handoverYear) === 'string' ? (handoverYear).normalize('NFC') : (handoverYear)} onChange={e => setHandoverYear(e.target.value.normalize('NFC'))} className="w-14 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" placeholder="...." />
              </div>
            </div>
          </div>

          {/* SECTION I: THÔNG SỐ KỸ THUẬT */}
          <div className="mt-5 space-y-2">
            <h2 className="font-bold text-center uppercase tracking-wide border-b border-stone-300 pb-1" style={{ fontSize: '11.5pt' }}>
              THÔNG SỐ KỸ THUẬT
            </h2>

            <div className="space-y-1.5 text-[11pt] leading-relaxed">
              <div className="flex items-center flex-wrap gap-x-1 pl-4">
                <span>- Công suất động cơ, kW (cv):</span>
                <input type="text" value={typeof (enginePower) === 'string' ? (enginePower).normalize('NFC') : (enginePower)} onChange={e => setEnginePower(e.target.value.normalize('NFC'))} className="w-48 border-b border-dotted border-stone-600 focus:outline-none bg-transparent font-bold text-center" placeholder="............" />
              </div>

              <div className="pl-4">
                <span>- Áp suất buồng đốt, kPa (kgf/cm2):</span>
                <div className="grid grid-cols-6 gap-2 mt-1 pl-4 font-mono text-[10pt]">
                  <div className="flex items-center gap-1"><span>Số 1:</span><input type="text" value={typeof (pressureCylinder1) === 'string' ? (pressureCylinder1).normalize('NFC') : (pressureCylinder1)} onChange={e => setPressureCylinder1(e.target.value.normalize('NFC'))} className="w-12 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" /></div>
                  <div className="flex items-center gap-1"><span>Số 2:</span><input type="text" value={typeof (pressureCylinder2) === 'string' ? (pressureCylinder2).normalize('NFC') : (pressureCylinder2)} onChange={e => setPressureCylinder2(e.target.value.normalize('NFC'))} className="w-12 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" /></div>
                  <div className="flex items-center gap-1"><span>Số 3:</span><input type="text" value={typeof (pressureCylinder3) === 'string' ? (pressureCylinder3).normalize('NFC') : (pressureCylinder3)} onChange={e => setPressureCylinder3(e.target.value.normalize('NFC'))} className="w-12 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" /></div>
                  <div className="flex items-center gap-1"><span>Số 4:</span><input type="text" value={typeof (pressureCylinder4) === 'string' ? (pressureCylinder4).normalize('NFC') : (pressureCylinder4)} onChange={e => setPressureCylinder4(e.target.value.normalize('NFC'))} className="w-12 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" /></div>
                  <div className="flex items-center gap-1"><span>Số 5:</span><input type="text" value={typeof (pressureCylinder5) === 'string' ? (pressureCylinder5).normalize('NFC') : (pressureCylinder5)} onChange={e => setPressureCylinder5(e.target.value.normalize('NFC'))} className="w-12 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" /></div>
                  <div className="flex items-center gap-1"><span>Số 6:</span><input type="text" value={typeof (pressureCylinder6) === 'string' ? (pressureCylinder6).normalize('NFC') : (pressureCylinder6)} onChange={e => setPressureCylinder6(e.target.value.normalize('NFC'))} className="w-12 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" /></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pl-4">
                <div className="flex items-center gap-1">
                  <span>- Áp suất dầu bôi trơn nhỏ nhất, kPa:</span>
                  <input type="text" value={typeof (minOilPressure) === 'string' ? (minOilPressure).normalize('NFC') : (minOilPressure)} onChange={e => setMinOilPressure(e.target.value.normalize('NFC'))} className="w-20 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" />
                </div>
                <div className="flex items-center gap-1">
                  <span>Áp suất dầu bôi trơn lớn nhất, kPa:</span>
                  <input type="text" value={typeof (maxOilPressure) === 'string' ? (maxOilPressure).normalize('NFC') : (maxOilPressure)} onChange={e => setMaxOilPressure(e.target.value.normalize('NFC'))} className="w-20 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" />
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-x-2 pl-4">
                <span>- Tốc độ vòng quay của trục khuỷu, r/min:</span>
                <span>nhỏ nhất:</span>
                <input type="text" value={typeof (minCrankshaftSpeed) === 'string' ? (minCrankshaftSpeed).normalize('NFC') : (minCrankshaftSpeed)} onChange={e => setMinCrankshaftSpeed(e.target.value.normalize('NFC'))} className="w-20 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" />
                <span>lớn nhất:</span>
                <input type="text" value={typeof (maxCrankshaftSpeed) === 'string' ? (maxCrankshaftSpeed).normalize('NFC') : (maxCrankshaftSpeed)} onChange={e => setMaxCrankshaftSpeed(e.target.value.normalize('NFC'))} className="w-20 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" />
              </div>

              <div className="flex items-center flex-wrap gap-x-1 pl-4">
                <span>- Đường kính các piston:</span>
                <input type="text" value={typeof (pistonDiameters) === 'string' ? (pistonDiameters).normalize('NFC') : (pistonDiameters)} onChange={e => setPistonDiameters(e.target.value.normalize('NFC'))} className="flex-1 border-b border-dotted border-stone-600 focus:outline-none bg-transparent font-bold text-center" placeholder="........................................" />
                <span className="ml-1">(Code:</span>
                <input type="text" value={typeof (pistonCode) === 'string' ? (pistonCode).normalize('NFC') : (pistonCode)} onChange={e => setPistonCode(e.target.value.normalize('NFC'))} className="w-16 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" />
                <span>)</span>
              </div>

              <div className="flex items-center flex-wrap gap-x-1 pl-4">
                <span>- Khe hở giữa váy piston với xy lanh:</span>
                <input type="text" value={typeof (pistonClearance) === 'string' ? (pistonClearance).normalize('NFC') : (pistonClearance)} onChange={e => setPistonClearance(e.target.value.normalize('NFC'))} className="flex-1 border-b border-dotted border-stone-600 focus:outline-none bg-transparent font-bold text-center" placeholder="..............." />
              </div>

              <div className="flex items-center flex-wrap gap-x-1 pl-4">
                <span>- Đường kính cổ trục khuỷu:</span>
                <input type="text" value={typeof (crankshaftDiameter) === 'string' ? (crankshaftDiameter).normalize('NFC') : (crankshaftDiameter)} onChange={e => setCrankshaftDiameter(e.target.value.normalize('NFC'))} className="flex-1 border-b border-dotted border-stone-600 focus:outline-none bg-transparent font-bold text-center" placeholder="........................................" />
                <span className="ml-1">(Code:</span>
                <input type="text" value={typeof (crankshaftCode) === 'string' ? (crankshaftCode).normalize('NFC') : (crankshaftCode)} onChange={e => setCrankshaftCode(e.target.value.normalize('NFC'))} className="w-16 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" />
                <span>)</span>
              </div>

              <div className="flex items-center flex-wrap gap-x-1 pl-4">
                <span>- Khe hở giữa cổ trục khuỷu và bạc:</span>
                <input type="text" value={typeof (crankshaftClearance) === 'string' ? (crankshaftClearance).normalize('NFC') : (crankshaftClearance)} onChange={e => setCrankshaftClearance(e.target.value.normalize('NFC'))} className="flex-1 border-b border-dotted border-stone-600 focus:outline-none bg-transparent font-bold text-center" placeholder="........................................" />
                <span className="ml-1">(Code:</span>
                <input type="text" value={typeof (crankshaftClearanceCode) === 'string' ? (crankshaftClearanceCode).normalize('NFC') : (crankshaftClearanceCode)} onChange={e => setCrankshaftClearanceCode(e.target.value.normalize('NFC'))} className="w-16 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" />
                <span>)</span>
              </div>

              <div className="flex items-center flex-wrap gap-x-1 pl-4">
                <span>- Đường kính cổ biên:</span>
                <input type="text" value={typeof (rodJournalDiameter) === 'string' ? (rodJournalDiameter).normalize('NFC') : (rodJournalDiameter)} onChange={e => setRodJournalDiameter(e.target.value.normalize('NFC'))} className="flex-1 border-b border-dotted border-stone-600 focus:outline-none bg-transparent font-bold text-center" placeholder="........................................" />
                <span className="ml-1">(Code:</span>
                <input type="text" value={typeof (rodJournalCode) === 'string' ? (rodJournalCode).normalize('NFC') : (rodJournalCode)} onChange={e => setRodJournalCode(e.target.value.normalize('NFC'))} className="w-16 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" />
                <span>)</span>
              </div>

              <div className="flex items-center flex-wrap gap-x-1 pl-4">
                <span>- Khe hở giữa cổ biên và bạc:</span>
                <input type="text" value={typeof (rodJournalClearance) === 'string' ? (rodJournalClearance).normalize('NFC') : (rodJournalClearance)} onChange={e => setRodJournalClearance(e.target.value.normalize('NFC'))} className="flex-1 border-b border-dotted border-stone-600 focus:outline-none bg-transparent font-bold text-center" placeholder="........................................" />
                <span className="ml-1">(Code:</span>
                <input type="text" value={typeof (rodJournalClearanceCode) === 'string' ? (rodJournalClearanceCode).normalize('NFC') : (rodJournalClearanceCode)} onChange={e => setRodJournalClearanceCode(e.target.value.normalize('NFC'))} className="w-16 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" />
                <span>)</span>
              </div>
            </div>
          </div>

          {/* SECTION II: TÌNH TRẠNG KỸ THUẬT */}
          <div className="mt-5 space-y-3">
            <h2 className="font-bold text-center uppercase tracking-wide border-b border-stone-300 pb-1" style={{ fontSize: '11.5pt' }}>
              TÌNH TRẠNG KỸ THUẬT
            </h2>

            <div className="space-y-3 text-[11pt]">
              <div className="space-y-1">
                <span className="font-bold pl-2">I. Phần động cơ:</span>
                <AutoResizeTextarea value={typeof (engineCondition) === 'string' ? (engineCondition).normalize('NFC') : (engineCondition)} onChange={e => setEngineCondition(e.target.value.normalize('NFC'))} className="w-full text-xs p-2 border border-stone-300 rounded font-serif bg-transparent outline-none leading-relaxed text-justify" style={{ fontSize: '10.5pt' }} />
              </div>

              <div className="space-y-1">
                <span className="font-bold pl-2">II. Phần gầm (ly hợp, hộp số, cầu xe, chuyển hướng, phanh):</span>
                <AutoResizeTextarea value={typeof (chassisCondition) === 'string' ? (chassisCondition).normalize('NFC') : (chassisCondition)} onChange={e => setChassisCondition(e.target.value.normalize('NFC'))} className="w-full text-xs p-2 border border-stone-300 rounded font-serif bg-transparent outline-none leading-relaxed text-justify" style={{ fontSize: '10.5pt' }} />
              </div>

              <div className="space-y-1">
                <span className="font-bold pl-2">III. Phần điện:</span>
                <AutoResizeTextarea value={typeof (electricalCondition) === 'string' ? (electricalCondition).normalize('NFC') : (electricalCondition)} onChange={e => setElectricalCondition(e.target.value.normalize('NFC'))} className="w-full text-xs p-2 border border-stone-300 rounded font-serif bg-transparent outline-none leading-relaxed text-justify" style={{ fontSize: '10.5pt' }} />
              </div>

              <div className="space-y-1">
                <span className="font-bold pl-2">IV. Phần thân, thùng, vỏ, nội thất:</span>
                <AutoResizeTextarea value={typeof (bodyCondition) === 'string' ? (bodyCondition).normalize('NFC') : (bodyCondition)} onChange={e => setBodyCondition(e.target.value.normalize('NFC'))} className="w-full text-xs p-2 border border-stone-300 rounded font-serif bg-transparent outline-none leading-relaxed text-justify" style={{ fontSize: '10.5pt' }} />
              </div>

              <div className="space-y-1">
                <span className="font-bold pl-2">V. Phần đặc chủng:</span>
                <AutoResizeTextarea value={typeof (specialEquipmentCondition) === 'string' ? (specialEquipmentCondition).normalize('NFC') : (specialEquipmentCondition)} onChange={e => setSpecialEquipmentCondition(e.target.value.normalize('NFC'))} className="w-full text-xs p-2 border border-stone-300 rounded font-serif bg-transparent outline-none leading-relaxed text-justify" style={{ fontSize: '10.5pt' }} />
              </div>

              <div className="space-y-1">
                <span className="font-bold pl-2">VI. Dầu, mỡ bôi trơn, dầu phanh:</span>
                <AutoResizeTextarea value={typeof (fluidsCondition) === 'string' ? (fluidsCondition).normalize('NFC') : (fluidsCondition)} onChange={e => setFluidsCondition(e.target.value.normalize('NFC'))} className="w-full text-xs p-2 border border-stone-300 rounded font-serif bg-transparent outline-none leading-relaxed text-justify" style={{ fontSize: '10.5pt' }} />
              </div>
            </div>
          </div>

          {/* SIGNATURES DATE */}
          <div className="text-right mt-6 italic text-[11pt] pl-4">
            Gia Lai, ngày <input type="text" value={typeof (docDay) === 'string' ? (docDay).normalize('NFC') : (docDay)} onChange={e => setDocDay(e.target.value.normalize('NFC'))} className="w-8 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" placeholder=".." /> tháng <input type="text" value={typeof (docMonth) === 'string' ? (docMonth).normalize('NFC') : (docMonth)} onChange={e => setDocMonth(e.target.value.normalize('NFC'))} className="w-8 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" placeholder=".." /> năm <input type="text" value={typeof (docYear) === 'string' ? (docYear).normalize('NFC') : (docYear)} onChange={e => setDocYear(e.target.value.normalize('NFC'))} className="w-14 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" placeholder="...." />
          </div>

          {/* SIGNATURES */}
          <div className="grid grid-cols-2 text-center text-[11pt] mt-4 font-serif">
            <div>
              <div className="font-bold uppercase">KCS</div>
              <div className="italic text-stone-500 font-normal mt-0.5 text-[10pt]">(Ký, ghi rõ họ tên)</div>
              <div className="mt-14">
                <input type="text" value={typeof (inspectorName) === 'string' ? (inspectorName).normalize('NFC') : (inspectorName)} onChange={e => setInspectorName(e.target.value.normalize('NFC'))} className="w-48 border-b border-dotted border-stone-400 text-center focus:outline-none bg-transparent font-bold" />
              </div>
            </div>
            <div>
              <div className="font-bold uppercase">CHỈ HUY ĐƠN VỊ</div>
              <div className="italic text-stone-500 font-normal mt-0.5 text-[10pt]">(Ký tên, đóng dấu)</div>
              <div className="mt-14">
                <input type="text" value={typeof (commanderName) === 'string' ? (commanderName).normalize('NFC') : (commanderName)} onChange={e => setCommanderName(e.target.value.normalize('NFC'))} className="w-48 border-b border-dotted border-stone-400 text-center focus:outline-none bg-transparent font-bold" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   2. FORM: BIÊN BẢN BÀN GIAO XE HOÀN THÀNH SỬA CHỮA (IMPORTED)
   ========================================================== */
// Imported from ./PostRepairVehicleHandoverForm

/* ==========================================================
   PRINT VIEWS FOR PROFESSIONAL EXPORT
   ========================================================== */
function PostRepairInspectionPrintView({ data }: { data: any }) {
  return (
    <div 
      className="bg-white p-12 shadow-md border border-stone-200 font-serif text-black mx-auto shrink-0"
      style={{ 
        width: '210mm', 
        minHeight: '297mm',
        fontFamily: '"Times New Roman", Times, serif',
        lineHeight: '1.4'
      }}
    >
      {/* HEADER */}
      <div className="grid grid-cols-2 text-center items-start mb-6" style={{ fontSize: '11pt' }}>
        <div>
          <div className="font-bold uppercase">CỤC HẬU CẦN – KỸ THUẬT QĐ34</div>
          <div className="font-bold uppercase underline">TIỂU ĐOÀN SCTH 30</div>
          <div className="mt-1 font-bold">
            Số: {data.reportNo || '.......'} /KCS
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold italic">Mẫu số: 11a/HD-SC</div>
        </div>
      </div>

      {/* TITLE */}
      <div className="text-center space-y-1 mb-6">
        <h1 className="font-bold uppercase tracking-normal font-serif" style={{ fontSize: '16pt' }}>
          PHIẾU KIỂM TRA HỢP CÁCH XUẤT XƯỞNG
        </h1>
        <div className="w-24 h-[1px] bg-stone-800 mx-auto mt-1"></div>
      </div>

      {/* VEHICLE INFO FIELDS */}
      <div className="space-y-2 text-[11.5pt] mb-4 text-justify">
        <div className="border-b border-dotted border-stone-300 pb-0.5">
          <span className="font-medium">- Số đăng ký:</span> <strong className="ml-1 text-stone-900">{data.plateNumber || '........................................'}</strong>
        </div>
        
        <div className="border-b border-dotted border-stone-300 pb-0.5">
          <span className="font-medium">- Nhãn xe:</span> <strong className="ml-1 text-stone-900">{data.vehicleName || '........................................'}</strong>
        </div>

        <div className="border-b border-dotted border-stone-300 pb-0.5">
          <span className="font-medium">- Số khung:</span> <strong className="ml-1 text-stone-900">{data.chassisNumber || '........................................'}</strong>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-dotted border-stone-300 pb-0.5">
          <div>
            <span className="font-medium">- Số động cơ:</span> <strong className="ml-1 text-stone-900">{data.engineNumber || '................'}</strong>
          </div>
          <div>
            <span className="font-medium">Nhãn hiệu:</span> <strong className="ml-1 text-stone-900">{data.engineBrand || '................'}</strong>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-dotted border-stone-300 pb-0.5">
          <div>
            <span className="font-medium">- Số động cơ mới:</span> <strong className="ml-1 text-stone-900">{data.newEngineNumber || '................'}</strong>
          </div>
          <div>
            <span className="font-medium">Nhãn hiệu:</span> <strong className="ml-1 text-stone-900">{data.newEngineBrand || '................'}</strong>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-dotted border-stone-300 pb-0.5">
          <div>
            <span className="font-medium">- Số máy phát điện chính:</span> <strong className="ml-1 text-stone-900">{data.generatorNumber || '................'}</strong>
          </div>
          <div>
            <span className="font-medium">Nhãn hiệu:</span> <strong className="ml-1 text-stone-900">{data.generatorBrand || '................'}</strong>
          </div>
        </div>

        <div className="border-b border-dotted border-stone-300 pb-0.5">
          <span className="font-medium">- Mức sửa chữa:</span> <strong className="ml-1 text-stone-900">{data.repairLevel || 'Lớn'}</strong>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-dotted border-stone-300 pb-0.5">
          <div>
            <span className="font-medium">- Ngày nhận xe: Ngày</span> <strong className="text-stone-900">{data.receiveDay || '..'}</strong> <span className="font-medium">tháng</span> <strong className="text-stone-900">{data.receiveMonth || '..'}</strong> <span className="font-medium">năm</span> <strong className="text-stone-900">{data.receiveYear || '....'}</strong>
          </div>
          <div>
            <span className="font-medium">- Ngày giao xe: Ngày</span> <strong className="text-stone-900">{data.handoverDay || '..'}</strong> <span className="font-medium">tháng</span> <strong className="text-stone-900">{data.handoverMonth || '..'}</strong> <span className="font-medium">năm</span> <strong className="text-stone-900">{data.handoverYear || '....'}</strong>
          </div>
        </div>
      </div>

      {/* SECTION I: THÔNG SỐ KỸ THUẬT */}
      <div className="mt-5 space-y-2">
        <h2 className="font-bold text-center uppercase tracking-wide border-b border-stone-400 pb-1 text-[11.5pt]">
          THÔNG SỐ KỸ THUẬT
        </h2>

        <div className="space-y-2 text-[11pt] leading-relaxed">
          <div className="border-b border-dotted border-stone-300 pb-0.5 pl-4">
            <span className="font-medium">- Công suất động cơ, kW (cv):</span> <strong className="ml-1 text-stone-900">{data.enginePower || '................'}</strong>
          </div>

          <div className="border-b border-dotted border-stone-300 pb-0.5 pl-4">
            <span className="font-medium">- Áp suất buồng đốt, kPa (kgf/cm2):</span>
            <div className="grid grid-cols-6 gap-2 mt-1 pl-4 font-mono text-[10pt]">
              <div><span>Số 1:</span> <strong className="text-stone-900">{data.pressureCylinder1 || '....'}</strong></div>
              <div><span>Số 2:</span> <strong className="text-stone-900">{data.pressureCylinder2 || '....'}</strong></div>
              <div><span>Số 3:</span> <strong className="text-stone-900">{data.pressureCylinder3 || '....'}</strong></div>
              <div><span>Số 4:</span> <strong className="text-stone-900">{data.pressureCylinder4 || '....'}</strong></div>
              <div><span>Số 5:</span> <strong className="text-stone-900">{data.pressureCylinder5 || '....'}</strong></div>
              <div><span>Số 6:</span> <strong className="text-stone-900">{data.pressureCylinder6 || '....'}</strong></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-dotted border-stone-300 pb-0.5 pl-4">
            <div>
              <span className="font-medium">- Áp suất dầu bôi trơn nhỏ nhất, kPa:</span> <strong className="ml-1 text-stone-900">{data.minOilPressure || '....'}</strong>
            </div>
            <div>
              <span className="font-medium">Áp suất dầu bôi trơn lớn nhất, kPa:</span> <strong className="ml-1 text-stone-900">{data.maxOilPressure || '....'}</strong>
            </div>
          </div>

          <div className="border-b border-dotted border-stone-300 pb-0.5 pl-4">
            <span className="font-medium">- Tốc độ vòng quay của trục khuỷu, r/min:</span> <span className="font-medium">nhỏ nhất:</span> <strong className="text-stone-900">{data.minCrankshaftSpeed || '....'}</strong> <span className="font-medium">lớn nhất:</span> <strong className="text-stone-900">{data.maxCrankshaftSpeed || '....'}</strong>
          </div>

          <div className="border-b border-dotted border-stone-300 pb-0.5 pl-4">
            <span className="font-medium">- Đường kính các piston:</span> <strong className="text-stone-900">{data.pistonDiameters || '........................................'}</strong> <span className="font-medium">(Code:</span> <strong className="text-stone-900">{data.pistonCode || '...'}</strong><span className="font-medium">)</span>
          </div>

          <div className="border-b border-dotted border-stone-300 pb-0.5 pl-4">
            <span className="font-medium">- Khe hở giữa váy piston với xy lanh:</span> <strong className="text-stone-900">{data.pistonClearance || '................'}</strong>
          </div>

          <div className="border-b border-dotted border-stone-300 pb-0.5 pl-4">
            <span className="font-medium">- Đường kính cổ trục khuỷu:</span> <strong className="text-stone-900">{data.crankshaftDiameter || '........................................'}</strong> <span className="font-medium">(Code:</span> <strong className="text-stone-900">{data.crankshaftCode || '...'}</strong><span className="font-medium">)</span>
          </div>

          <div className="border-b border-dotted border-stone-300 pb-0.5 pl-4">
            <span className="font-medium">- Khe hở giữa cổ trục khuỷu và bạc:</span> <strong className="text-stone-900">{data.crankshaftClearance || '........................................'}</strong> <span className="font-medium">(Code:</span> <strong className="text-stone-900">{data.crankshaftClearanceCode || '...'}</strong><span className="font-medium">)</span>
          </div>

          <div className="border-b border-dotted border-stone-300 pb-0.5 pl-4">
            <span className="font-medium">- Đường kính cổ biên:</span> <strong className="text-stone-900">{data.rodJournalDiameter || '........................................'}</strong> <span className="font-medium">(Code:</span> <strong className="text-stone-900">{data.rodJournalCode || '...'}</strong><span className="font-medium">)</span>
          </div>

          <div className="border-b border-dotted border-stone-300 pb-0.5 pl-4">
            <span className="font-medium">- Khe hở giữa cổ biên và bạc:</span> <strong className="text-stone-900">{data.rodJournalClearance || '........................................'}</strong> <span className="font-medium">(Code:</span> <strong className="text-stone-900">{data.rodJournalClearanceCode || '...'}</strong><span className="font-medium">)</span>
          </div>
        </div>
      </div>

      {/* SECTION II: TÌNH TRẠNG KỸ THUẬT */}
      <div className="mt-5 space-y-3">
        <h2 className="font-bold text-center uppercase tracking-wide border-b border-stone-400 pb-1 text-[11.5pt]">
          TÌNH TRẠNG KỸ THUẬT
        </h2>

        <div className="space-y-3.5 text-[11pt] text-justify leading-relaxed">
          <div>
            <div className="font-bold pl-2">- I. Phần động cơ:</div>
            <div className="pl-4 whitespace-pre-wrap italic text-stone-800">{data.engineCondition || data.engineStatus}</div>
          </div>

          <div>
            <div className="font-bold pl-2">- II. Phần gầm:</div>
            <div className="pl-4 whitespace-pre-wrap italic text-stone-800">{data.chassisCondition || data.chassisStatus}</div>
          </div>

          <div>
            <div className="font-bold pl-2">- III. Phần điện:</div>
            <div className="pl-4 whitespace-pre-wrap italic text-stone-800">{data.electricalCondition || data.electricalStatus}</div>
          </div>

          <div>
            <div className="font-bold pl-2">- IV. Phần thân, thùng, vỏ, nội thất:</div>
            <div className="pl-4 whitespace-pre-wrap italic text-stone-800">{data.bodyCondition || data.bodyStatus}</div>
          </div>

          <div>
            <div className="font-bold pl-2">- V. Phần đặc chủng:</div>
            <div className="pl-4 whitespace-pre-wrap italic text-stone-800">{data.specialEquipmentCondition || 'Không có trang bị đặc chủng.'}</div>
          </div>

          <div>
            <div className="font-bold pl-2">- VI. Dầu, mỡ bôi trơn, dầu phanh:</div>
            <div className="pl-4 whitespace-pre-wrap italic text-stone-800">{data.fluidsCondition || 'Mức dầu mỡ đầy đủ đạt tiêu chuẩn.'}</div>
          </div>
        </div>
      </div>

      {/* SIGNATURES DATE */}
      <div className="text-right mt-6 italic text-[11pt]">
        Gia Lai, ngày {data.docDay || '...'} tháng {data.docMonth || '...'} năm {data.docYear || '2026'}
      </div>

      {/* SIGNATURES */}
      <div className="grid grid-cols-2 text-center text-[11pt] mt-4 font-serif leading-relaxed">
        <div>
          <div className="font-bold uppercase">KCS</div>
          <div className="italic text-stone-500 font-normal text-[10pt]">(Ký, ghi rõ họ tên)</div>
          <div className="mt-20 font-bold text-stone-900">{data.inspectorName || ''}</div>
        </div>
        <div>
          <div className="font-bold uppercase">CHỈ HUY ĐƠN VỊ</div>
          <div className="italic text-stone-500 font-normal text-[10pt]">(Ký tên, đóng dấu)</div>
          <div className="mt-20 font-bold text-stone-900">{data.commanderName || ''}</div>
        </div>
      </div>
    </div>
  );
}



