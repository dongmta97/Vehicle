import sys

def main():
    content = """import React, { useState, useEffect, useMemo } from "react";
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
  Search,
  RefreshCw
} from "lucide-react";
import { Vehicle, RepairSession } from "../types";
import { DataService } from "../firebase";
import { getCurrentUserSession } from "../services/dbService";
import { canEditDocument } from "../services/ownershipService";
import { formatVNTime } from "../utils/time";

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
    case "CHASSIS_PRE_REPAIR": return null; // We will handle missing components by showing a placeholder
    case "ELECTRICAL_PRE_REPAIR": return null;
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
  
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const [expandedVehicles, setExpandedVehicles] = useState<Record<string, boolean>>({});
  const [expandedPlates, setExpandedPlates] = useState<Record<string, boolean>>({});
  
  const [activeFormTemplate, setActiveFormTemplate] = useState<string | null>(null);
  const [activeFormId, setActiveFormId] = useState<string | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sessions = (await DataService.load('repairSessions')) || [];
      const forms = (await DataService.load('repairForms')) || [];
      
      const activeSessions = sessions.filter((s: any) => s.isDeleted !== true && s.isDeleted !== 'true');
      const activeForms = forms.filter((f: any) => f.isDeleted !== true && f.isDeleted !== 'true');
      
      setRepairSessions(activeSessions);
      setRepairForms(activeForms);
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

  const treeData = useMemo(() => {
    const tree: any = {};
    repairSessions.forEach(session => {
      const year = session.openedAt ? new Date(session.openedAt).getFullYear().toString() : "Không rõ năm";
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
  }, [repairSessions]);

  const toggleYear = (y: string) => setExpandedYears(prev => ({ ...prev, [y]: !prev[y] }));
  const toggleCampaign = (y: string, c: string) => setExpandedCampaigns(prev => ({ ...prev, [`${y}-${c}`]: !prev[`${y}-${c}`] }));
  const toggleVehicle = (y: string, c: string, v: string) => setExpandedVehicles(prev => ({ ...prev, [`${y}-${c}-${v}`]: !prev[`${y}-${c}-${v}`] }));
  const togglePlate = (y: string, c: string, v: string, p: string) => setExpandedPlates(prev => ({ ...prev, [`${y}-${c}-${v}-${p}`]: !prev[`${y}-${c}-${v}-${p}`] }));

  const handleDeleteForm = async (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa phiếu này?")) return;
    
    const user = getCurrentUserSession();
    const canEdit = await canEditDocument('repairForms', formId, user);
    if (!canEdit) {
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
          <button onClick={loadData} className="p-1 hover:bg-stone-200 rounded text-stone-500">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3 overflow-y-auto flex-1 text-sm">
          {Object.keys(treeData).sort((a,b)=>b.localeCompare(a)).map(year => (
            <div key={year} className="mb-1">
              <div 
                className="flex items-center gap-1 cursor-pointer py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-semibold"
                onClick={() => toggleYear(year)}
              >
                {expandedYears[year] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {year}
              </div>
              
              {expandedYears[year] && (
                <div className="pl-4 border-l border-stone-200 ml-2">
                  {Object.keys(treeData[year]).map(campaign => (
                    <div key={campaign}>
                      <div 
                        className="flex items-center gap-1 cursor-pointer py-1 px-2 hover:bg-stone-100 rounded text-stone-700 font-medium"
                        onClick={() => toggleCampaign(year, campaign)}
                      >
                        {expandedCampaigns[`${year}-${campaign}`] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        {campaign}
                      </div>
                      
                      {expandedCampaigns[`${year}-${campaign}`] && (
                        <div className="pl-4 border-l border-stone-200 ml-2">
                          {Object.keys(treeData[year][campaign]).map(vehicle => (
                            <div key={vehicle}>
                              <div 
                                className="flex items-center gap-1 cursor-pointer py-1 px-2 hover:bg-stone-100 rounded text-stone-700"
                                onClick={() => toggleVehicle(year, campaign, vehicle)}
                              >
                                {expandedVehicles[`${year}-${campaign}-${vehicle}`] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                {vehicle}
                              </div>
                              
                              {expandedVehicles[`${year}-${campaign}-${vehicle}`] && (
                                <div className="pl-4 border-l border-stone-200 ml-2">
                                  {Object.keys(treeData[year][campaign][vehicle]).map(plate => (
                                    <div key={plate}>
                                      <div 
                                        className="flex items-center gap-1 cursor-pointer py-1 px-2 hover:bg-stone-100 rounded text-stone-600"
                                        onClick={() => togglePlate(year, campaign, vehicle, plate)}
                                      >
                                        {expandedPlates[`${year}-${campaign}-${vehicle}-${plate}`] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                        {plate}
                                      </div>
                                      
                                      {expandedPlates[`${year}-${campaign}-${vehicle}-${plate}`] && (
                                        <div className="pl-3 py-1 space-y-1">
                                          {treeData[year][campaign][vehicle][plate].map((session: any) => (
                                            <div 
                                              key={session.id}
                                              className={`flex items-center gap-2 py-1.5 px-3 rounded-md cursor-pointer transition-colors ${selectedRepairSession?.id === session.id ? 'bg-emerald-100 text-emerald-800 font-medium' : 'hover:bg-stone-100 text-stone-600'}`}
                                              onClick={() => onSelectRepairSession?.(session)}
                                            >
                                              <div className={`w-1.5 h-1.5 rounded-full ${selectedRepairSession?.id === session.id ? 'bg-emerald-500' : 'bg-stone-400'}`}></div>
                                              Lần sửa chữa {session.repairNumber || '01'}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {Object.keys(treeData).length === 0 && (
            <div className="p-4 text-center text-stone-500 italic">
              Chưa có dữ liệu đợt sửa chữa.
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
              <h1 className="text-2xl font-bold text-stone-800 mb-4 border-b border-stone-100 pb-4">
                HỒ SƠ SỬA CHỮA
              </h1>
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
                        
                        return (
                          <div key={template.id} className="border border-stone-200 rounded-xl p-4 hover:border-emerald-200 transition-colors bg-stone-50 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-semibold text-stone-800 line-clamp-2">{template.label}</h3>
                              <button
                                onClick={() => handleCreateForm(template.id)}
                                className="flex-shrink-0 text-xs flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Tạo phiếu
                              </button>
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
                                      <button
                                        onClick={(e) => handleDeleteForm(e, form.id)}
                                        className="text-stone-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
                                        title="Xóa phiếu"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
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
              <h2 className="text-xl font-bold text-stone-800">
                {activeTemplateObj?.label || 'Biểu mẫu'}
              </h2>
              <button 
                onClick={handleFormCancel}
                className="text-stone-500 hover:text-stone-700 bg-stone-200/50 hover:bg-stone-200 rounded-lg px-4 py-2 font-medium"
              >
                Đóng
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0 relative bg-stone-100">
              {ActiveComponent ? (
                <ActiveComponent
                  vehicle={vehicleMatch || selectedRepairSession} 
                  existingFormId={activeFormId}
                  initialData={activeFormId ? repairForms.find(f => f.id === activeFormId) : undefined}
                  templateName={activeTemplateObj?.label}
                  stageName={STAGES.find(s => s.templates.some(t => t.id === activeFormTemplate))?.label}
                  templateType={activeFormTemplate}
                  targetSessionId={selectedRepairSession?.id} 
                  onSaved={handleFormSaved}
                  onCancel={handleFormCancel}
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
"""
    with open("src/components/RepairRecordsTab.tsx", "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    main()

