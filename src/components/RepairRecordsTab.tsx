import React, { useState, useEffect, useMemo } from "react";
import {
  Folder,
  ChevronRight,
  ChevronDown,
  Wrench,
  FileText,
  Plus,
  Trash2,
  Shield,
  Settings,
  PenTool,
  CheckCircle,
  ClipboardList,
  Truck,
  Search,
  RefreshCw,
  X
} from "lucide-react";
import { Vehicle, RepairSession, RepairCampaign } from "../types";
import { DataService } from "../firebase";
import { getCurrentUserSession } from "../services/dbService";
import { canEditDocument, canDeleteDocument } from "../services/ownershipService";
import { canEditModule } from "../services/permissionService";
import { formatVNTime } from "../utils/time";
import { resolveCampaignName, resolveSessionYear } from "../services/repairCampaignService";

// Forms
import { EngineInspectionBeforeRepairForm } from "./EngineInspectionBeforeRepairForm";
import { InteriorInspectionBeforeRepairForm } from "./InteriorInspectionBeforeRepairForm";
import { BodyInspectionBeforeRepairForm } from "./BodyInspectionBeforeRepairForm";
import { PaintInspectionBeforeRepairForm } from "./PaintInspectionBeforeRepairForm";
import { GeneralDisassemblyRepairForm } from "./GeneralDisassemblyRepairForm";
import { EngineComponentDisassemblyForm } from "./EngineComponentDisassemblyForm";
import { EngineComponentRepairForm } from "./EngineComponentRepairForm";
import { LapRapDongCoForm } from "./LapRapDongCoForm";
import { PartsCleaningRepairForm } from "./PartsCleaningRepairForm";
import { ThuNghiemTongTheForm } from "./ThuNghiemTongTheForm";
import { PhieuTongLapTrangBiKyThuatForm } from "./PhieuTongLapTrangBiKyThuatForm";
import { KiemTraNoiThatSonSauSuaChuaForm } from "./KiemTraNoiThatSonSauSuaChuaForm";
import { SonLenMauForm } from "./SonLenMauForm";
import { ChongGiVaTaoBeMatSonForm } from "./ChongGiVaTaoBeMatSonForm";
import { TayRuaLamSachBeMatSonForm } from "./TayRuaLamSachBeMatSonForm";
import { KiemTraThanVoSauSuaChuaForm } from "./KiemTraThanVoSauSuaChuaForm";
import { XuLyBeMatThanVoForm } from "./XuLyBeMatThanVoForm";
import { KiemTraSauTongLapDienForm } from "./KiemTraSauTongLapDienForm";
import { SuaChuaChiTietCumDienForm } from "./SuaChuaChiTietCumDienForm";
import { TayRuaLamSachCumDienForm } from "./TayRuaLamSachCumDienForm";
import { TongThaoCumDienForm } from "./TongThaoCumDienForm";
import { KiemTraSauLapDongCoForm } from "./KiemTraSauLapDongCoForm";
import { KiemTraSauTongLapGamForm } from "./KiemTraSauTongLapGamForm";
import { LapRapHieuChinhGamForm } from "./LapRapHieuChinhGamForm";
import { SuaChuaChiTietCumGamForm } from "./SuaChuaChiTietCumGamForm";
import { TayRuaLamSachCumGamForm } from "./TayRuaLamSachCumGamForm";
import { TongThaoCumGamForm } from "./TongThaoCumGamForm";

export function formatVietnamDate(value: any): string {
  return formatVNTime(value) || "Không rõ";
}

interface RepairRecordsTabProps {
  viewMode: string;
  setViewMode: (mode: any) => void;
  selectedVehicle: Vehicle | null;
  selectedRepairSession?: RepairSession | null;
  onSelectRepairSession?: (s: RepairSession | null) => void;
  savedVehicles: Vehicle[];
  pendingOpenRequest?: any;
  onClearPendingOpenRequest?: () => void;
}

const STAGES = [
  {
    id: "TONG_THAO",
    label: "1. Tổng tháo trang thiết bị",
    icon: <ClipboardList className="w-5 h-5" />,
    templates: [
      { id: "ENGINE_PRE_REPAIR", label: "Phiếu kiểm tra động cơ trước sửa chữa" },
      { id: "CHASSIS_PRE_REPAIR", label: "Phiếu kiểm tra gầm trước sửa chữa" },
      { id: "ELECTRICAL_PRE_REPAIR", label: "Phiếu kiểm tra điện trước sửa chữa" },
      { id: "BODY_PRE_REPAIR", label: "Phiếu kiểm tra thân vỏ trước sửa chữa" },
      { id: "INTERIOR_PRE_REPAIR", label: "Phiếu kiểm tra nội thất trước sửa chữa" },
      { id: "PAINT_PRE_REPAIR", label: "Phiếu kiểm tra sơn trước sửa chữa" },
      { id: "GENERAL_DISASSEMBLY_REPAIR", label: "Phiếu sửa chữa tổng tháo" },
    ]
  },
  {
    id: "SUA_MAY",
    label: "2. Công đoạn sửa chữa máy",
    icon: <Wrench className="w-5 h-5" />,
    templates: [
      { id: "ENGINE_COMPONENT_DISASSEMBLY", label: "Phiếu tổng tháo cụm chi tiết" },
      { id: "PARTS_CLEANING_REPAIR", label: "Tẩy rửa, làm sạch chi tiết" },
      { id: "ENGINE_COMPONENT_REPAIR", label: "Sửa chữa chi tiết, linh kiện của cụm" },
      { id: "LAP_RAP", label: "Lắp ráp, hiệu chỉnh, chạy rà cụm động cơ" },
      { id: "KIEM_TRA_SAU_LAP", label: "Kiểm tra sau tổng lắp động cơ" },
    ]
  },
  {
    id: "SUA_GAM",
    label: "3. Công đoạn sửa chữa gầm",
    icon: <Settings className="w-5 h-5" />,
    templates: [
      { id: "TONG_THAO_CUM_GAM", label: "Phiếu tổng tháo cụm gầm" },
      { id: "TAY_RUA_GAM", label: "Tẩy rửa, làm sạch chi tiết" },
      { id: "SUA_CHUA_GAM", label: "Sửa chữa chi tiết, linh kiện của cụm" },
      { id: "LAP_RAP_GAM", label: "Lắp ráp, hiệu chỉnh, chạy rà cụm" },
      { id: "KIEM_TRA_GAM", label: "Kiểm tra sau tổng lắp" },
    ]
  },
  {
    id: "SUA_DIEN",
    label: "4. Công đoạn sửa chữa điện",
    icon: <Shield className="w-5 h-5" />,
    templates: [
      { id: "TONG_THAO_CUM_DIEN", label: "Phiếu tổng tháo hệ thống điện" },
      { id: "TAY_RUA_DIEN", label: "Tẩy rửa, làm sạch chi tiết" },
      { id: "SUA_CHUA_DIEN", label: "Sửa chữa chi tiết, linh kiện của cụm" },
      { id: "KIEM_TRA_DIEN", label: "Kiểm tra sau tổng lắp" },
    ]
  },
  {
    id: "SUA_VOTHE",
    label: "5. Công đoạn sửa chữa thân vỏ, nội thất, sơn",
    icon: <FileText className="w-5 h-5" />,
    templates: [
      { id: "XU_LY_BE_MAT", label: "Phiếu xử lý bề mặt linh kiện, chi tiết" },
      { id: "KIEM_TRA_THAN_VO", label: "Phiếu kiểm tra thân vỏ sau sửa chữa" },
      { id: "TAY_RUA_SON", label: "Phiếu tẩy rửa, làm sạch bề mặt sơn" },
      { id: "CHONG_GI", label: "Phiếu chống gỉ và tạo bề mặt sơn" },
      { id: "SON_LEN_MAU", label: "Phiếu Sơn lên màu" },
      { id: "KIEM_TRA_NOI_THAT_SON", label: "Kiểm tra nội thất, sơn sau sửa chữa" },
    ]
  },
  {
    id: "TONG_LAP",
    label: "6. Tổng lắp Trang thiết bị",
    icon: <PenTool className="w-5 h-5" />,
    templates: [
      { id: "PHIEU_TONG_LAP", label: "Phiếu tổng lắp trang bị kỹ thuật" },
    ]
  },
  {
    id: "KIEM_TRA_THU_NGHIEM",
    label: "7. Kiểm tra, thử nghiệm trang thiết bị",
    icon: <CheckCircle className="w-5 h-5" />,
    templates: [
      { id: "THU_NGHIEM_TONG_THE", label: "Thử nghiệm tổng thể TBKT" },
    ]
  }
];

function getComponentForTemplate(templateType: string) {
  switch (templateType) {
    case "ENGINE_PRE_REPAIR": return EngineInspectionBeforeRepairForm;
    case "CHASSIS_PRE_REPAIR": return EngineInspectionBeforeRepairForm;
    case "ELECTRICAL_PRE_REPAIR": return EngineInspectionBeforeRepairForm;
    case "BODY_PRE_REPAIR": return BodyInspectionBeforeRepairForm;
    case "INTERIOR_PRE_REPAIR": return InteriorInspectionBeforeRepairForm;
    case "PAINT_PRE_REPAIR": return PaintInspectionBeforeRepairForm;
    case "GENERAL_DISASSEMBLY_REPAIR": return GeneralDisassemblyRepairForm;
    case "ENGINE_COMPONENT_DISASSEMBLY": return EngineComponentDisassemblyForm;
    case "PARTS_CLEANING_REPAIR": return PartsCleaningRepairForm;
    case "ENGINE_COMPONENT_REPAIR": return EngineComponentRepairForm;
    case "LAP_RAP": return LapRapDongCoForm;
    case "KIEM_TRA_SAU_LAP": return KiemTraSauLapDongCoForm;
    
    case "TONG_THAO_CUM_GAM": return TongThaoCumGamForm;
    case "TAY_RUA_GAM": return TayRuaLamSachCumGamForm;
    case "SUA_CHUA_GAM": return SuaChuaChiTietCumGamForm;
    case "LAP_RAP_GAM": return LapRapHieuChinhGamForm;
    case "KIEM_TRA_GAM": return KiemTraSauTongLapGamForm;

    case "TONG_THAO_CUM_DIEN": return TongThaoCumDienForm;
    case "TAY_RUA_DIEN": return TayRuaLamSachCumDienForm;
    case "SUA_CHUA_DIEN": return SuaChuaChiTietCumDienForm;
    case "KIEM_TRA_DIEN": return KiemTraSauTongLapDienForm;

    case "XU_LY_BE_MAT": return XuLyBeMatThanVoForm;
    case "KIEM_TRA_THAN_VO": return KiemTraThanVoSauSuaChuaForm;
    case "TAY_RUA_SON": return TayRuaLamSachBeMatSonForm;
    case "CHONG_GI": return ChongGiVaTaoBeMatSonForm;
    case "SON_LEN_MAU": return SonLenMauForm;
    case "KIEM_TRA_NOI_THAT_SON": return KiemTraNoiThatSonSauSuaChuaForm;

    case "PHIEU_TONG_LAP": return PhieuTongLapTrangBiKyThuatForm;
    case "THU_NGHIEM_TONG_THE": return ThuNghiemTongTheForm;

    default: return null;
  }
}

export function isRepairSessionClosed(session: RepairSession | any): boolean {
  if (!session) return false;
  return (
    session.workflowState === 'HANDED_OVER' ||
    session.status === 'CLOSED' ||
    Boolean(session.closedAt)
  );
}

export function isRepairSessionOpen(session: RepairSession | any): boolean {
  if (!session) return false;
  if (session.isDeleted === true) return false;
  return !isRepairSessionClosed(session);
}

export const RepairRecordsTab = ({
  viewMode,
  setViewMode,
  selectedVehicle,
  selectedRepairSession,
  onSelectRepairSession,
  savedVehicles,
  pendingOpenRequest,
  onClearPendingOpenRequest,
}: RepairRecordsTabProps) => {
  const [repairSessions, setRepairSessions] = useState<any[]>([]);
  const [repairForms, setRepairForms] = useState<any[]>([]);
  const [repairCampaigns, setRepairCampaigns] = useState<RepairCampaign[]>([]);
  
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const [expandedVehicles, setExpandedVehicles] = useState<Record<string, boolean>>({});
  const [expandedPlates, setExpandedPlates] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const isSearching = Boolean(searchQuery.trim());
  
  const [activeFormTemplate, setActiveFormTemplate] = useState<string | null>(null);
  const [activeFormId, setActiveFormId] = useState<string | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  const currentUser = getCurrentUserSession();
  const canEdit = currentUser?.role ? canEditModule(currentUser.role, 'REPAIR') : false;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sessions = (await DataService.load('repairSessions')) || [];
      const forms = (await DataService.load('repairForms')) || [];
      const campaigns = (await DataService.load('repairCampaigns')) || [];
      
      const activeSessions = sessions.filter((s: any) => s.isDeleted !== true && s.isDeleted !== 'true');
      const activeForms = forms.filter((f: any) => f.isDeleted !== true && f.isDeleted !== 'true');
      const activeCampaigns = campaigns.filter((c: any) => c.isDeleted !== true && c.isDeleted !== 'true');
      
      setRepairSessions(activeSessions);
      setRepairForms(activeForms);
      setRepairCampaigns(activeCampaigns);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    if (pendingOpenRequest && pendingOpenRequest.module === 'REPAIR_RECORDS' && pendingOpenRequest.formType === 'REPAIR_HISTORY') {
      const form = repairForms.find(f => f.id === pendingOpenRequest.recordId);
      if (form && form.repairSessionId) {
        const session = repairSessions.find(s => s.id === form.repairSessionId);
        if (session && onSelectRepairSession) {
          onSelectRepairSession(session);
        }
        setActiveFormTemplate(form.templateType);
        setActiveFormId(form.id);
        setShowForm(true);
      }
      onClearPendingOpenRequest?.();
    }
  }, [pendingOpenRequest, repairForms, repairSessions]);

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return repairSessions;
    return repairSessions.filter((session: any) => {
      const plate = (session.plateNumber || "").toLowerCase();
      const vehicle = (session.vehicleName || "").toLowerCase();
      const campaign = (session.campaignName || "").toLowerCase();
      const numStr = session.repairNumber ? `lần sửa chữa ${session.repairNumber}` : "lần sửa chữa 01";
      const numOnly = session.repairNumber ? `lần ${session.repairNumber}` : "";

      return (
        plate.includes(q) ||
        vehicle.includes(q) ||
        campaign.includes(q) ||
        numStr.includes(q) ||
        numOnly.includes(q)
      );
    });
  }, [repairSessions, searchQuery]);

  const treeData = useMemo(() => {
    const tree: Record<string, Record<string, Record<string, Record<string, RepairSession[]>>>> = {};
    filteredSessions.forEach(session => {
      if ((session as any).isDeleted) return;
      const year = resolveSessionYear(session, repairCampaigns);
      const campaign = session.campaignName || resolveCampaignName(session.campaignId, repairCampaigns, (session as any).campaignName) || "Không thuộc đợt";
      const vehicleName = session.vehicleName || "Xe không xác định";
      const plate = session.plateNumber || "Không rõ biển số";
      
      if (!tree[year]) tree[year] = {};
      if (!tree[year][campaign]) tree[year][campaign] = {};
      if (!tree[year][campaign][vehicleName]) tree[year][campaign][vehicleName] = {};
      if (!tree[year][campaign][vehicleName][plate]) tree[year][campaign][vehicleName][plate] = [];
      
      tree[year][campaign][vehicleName][plate].push(session);
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
  }, [filteredSessions, repairCampaigns]);

  const toggleYear = (y: string) => setExpandedYears(prev => ({ ...prev, [y]: !prev[y] }));
  const toggleCampaign = (y: string, c: string) => setExpandedCampaigns(prev => ({ ...prev, [`${y}-${c}`]: !prev[`${y}-${c}`] }));
  const toggleVehicle = (y: string, c: string, v: string) => setExpandedVehicles(prev => ({ ...prev, [`${y}-${c}-${v}`]: !prev[`${y}-${c}-${v}`] }));
  const togglePlate = (y: string, c: string, v: string, p: string) => setExpandedPlates(prev => ({ ...prev, [`${y}-${c}-${v}-${p}`]: !prev[`${y}-${c}-${v}-${p}`] }));

  const handleDeleteForm = async (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
    if (selectedRepairSession && isRepairSessionClosed(selectedRepairSession)) {
      alert("Hồ sơ sửa chữa lần này đã hoàn tất bàn giao và đã đóng. Không thể xóa phiếu.");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa phiếu này?")) return;
    
    const user = getCurrentUserSession();
    const form = repairForms.find((f: any) => f.id === formId);
    if (!form) return;
    const canDelete = canDeleteDocument(user, form, 'REPAIR');
    if (!canDelete) {
      alert("Bạn không có quyền xóa phiếu này.");
      return;
    }

    try {
      const forms = await DataService.load('repairForms') || [];
      const index = forms.findIndex((f: any) => f.id === formId);
      if (index !== -1) {
        forms[index].isDeleted = true;
        forms[index].deletedAt = new Date().toISOString();
        forms[index].deletedBy = user?.uid;
        await DataService.save('repairForms', forms);
        setRepairForms(forms.filter((f: any) => f.isDeleted !== true));
      }
    } catch (err) {
      console.error("Error deleting form:", err);
    }
  };

  const handleCreateForm = (templateType: string) => {
    if (!selectedRepairSession) {
      alert("Vui lòng chọn đúng Lần sửa chữa trước khi lập phiếu.");
      return;
    }
    if (isRepairSessionClosed(selectedRepairSession)) {
      alert("Hồ sơ sửa chữa lần này đã hoàn tất bàn giao và đã đóng. Không thể lập thêm phiếu sửa chữa.");
      return;
    }
    setActiveFormTemplate(templateType);
    setActiveFormId(undefined);
    setShowForm(true);
  };

  const handleOpenForm = (templateType: string, formId: string) => {
    setActiveFormTemplate(templateType);
    setActiveFormId(formId);
    setShowForm(true);
  };

  const handleFormSaved = async (savedData: any) => {
    if (selectedRepairSession && isRepairSessionClosed(selectedRepairSession)) {
      alert("Hồ sơ sửa chữa lần này đã hoàn tất bàn giao và đã đóng. Không thể thay đổi hay lưu dữ liệu.");
      return;
    }
    setShowForm(false);
    await loadData();
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const currentSessionForms = useMemo(() => {
    if (!selectedRepairSession) return [];
    return repairForms.filter(f => f.repairSessionId === selectedRepairSession.id);
  }, [repairForms, selectedRepairSession]);

  const vehicleMatch = selectedRepairSession ? savedVehicles.find(v => v.vehicleId === selectedRepairSession.vehicleId) : null;

  // Active form component
  let ActiveComponent: any = null;
  let activeTemplateObj: any = null;
  
  if (showForm && activeFormTemplate) {
    ActiveComponent = getComponentForTemplate(activeFormTemplate);
    for (const stage of STAGES) {
      const found = stage.templates.find(t => t.id === activeFormTemplate);
      if (found) {
        activeTemplateObj = found;
        break;
      }
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] overflow-hidden bg-stone-50">
      {/* Left Sidebar - Tree View */}
      <div className="w-80 bg-white border-r border-stone-200 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
          <h2 className="font-bold text-stone-800 flex items-center gap-2">
            <Folder className="w-5 h-5 text-emerald-600" />
            HỒ SƠ SỬA CHỮA
          </h2>
          <button onClick={loadData} className="p-1 hover:bg-stone-200 rounded text-stone-500" title="Tải lại dữ liệu">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-3 border-b border-stone-200 bg-stone-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm xe, biển số, đợt sửa chữa..."
              className="w-full pl-8 pr-8 py-1.5 bg-white text-xs border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-stone-800 placeholder-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 rounded-full"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="p-3 overflow-y-auto flex-1 text-sm">
          {Object.keys(treeData).sort((a, b) => b.localeCompare(a)).map(year => {
            const isYearExpanded = isSearching || Boolean(expandedYears[year]);
            const campaignsObj = treeData[year];
            let yearCount = 0;
            Object.values(campaignsObj).forEach((vehObj: any) => {
              Object.values(vehObj).forEach((plateObj: any) => {
                Object.values(plateObj).forEach((sessions: any) => {
                  yearCount += sessions.length;
                });
              });
            });

            return (
              <div key={year} className="mb-1">
                {/* Cấp 1: Năm */}
                <div 
                  className="flex items-center justify-between cursor-pointer py-1.5 px-2 hover:bg-stone-100 rounded-lg transition-colors group"
                  onClick={() => toggleYear(year)}
                >
                  <div className="flex items-center gap-1.5 text-stone-800 font-bold">
                    {isYearExpanded ? <ChevronDown className="w-4 h-4 text-emerald-700 shrink-0" /> : <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />}
                    <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{year}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium px-1.5 py-0.5 bg-stone-100 group-hover:bg-stone-200 rounded-md transition-colors whitespace-nowrap">
                    {String(yearCount).padStart(2, '0')} hồ sơ
                  </span>
                </div>
                
                {isYearExpanded && (
                  <div className="pl-3 border-l border-stone-200 ml-3.5 space-y-0.5 mt-0.5">
                    {Object.keys(campaignsObj).map(campaign => {
                      const campaignKey = `${year}-${campaign}`;
                      const isCampaignExpanded = isSearching || Boolean(expandedCampaigns[campaignKey]);
                      const vehiclesObj = campaignsObj[campaign];
                      let campaignCount = 0;
                      Object.values(vehiclesObj).forEach((plateObj: any) => {
                        Object.values(plateObj).forEach((sessions: any) => {
                          campaignCount += sessions.length;
                        });
                      });

                      return (
                        <div key={campaign}>
                          {/* Cấp 2: Đợt sửa chữa */}
                          <div 
                            className="flex items-center justify-between cursor-pointer py-1 px-2 hover:bg-stone-100 rounded-lg transition-colors group"
                            onClick={() => toggleCampaign(year, campaign)}
                          >
                            <div className="flex items-center gap-1.5 text-stone-700 font-semibold text-xs min-w-0 pr-2">
                              {isCampaignExpanded ? <ChevronDown className="w-3.5 h-3.5 text-emerald-700 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />}
                              <Folder className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span className="truncate">{campaign}</span>
                            </div>
                            <span className="text-[10px] text-stone-500 font-medium px-1.5 py-0.5 bg-stone-100 group-hover:bg-stone-200 rounded-md transition-colors shrink-0 whitespace-nowrap">
                              {String(campaignCount).padStart(2, '0')} hồ sơ
                            </span>
                          </div>
                          
                          {isCampaignExpanded && (
                            <div className="pl-3 border-l border-stone-200 ml-3 space-y-0.5 mt-0.5">
                              {Object.keys(vehiclesObj).map(vehicle => {
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
                                        {Object.keys(platesObj).map(plate => {
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
                                                  {sessionsList.map((session: any, idx: number) => {
                                                    const isSelected = selectedRepairSession?.id === session.id;
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
                                                        onClick={() => onSelectRepairSession?.(session)}
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
          })}
          {Object.keys(treeData).length === 0 && (
            <div className="p-4 text-center text-stone-500 italic text-xs">
              {isSearching ? "Không tìm thấy hồ sơ phù hợp" : "Chưa có dữ liệu đợt sửa chữa."}
            </div>
          )}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 overflow-y-auto bg-stone-50 p-6 relative relative-container relative">
        {selectedRepairSession ? (
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-4">
                <h1 className="text-2xl font-bold text-stone-800">
                  HỒ SƠ SỬA CHỮA
                </h1>
                {isRepairSessionClosed(selectedRepairSession) ? (
                  <span className="bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1.5 rounded-full border border-amber-300 flex items-center gap-1.5">
                    🔒 ĐÃ HOÀN TẤT BÀN GIAO (ĐÃ ĐÓNG)
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 text-sm font-semibold px-3 py-1.5 rounded-full border border-emerald-300 flex items-center gap-1.5">
                    🟢 ĐANG THỰC HIỆN
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-stone-500 block mb-1">Xe</span>
                  <strong className="text-stone-800 text-base">{selectedRepairSession.vehicleName || 'Không rõ'}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block mb-1">Biển số</span>
                  <strong className="text-stone-800 text-base">{selectedRepairSession.plateNumber || 'Không rõ'}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block mb-1">Lần sửa chữa</span>
                  <strong className="text-stone-800 text-base">{selectedRepairSession.repairNumber ? `0${selectedRepairSession.repairNumber}`.slice(-2) : '01'}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block mb-1">RepairSession ID</span>
                  <strong className="text-stone-600 font-mono text-xs break-all">{selectedRepairSession.id}</strong>
                </div>
              </div>
            </div>

            {/* Content: 7 Stages */}
            <div className="space-y-6">
              {STAGES.map(stage => {
                return (
                  <div key={stage.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                    <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex items-center gap-3">
                      <div className="text-emerald-600 bg-emerald-100 p-2 rounded-lg">
                        {stage.icon}
                      </div>
                      <h2 className="font-bold text-lg text-stone-800">{stage.label}</h2>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stage.templates.map(template => {
                        const forms = currentSessionForms.filter(f => f.templateType === template.id);
                        const isClosed = isRepairSessionClosed(selectedRepairSession);
                        
                        return (
                          <div key={template.id} className="border border-stone-200 rounded-xl p-4 hover:border-emerald-200 transition-colors bg-stone-50 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-semibold text-stone-800 line-clamp-2">{template.label}</h3>
                              {isClosed ? (
                                <button
                                  disabled
                                  className="flex-shrink-0 text-xs flex items-center gap-1 bg-stone-200 text-stone-500 px-3 py-1.5 rounded-lg font-medium cursor-not-allowed opacity-80"
                                  title="Hồ sơ đã hoàn tất bàn giao và đã đóng"
                                >
                                  🔒 Đã hoàn tất bàn giao
                                </button>
                              ) : canEdit ? (
                                <button
                                  onClick={() => handleCreateForm(template.id)}
                                  className="flex-shrink-0 text-xs flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Tạo phiếu
                                </button>
                              ) : null}
                            </div>
                            
                            <div className="mt-auto pt-3 border-t border-stone-200/60">
                              <div className="text-sm text-stone-500 mb-2">
                                Đã lập: <strong className="text-stone-700">{forms.length} phiếu</strong>
                              </div>
                              
                              {forms.length > 0 && (
                                <div className="space-y-2 mt-2">
                                  {forms.sort((a,b) => new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime()).map((form, idx) => (
                                    <div 
                                      key={form.id}
                                      onClick={() => handleOpenForm(template.id, form.id)}
                                      className="flex justify-between items-center bg-white border border-stone-200 p-2 rounded-lg cursor-pointer hover:border-emerald-300 hover:shadow-sm transition-all group"
                                    >
                                      <div className="flex items-center gap-2 text-sm overflow-hidden">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                                        <span className="text-stone-700 font-medium whitespace-nowrap">Phiếu #{String(forms.length - idx).padStart(2, '0')}</span>
                                        <span className="text-stone-400">—</span>
                                        <span className="text-stone-500 whitespace-nowrap">{formatVietnamDate(form.createdAt).split(' ')[0]}</span>
                                        <span className="text-stone-400">—</span>
                                        <span className="text-stone-600 truncate">{form.createdByName || form.createdBy}</span>
                                      </div>
                                      {!isClosed && canDeleteDocument(currentUser, form, 'REPAIR') && (
                                        <button
                                          onClick={(e) => handleDeleteForm(e, form.id)}
                                          className="text-stone-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
                                          title="Xóa phiếu"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-stone-400">
            <Folder className="w-16 h-16 mb-4 text-stone-200" />
            <h3 className="text-xl font-medium text-stone-600 mb-2">Chưa chọn đợt sửa chữa</h3>
            <p className="text-stone-500 max-w-sm text-center">
              Vui lòng chọn một đợt sửa chữa từ cây thư mục bên trái để xem và quản lý hồ sơ.
            </p>
          </div>
        )}
      </div>

      {/* Form Overlay */}
      {showForm && activeFormTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-stone-800">
                  {activeTemplateObj?.label || 'Biểu mẫu'}
                </h2>
                {selectedRepairSession && isRepairSessionClosed(selectedRepairSession) && (
                  <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 border border-amber-300">
                    🔒 Đã đóng (Chỉ xem)
                  </span>
                )}
              </div>
              <button 
                onClick={handleFormCancel}
                className="text-stone-500 hover:text-stone-700 bg-stone-200/50 hover:bg-stone-200 rounded-lg px-4 py-2 font-medium"
              >
                Đóng
              </button>
            </div>

            {(selectedRepairSession && isRepairSessionClosed(selectedRepairSession)) || !canEdit ? (
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 font-medium flex items-center justify-between">
                <span>
                  ⚠️ {selectedRepairSession && isRepairSessionClosed(selectedRepairSession) 
                    ? `Hồ sơ sửa chữa Lần ${selectedRepairSession.repairNumber || '01'} đã hoàn tất bàn giao và đã đóng.` 
                    : 'Tài khoản ở chế độ CHỈ XEM.'} Chế độ CHỈ XEM (xem, in, xuất PDF). Không thể sửa đổi hay lưu dữ liệu.
                </span>
              </div>
            ) : null}
            
            <div className={`flex-1 overflow-y-auto p-0 relative bg-stone-100 ${!canEdit || (selectedRepairSession && isRepairSessionClosed(selectedRepairSession)) ? 'repair-form-read-only-container' : ''}`}>
              {(!canEdit || (selectedRepairSession && isRepairSessionClosed(selectedRepairSession))) && (
                <style>{`
                  .repair-form-read-only-container input:not([type="button"]):not([type="submit"]),
                  .repair-form-read-only-container textarea,
                  .repair-form-read-only-container select {
                    pointer-events: none !important;
                  }
                  .repair-form-read-only-container #delete-button-selector,
                  .repair-form-read-only-container button:has(svg.lucide-save) {
                    display: none !important;
                  }
                `}</style>
              )}
              {ActiveComponent ? (
                <ActiveComponent
                  vehicle={vehicleMatch || selectedRepairSession} 
                  existingFormId={activeFormId}
                  initialData={activeFormId ? repairForms.find(f => f.id === activeFormId) : undefined}
                  templateName={activeTemplateObj?.label}
                  stageName={STAGES.find(s => s.templates.some(t => t.id === activeFormTemplate))?.label}
                  templateType={activeFormTemplate}
                  targetSessionId={selectedRepairSession?.id}
                  readOnly={!canEdit || (selectedRepairSession ? isRepairSessionClosed(selectedRepairSession) : false)}
                  isClosed={!canEdit || (selectedRepairSession ? isRepairSessionClosed(selectedRepairSession) : false)}
                  onSaved={handleFormSaved}
                  onCancel={handleFormCancel}
                  onClose={handleFormCancel}
                />
              ) : (
                <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-stone-400" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-700 mb-2">Mẫu phiếu chưa hỗ trợ</h3>
                  <p className="text-stone-500 max-w-md">
                    Chưa có component giao diện cho loại phiếu <strong>{activeFormTemplate}</strong>. Vui lòng cập nhật source code để map templateType với component tương ứng.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
