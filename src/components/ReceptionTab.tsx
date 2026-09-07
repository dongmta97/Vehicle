import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { formatVNTime, formatVNDate, toIsoDateString } from '../utils/time';
import { db, DataService } from '../firebase';
import { collection, query, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { 
  PlusCircle, 
  Truck, 
  ClipboardList, 
  FileText, 
  UploadCloud, 
  Trash2, 
  FileSpreadsheet, 
  Image, 
  File, 
  X, 
  Eye, 
  Folder,
  FolderOpen,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Check,
  Calendar,
  Building2,
  Layers,
  Wrench,
  Pencil,
  Edit2,
  Save,
  CheckCircle2,
  UserPlus,
  Info,
  ArrowLeft
} from 'lucide-react';
import { Vehicle, RepairHistory, RepairSession, DamageProtocol, RepairCampaign } from '../types';
import { ReceiveForm } from './ReceiveForm';
import { dbService, getCurrentUserSession, normalizePlate } from '../services/dbService';
import { resolveCampaignName, resolveSessionYear } from '../services/repairCampaignService';
import { canEditModule } from '../services/permissionService';
import { canEditDocument } from '../services/ownershipService';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import { RepairCampaignManagement } from './RepairCampaignManagement';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  url?: string;
  publicId?: string;
  subTab?: string;
  uploadedBy?: string;
  uploadedByUid?: string;
  uploadedByUsername?: string;
  uploadedByFullName?: string;
  uploadedByRole?: string;
  uploadedByUnit?: string;
  vehicleId?: string;
  plateNumber?: string;
  repairSessionId?: string;
}

interface CampaignVehicleItem {
  vehicleId: string;
  plateNumber: string;
  brand: string;
  campaignName?: string;
  repairNumberStr?: string;
  handoverDate?: string;
  status: 'IN_PROGRESS' | 'HANDED_OVER' | 'RECEIVED' | 'PLANNING';
  statusText: string;
  statusBadgeColor: string;
  sessionCode: string;
  receptionDate: string;
  unit: string;
  repairLevel: string;
  progress: number;
  currentTask: string;
  createdBy?: string;
  createdByUnit?: string;
  createdAt?: string;
}

interface ReceptionTabProps {
  viewMode: string;
  setViewMode: (mode: any) => void;
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (v: Vehicle | null) => void;
  selectedRepairSession?: RepairSession | null;
  onSelectRepairSession?: (s: RepairSession | null) => void;
  savedVehicles: Vehicle[];
  repairHistory: RepairHistory[];
  notFoundPlate: string | null;
  lastSearchedPlate: string;
  setNotFoundPlate: (p: string | null) => void;
  handleSaveSuccess: (plate: string) => Promise<void>;
  handleSearch: (plate: string) => Promise<void>;
  handleDeleteHistory: (historyId: string) => Promise<void>;
  handleDeleteVehicle: (vehicleId: string) => Promise<void>;
  currentUserRole?: string;
}

export function ReceptionTab({
  viewMode,
  setViewMode,
  selectedVehicle,
  setSelectedVehicle,
  selectedRepairSession,
  onSelectRepairSession,
  savedVehicles,
  repairHistory,
  notFoundPlate,
  lastSearchedPlate,
  setNotFoundPlate,
  handleSaveSuccess: propsHandleSaveSuccess,
  handleSearch,
  handleDeleteHistory: propsHandleDeleteHistory,
  handleDeleteVehicle: propsHandleDeleteVehicle,
  currentUserRole,
}: ReceptionTabProps) {
  const canEdit = currentUserRole ? canEditModule(currentUserRole as any, 'RECEPTION') : false;
  const currentUser = getCurrentUserSession();
  const canEditCurrentDocument = selectedVehicle ? canEditDocument(currentUser, selectedVehicle) : true;
  const canModifyReception = canEdit && canEditCurrentDocument;

  // Real Repair Sessions & Damage Protocols State
  const [repairSessions, setRepairSessions] = useState<RepairSession[]>([]);
  const [repairCampaigns, setRepairCampaigns] = useState<RepairCampaign[]>([]);
  const [damageProtocols, setDamageProtocols] = useState<DamageProtocol[]>([]);
  const [repairForms, setRepairForms] = useState<any[]>([]);
  const [engineInspectionForms, setEngineInspectionForms] = useState<any[]>([]);
  const [vehicleInspectionForms, setVehicleInspectionForms] = useState<any[]>([]);
  const [postRepairRecords, setPostRepairRecords] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<RepairSession | null>(selectedRepairSession || null);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(true);

  // Sync with prop when selectedRepairSession changes from App.tsx
  useEffect(() => {
    if (selectedRepairSession) {
      setSelectedSession(selectedRepairSession);
    }
  }, [selectedRepairSession]);

  // Tree View Expand/Collapse state
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const [expandedVehicles, setExpandedVehicles] = useState<Record<string, boolean>>({});
  const [expandedPlates, setExpandedPlates] = useState<Record<string, boolean>>({});
  const [treeSearchQuery, setTreeSearchQuery] = useState('');

  const isSearching = Boolean(treeSearchQuery.trim());

  const toggleYear = (y: string) => setExpandedYears((prev) => ({ ...prev, [y]: !prev[y] }));
  const toggleCampaign = (y: string, c: string) => setExpandedCampaigns((prev) => ({ ...prev, [`${y}-${c}`]: !prev[`${y}-${c}`] }));
  const toggleVehicle = (y: string, c: string, v: string) => setExpandedVehicles((prev) => ({ ...prev, [`${y}-${c}-${v}`]: !prev[`${y}-${c}-${v}`] }));
  const togglePlate = (y: string, c: string, v: string, p: string) => setExpandedPlates((prev) => ({ ...prev, [`${y}-${c}-${v}-${p}`]: !prev[`${y}-${c}-${v}-${p}`] }));

  const formatCampaignRoundText = (round?: number) => {
    if (round === 1) return 'Đợt I';
    if (round === 2) return 'Đợt II';
    if (round === 3) return 'Đợt III';
    if (round === 4) return 'Đợt IV';
    if (round === 5) return 'Đợt V';
    if (round && round > 0) return `Đợt ${round}`;
    return '';
  };

  const getCampaignStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { text: 'Đang mở', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'PLANNING':
        return { text: 'Kế hoạch', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'CLOSED':
        return { text: 'Đã đóng', color: 'bg-slate-100 text-slate-700 border-slate-300' };
      default:
        return { text: 'Đang mở', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
  };

  const filteredSessionsForTree = useMemo(() => {
    const q = treeSearchQuery.trim().toLowerCase();
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

  // 5-Level Tree Data (Năm -> Đợt sửa chữa -> Tên/chủng loại xe -> Biển số xe -> Lần sửa chữa)
  const treeData = React.useMemo(() => {
    const tree: Record<string, Record<string, Record<string, Record<string, RepairSession[]>>>> = {};

    filteredSessionsForTree.forEach((s) => {
      if (s.isDeleted) return;

      const year = resolveSessionYear(s, repairCampaigns);
      const campaign = s.campaignName || resolveCampaignName(s.campaignId, repairCampaigns, (s as any).campaignName) || 'Không thuộc đợt';

      const matchedVeh = (savedVehicles || []).find(
        (v) =>
          v.vehicleId === s.vehicleId ||
          normalizePlate(v.plateNumber || '') === normalizePlate(s.plateNumber || '') ||
          normalizePlate(v.vehicleId || '') === normalizePlate(s.vehicleId || '')
      );
      const matchedDp = damageProtocols.find(
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

      const plate = s.plateNumber || matchedVeh?.plateNumber || s.vehicleId || 'Không có biển số';

      if (!tree[year]) tree[year] = {};
      if (!tree[year][campaign]) tree[year][campaign] = {};
      if (!tree[year][campaign][vehicleName]) tree[year][campaign][vehicleName] = {};
      if (!tree[year][campaign][vehicleName][plate]) tree[year][campaign][vehicleName][plate] = [];

      tree[year][campaign][vehicleName][plate].push(s);
    });

    // Sort sessions in each plate
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
  }, [filteredSessionsForTree, repairCampaigns, savedVehicles, damageProtocols]);

  const availableYears = useMemo(() => {
    const years: number[] = repairCampaigns
      .filter((c) => !c.isDeleted && Boolean(c.year))
      .map((c) => Number(c.year));
    return Array.from(new Set(years)).sort((a: number, b: number) => b - a);
  }, [repairCampaigns]);

  const [selectedTreeVehicle, setSelectedTreeVehicle] = useState<CampaignVehicleItem | null>(null);
  const [showCreateSessionModal, setShowCreateSessionModal] = useState<boolean>(false);
  const [showCampaignManagementModal, setShowCampaignManagementModal] = useState<boolean>(false);
  const [sessionToDelete, setSessionToDelete] = useState<RepairSession | null>(null);
  const [isDeletingSession, setIsDeletingSession] = useState<boolean>(false);
  const [deleteSessionError, setDeleteSessionError] = useState<string | null>(null);

  const [newSessionForm, setNewSessionForm] = useState({
    selectedYear: '',
    campaignId: '',
    plateNumber: '',
    brand: '',
    unit: '',
    repairLevel: 'Sửa chữa lớn',
    receptionDate: formatVNDate(new Date()),
  });

  const filteredCampaignsForModal = useMemo(() => {
    return repairCampaigns.filter((c) => {
      if (c.isDeleted) return false;
      if (newSessionForm.selectedYear && String(c.year) !== String(newSessionForm.selectedYear)) {
        return false;
      }
      return true;
    });
  }, [repairCampaigns, newSessionForm.selectedYear]);

  // Inline Editable Vehicle Info Cards
  const [isEditingHeaderCards, setIsEditingHeaderCards] = useState<boolean>(false);

  // Document attachment subtab state
  const [activeDocSubTab, setActiveDocSubTab] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [allFiles, setAllFiles] = useState<UploadedFile[]>([]);

  // Load real Repair Sessions and Damage Protocols from Firestore & dbService
  const loadSessionsData = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const [
        fetchedSessions,
        fetchedProtocols,
        fetchedCampaigns,
        fetchedRepairForms,
        fetchedEngineForms,
        fetchedVehicleForms,
        fetchedPostRecords,
      ] = await Promise.all([
        dbService.getAllRepairSessions(),
        dbService.getAllDamageProtocols(),
        dbService.getAllRepairCampaigns().catch(() => []),
        DataService.load('repairForms').catch(() => []),
        DataService.load('engineInspectionForms').catch(() => []),
        DataService.load('vehicleInspectionForms').catch(() => []),
        DataService.load('postRepairRecords').catch(() => []),
      ]);

      setDamageProtocols(fetchedProtocols || []);
      setRepairCampaigns(fetchedCampaigns || []);
      setRepairForms(Array.isArray(fetchedRepairForms) ? fetchedRepairForms : []);
      setEngineInspectionForms(Array.isArray(fetchedEngineForms) ? fetchedEngineForms : []);
      setVehicleInspectionForms(Array.isArray(fetchedVehicleForms) ? fetchedVehicleForms : []);
      setPostRepairRecords(Array.isArray(fetchedPostRecords) ? fetchedPostRecords : []);

      let sessions = (fetchedSessions || []).filter((s) => !s.isDeleted);

      // Sort chronological descending: updatedAt desc, fallback createdAt desc
      sessions.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      setRepairSessions(sessions);
    } catch (err) {
      console.warn('Error loading repair sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    loadSessionsData();
  }, [loadSessionsData]);

  // Workflow State Helper Functions
  const getWorkflowStateText = (state: string) => {
    switch (state) {
      case 'RECEIVED':
        return 'Đã tiếp nhận';
      case 'REPAIRING':
      case 'IN_PROGRESS':
        return 'Đang sửa chữa';
      case 'HANDED_OVER':
      case 'COMPLETED':
        return 'Đã bàn giao';
      case 'REGISTERED':
      case 'PLANNING':
      default:
        return 'Kế hoạch';
    }
  };

  const getWorkflowBadgeColor = (state: string) => {
    switch (state) {
      case 'RECEIVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REPAIRING':
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'HANDED_OVER':
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'REGISTERED':
      case 'PLANNING':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getWorkflowCurrentTask = (state: string) => {
    switch (state) {
      case 'RECEIVED':
        return 'Tiếp nhận xe & Lập biên bản kiểm tra kỹ thuật';
      case 'REPAIRING':
      case 'IN_PROGRESS':
        return 'Đang tiến hành tháo rã, kiểm tra & sửa chữa';
      case 'HANDED_OVER':
      case 'COMPLETED':
        return 'Đã hoàn thành sửa chữa & nghiệm thu bàn giao';
      case 'REGISTERED':
      case 'PLANNING':
      default:
        return 'Kế hoạch tiếp nhận ban đầu';
    }
  };

  // Handler for selecting a Repair Session node from TreeView
  const handleSelectSession = (s: RepairSession) => {
    setSelectedSession(s);
    if (onSelectRepairSession) {
      onSelectRepairSession(s);
    }
    setActiveDocSubTab(null);
    if (setNotFoundPlate) setNotFoundPlate(null);

    const matchedDp = damageProtocols.find(
      (dp) =>
        (dp.repairSessionId && dp.repairSessionId === s.id) ||
        (s.damageProtocolId && dp.protocolId === s.damageProtocolId)
    );

    const itemData: CampaignVehicleItem = {
      vehicleId: s.vehicleId || normalizePlate(s.plateNumber),
      plateNumber: s.plateNumber,
      brand: s.vehicleName || matchedDp?.brand || matchedDp?.vehicleType || 'Chưa xác định',
      campaignName: resolveCampaignName(s.campaignId, repairCampaigns, (s as any).campaignName || matchedDp?.campaignName),
      status: (s.workflowState === 'HANDED_OVER'
        ? 'HANDED_OVER'
        : s.workflowState === 'REPAIRING' || s.workflowState === 'IN_PROGRESS'
        ? 'IN_PROGRESS'
        : s.workflowState === 'RECEIVED'
        ? 'RECEIVED'
        : 'PLANNING') as any,
      statusText: getWorkflowStateText(s.workflowState),
      statusBadgeColor: getWorkflowBadgeColor(s.workflowState),
      sessionCode: s.id,
      receptionDate: formatVNDate(s.receiveDate, s.createdAt) || '---',
      unit: matchedDp?.representativeGeneral || 'Ban Xe-Máy',
      repairLevel: s.repairLevel || 'Sửa chữa lớn',
      progress: s.workflowState === 'HANDED_OVER' ? 100 : s.workflowState === 'REPAIRING' ? 60 : 30,
      currentTask: getWorkflowCurrentTask(s.workflowState),
      createdBy: s.createdBy || matchedDp?.createdBy || 'Ban Xe-Máy',
      createdAt: toIsoDateString(s.createdAt) || '---',
    };

    setSelectedTreeVehicle(itemData);
  };

  // Delete Repair Session
  const handleDeleteSession = (s: RepairSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteSessionError(null);
    setSessionToDelete(s);
  };

  const handleConfirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    setIsDeletingSession(true);
    setDeleteSessionError(null);

    try {
      await dbService.deleteRepairSession(sessionToDelete.id);
      await loadSessionsData();
      if (selectedSession?.id === sessionToDelete.id) {
        setSelectedSession(null);
        setSelectedTreeVehicle(null);
        setSelectedVehicle(null);
      }
      setSessionToDelete(null);
    } catch (err: any) {
      console.error('Lỗi khi xóa session:', err);
      setDeleteSessionError(err?.message || 'Có lỗi xảy ra khi xóa hồ sơ sửa chữa. Vui lòng thử lại.');
    } finally {
      setIsDeletingSession(false);
    }
  };

  // Open Create Session Modal
  const handleOpenCreateSessionModal = () => {
    setNewSessionForm({
      selectedYear: '',
      campaignId: '',
      plateNumber: '',
      brand: '',
      unit: '',
      repairLevel: 'Sửa chữa lớn',
      receptionDate: formatVNDate(new Date()),
    });
    setShowCreateSessionModal(true);
  };

  // Create New Repair Session
  const handleSaveNewSession = async () => {
    if (!newSessionForm.selectedYear) {
      alert('Vui lòng chọn Năm sửa chữa.');
      return;
    }

    const selectedCampaign = repairCampaigns.find((c) => c.id === newSessionForm.campaignId);

    if (!newSessionForm.campaignId || !selectedCampaign) {
      alert('Vui lòng chọn đợt sửa chữa trước khi tạo hồ sơ.');
      return;
    }

    if (!newSessionForm.plateNumber.trim()) {
      alert('Vui lòng nhập biển số xe.');
      return;
    }

    if (!newSessionForm.brand || !newSessionForm.brand.trim()) {
      alert('Vui lòng nhập nhãn hiệu/loại xe.');
      return;
    }

    const targetPlate = newSessionForm.plateNumber.trim().toUpperCase();
    const targetBrand = newSessionForm.brand.trim();
    const normTargetPlate = normalizePlate(targetPlate);

    // 0. Tìm Vehicle tương ứng trong danh mục xe (nếu có)
    const currentVehicles = savedVehicles && savedVehicles.length > 0
      ? savedVehicles
      : await dbService.getAllVehicles();

    const matchedVehicle = currentVehicles.find((v) => {
      const vPlate = normalizePlate(v.plateNumber || (v as any).plate || '');
      const vId = normalizePlate(v.vehicleId || (v as any).id || '');
      return (vPlate && vPlate === normTargetPlate) || (vId && vId === normTargetPlate);
    });

    const targetVehId = matchedVehicle
      ? (matchedVehicle.vehicleId || (matchedVehicle as any).id || normTargetPlate)
      : normTargetPlate;

    const targetVehicleName = matchedVehicle
      ? (matchedVehicle.brand || (matchedVehicle as any).vehicleName || matchedVehicle.vehicleType || targetBrand)
      : targetBrand;

    const targetPlateNumber = matchedVehicle?.plateNumber || targetPlate;

    // 1. Kiểm tra toàn bộ RepairSession của cùng vehicleId / plateNumber
    const allSessions = await dbService.getAllRepairSessions();
    const openSession = allSessions.find(
      (s) =>
        !s.isDeleted &&
        (s.vehicleId === targetVehId || normalizePlate(s.vehicleId || '') === normTargetPlate || normalizePlate(s.plateNumber || '') === normTargetPlate) &&
        s.workflowState !== 'HANDED_OVER' &&
        s.status !== 'CLOSED' &&
        !s.closedAt
    );

    // 2. Nếu tồn tại RepairSession OPEN (isDeleted != true) -> KHÔNG tạo mới, thông báo & trả về session OPEN
    if (openSession) {
      alert(
        'Xe hiện đang có một hồ sơ sửa chữa đang mở. Vui lòng tiếp tục xử lý hồ sơ hiện có hoặc hoàn tất bàn giao trước khi tạo hồ sơ mới.'
      );
      handleSelectSession(openSession);
      setShowCreateSessionModal(false);
      return;
    }

    // 3. Chỉ khi KHÔNG tồn tại RepairSession OPEN mới được phép tạo RepairSession mới
    const currUser = getCurrentUserSession();
    const nowISO = new Date().toISOString();
    const sessionData = {
      campaignId: newSessionForm.campaignId,
      campaignName: selectedCampaign?.campaignName || '',
      campaignCode: selectedCampaign?.campaignCode || '',
      vehicleId: targetVehId,
      damageProtocolId: '',
      plateNumber: targetPlateNumber,
      vehicleName: targetVehicleName,
      repairLevel: newSessionForm.repairLevel || 'Sửa chữa lớn',
      workflowState: 'RECEIVED' as const,
      receiveDate: newSessionForm.receptionDate || nowISO.split('T')[0],
      openedAt: nowISO,
      createdBy: currUser?.fullName || currUser?.username || 'Cán bộ quản lý',
      handoverTemplateCode: null,
      selectionTemplateCode: null,
    };

    const created = await dbService.saveRepairSession(sessionData);
    await loadSessionsData();
    if (created) {
      handleSelectSession(created);
    }
    setShowCreateSessionModal(false);
  };

  const handleSaveSuccess = async (plate: string) => {
    await propsHandleSaveSuccess(plate);
    await loadSessionsData();
  };

  // Fetch attachments
  useEffect(() => {
    const fetchAllFiles = async () => {
      try {
        const q = query(collection(db, 'uploaded_files'));
        const snapshot = await getDocs(q);
        const files: UploadedFile[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.isDeleted === true || data.isDeleted === 'true') return;
          files.push({ id: docSnap.id, ...data } as UploadedFile);
        });
        files.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
        setAllFiles(files);
      } catch (error) {
        console.error('Error fetching all attachments:', error);
      }
    };
    fetchAllFiles();
  }, []);

  useEffect(() => {
    let list = activeDocSubTab ? allFiles.filter((f) => f.subTab === activeDocSubTab) : [];

    if (docSearchQuery.trim()) {
      const q = docSearchQuery.trim().toLowerCase();
      list = allFiles.filter(
        (f) =>
          (f.plateNumber && f.plateNumber.toLowerCase().includes(q)) ||
          f.name.toLowerCase().includes(q)
      );
    } else {
      if (activeDocSubTab) {
        list = allFiles.filter((f) => f.subTab === activeDocSubTab);
        if (selectedSession) {
          list = list.filter((f) => f.repairSessionId === selectedSession.id);
        } else {
          list = [];
        }
      } else {
        list = [];
      }
    }

    setUploadedFiles(list);
    setPreviewFile(null);
  }, [activeDocSubTab, allFiles, selectedSession, docSearchQuery]);

  const getExtensionType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
    if (ext === 'pdf') return 'pdf';
    return 'document';
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const addFiles = async (filesList: any[]) => {
    if (!canModifyReception) {
      alert('Bạn chỉ có quyền xem dữ liệu.');
      return;
    }
    const currentPlate = selectedSession?.plateNumber || selectedTreeVehicle?.plateNumber || selectedVehicle?.plateNumber || '';
    const currentVehId = selectedSession?.vehicleId || selectedTreeVehicle?.vehicleId || selectedVehicle?.vehicleId || '';

    for (const file of filesList) {
      try {
        const fileType = getExtensionType(file.name);
        const result = await uploadImageToCloudinary(file);
        const currUser = getCurrentUserSession();

        const newFile: Omit<UploadedFile, 'id'> = {
          name: file.name,
          size: formatBytes(file.size),
          type: fileType,
          uploadedAt: formatVNTime(new Date()),
          url: result.secure_url,
          publicId: result.public_id,
          subTab: activeDocSubTab as string,
          uploadedBy: currentUserRole || 'User',
          uploadedByUid: currUser?.uid || '',
          uploadedByUsername: currUser?.username || '',
          uploadedByFullName: currUser?.fullName || '',
          uploadedByRole: currUser?.role || '',
          uploadedByUnit: currUser?.unit || '',
          vehicleId: currentVehId,
          plateNumber: currentPlate,
          repairSessionId: selectedSession?.id || '',
        };

        const docRef = await addDoc(collection(db, 'uploaded_files'), newFile);
        const fileWithId: UploadedFile = { id: docRef.id, ...newFile };

        setUploadedFiles((prev) => [fileWithId, ...prev]);
        setAllFiles((prevAll) => [fileWithId, ...prevAll]);
      } catch (error: any) {
        console.error(`Upload Error: ${error?.message || error}`);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canModifyReception) {
      alert('Bạn chỉ có quyền xem dữ liệu.');
      return;
    }
    if (!e.target.files) return;
    addFiles(Array.from(e.target.files));
  };

  const handleDeleteFile = async (id: string) => {
    const fileItem = uploadedFiles.find((f) => f.id === id) || allFiles.find((f) => f.id === id);
    const targetDoc = fileItem
      ? {
          ...fileItem,
          createdBy: fileItem.uploadedByUid || (fileItem as any).createdBy,
          createdByUnit: fileItem.uploadedByUnit || (fileItem as any).createdByUnit,
        }
      : null;

    const canDeleteFile = canEdit && (targetDoc ? canEditDocument(currentUser, targetDoc) : false);
    if (!canDeleteFile) {
      alert('Bạn chỉ có quyền xem dữ liệu.');
      return;
    }

    try {
      const currUser = getCurrentUserSession();
      await updateDoc(doc(db, 'uploaded_files', id), {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: currUser?.uid || 'unknown',
        deletedByName: currUser?.fullName || currUser?.username || 'Người dùng',
        deletedByRole: currUser?.role || 'Không xác định',
      });

      setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
      setAllFiles((prevAll) => prevAll.filter((f) => f.id !== id));
      if (previewFile?.id === id) setPreviewFile(null);
    } catch (e) {
      console.error('Error deleting document:', e);
    }
  };

  const getDocCountForSubTab = (subTabKey: string) => {
    if (!selectedSession) return 0;
    return allFiles.filter(
      (f) =>
        f.subTab === subTabKey &&
        f.repairSessionId === selectedSession.id
    ).length;
  };

  // Current selected vehicle reference
  const matchedProtocolForSelected = damageProtocols.find(
    (dp) =>
      (dp.repairSessionId && dp.repairSessionId === selectedSession?.id) ||
      (selectedSession?.damageProtocolId && dp.protocolId === selectedSession.damageProtocolId)
  );

  const currentVehicleData: CampaignVehicleItem | null = selectedSession
    ? {
        vehicleId: selectedSession.vehicleId || normalizePlate(selectedSession.plateNumber),
        plateNumber: selectedSession.plateNumber,
        brand:
          selectedSession.vehicleName ||
          matchedProtocolForSelected?.brand ||
          matchedProtocolForSelected?.vehicleType ||
          'Chưa xác định',
        campaignName: resolveCampaignName(
          selectedSession.campaignId,
          repairCampaigns,
          (selectedSession as any).campaignName || matchedProtocolForSelected?.campaignName
        ),
        repairNumberStr: `Lần sửa chữa ${String(selectedSession.repairNumber || 1).padStart(2, '0')}`,
        handoverDate: selectedSession.handoverDate ? formatVNDate(selectedSession.handoverDate) : (selectedSession.closedAt ? formatVNDate(selectedSession.closedAt) : 'Chưa bàn giao'),
        status: (selectedSession.workflowState === 'HANDED_OVER'
          ? 'HANDED_OVER'
          : selectedSession.workflowState === 'REPAIRING' ||
            selectedSession.workflowState === 'IN_PROGRESS'
          ? 'IN_PROGRESS'
          : selectedSession.workflowState === 'RECEIVED'
          ? 'RECEIVED'
          : 'PLANNING') as any,
        statusText: getWorkflowStateText(selectedSession.workflowState),
        statusBadgeColor: getWorkflowBadgeColor(selectedSession.workflowState),
        sessionCode: selectedSession.repairCode || selectedSession.id,
        receptionDate: formatVNDate(selectedSession.receiveDate, selectedSession.createdAt) || '---',
        unit: matchedProtocolForSelected?.representativeGeneral || 'Ban Xe-Máy',
        repairLevel: selectedSession.repairLevel || 'Sửa chữa lớn',
        progress:
          selectedSession.workflowState === 'HANDED_OVER'
            ? 100
            : selectedSession.workflowState === 'REPAIRING' ||
              selectedSession.workflowState === 'IN_PROGRESS'
            ? 60
            : 30,
        currentTask: getWorkflowCurrentTask(selectedSession.workflowState),
        createdBy: selectedSession.createdBy || matchedProtocolForSelected?.createdBy || 'Ban Xe-Máy',
        createdAt: toIsoDateString(selectedSession.createdAt) || '---',
      }
    : null;

  // Update field of current selected vehicle in real-time
  const handleUpdateVehicleHeaderField = async (field: keyof CampaignVehicleItem, value: any) => {
    const updated = { ...currentVehicleData, [field]: value };
    setSelectedTreeVehicle(updated);

    if (selectedSession) {
      const updatedSession: RepairSession = {
        ...selectedSession,
        vehicleName: field === 'brand' ? value : selectedSession.vehicleName,
        repairLevel: field === 'repairLevel' ? value : selectedSession.repairLevel,
        receiveDate: field === 'receptionDate' ? value : selectedSession.receiveDate,
      };
      setSelectedSession(updatedSession);
      try {
        await dbService.saveRepairSession(updatedSession);
        await loadSessionsData();
      } catch (e) {
        console.error('Error updating session header:', e);
      }
    }
  };

  // Update RepairCampaign for current selected session
  const handleUpdateCampaignId = async (newCampaignId: string) => {
    if (!selectedSession) return;
    const selectedCampaign = repairCampaigns.find((c) => c.id === newCampaignId);
    const updatedSession: RepairSession = {
      ...selectedSession,
      campaignId: newCampaignId,
      campaignName: selectedCampaign?.campaignName || '',
      campaignCode: selectedCampaign?.campaignCode || '',
    };
    setSelectedSession(updatedSession);
    try {
      await dbService.saveRepairSession(updatedSession);
      await loadSessionsData();
    } catch (e) {
      console.error('Error updating session campaign:', e);
      alert('Không thể cập nhật đợt sửa chữa. Vui lòng thử lại.');
    }
  };

  const currentCampaignName = 'Danh sách Hồ sơ Sửa chữa Tập trung';

  if (viewMode === 'CREATE_PROTOCOL') {
    return (
      <div className="w-full font-[Times_New_Roman,serif] animate-fade-in mt-3">
        {!canModifyReception && (
          <style>{`
            .lock-submit-btn button[type="submit"] { display: none !important; }
            .lock-upload #file-upload-input { display: none !important; }
          `}</style>
        )}
        <div className="bg-white p-5 md:p-8 rounded-2xl border border-stone-200 shadow-sm lock-submit-btn lock-upload">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-150">
            <h3 className="font-extrabold text-stone-900 text-lg uppercase tracking-tight">
              Lập Biên bản Tiếp nhận Hồ sơ Xe
            </h3>
            <button
              onClick={() => setViewMode('BROWSE')}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-lg transition-all cursor-pointer"
            >
              Hủy tác vụ
            </button>
          </div>
          <ReceiveForm
            initialPlate={notFoundPlate || lastSearchedPlate}
            existingVehicle={selectedVehicle}
            onCancel={() => setViewMode('BROWSE')}
            onSaveSuccess={handleSaveSuccess}
            saveLogFn={async (v, h) => {
              if (!canModifyReception) {
                alert('Bạn chỉ có quyền xem dữ liệu.');
                return;
              }
              return dbService.saveRepairLog(v, h);
            }}
          />
        </div>
      </div>
    );
  }

  // Handlers for preview zoom and pan
  const handlePreviewZoomIn = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 25, 400));
  };
  const handlePreviewZoomOut = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };
  const handlePreviewZoomReset = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoomLevel(100);
    setPanPosition({ x: 0, y: 0 });
  };
  const handlePreviewWheel = (e: React.WheelEvent) => {
    if (previewFile?.type !== 'image') return;
    e.stopPropagation();
    if (e.deltaY < 0) {
      handlePreviewZoomIn();
    } else {
      handlePreviewZoomOut();
    }
  };
  const handlePreviewMouseDown = (e: React.MouseEvent) => {
    if (previewFile?.type !== 'image' || zoomLevel <= 100) return;
    e.preventDefault();
    setIsDraggingImage(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };
  const handlePreviewMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingImage || zoomLevel <= 100) return;
    setPanPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handlePreviewMouseUpOrLeave = () => {
    if (isDraggingImage) setIsDraggingImage(false);
  };
  const handleClosePreview = () => {
    setPreviewFile(null);
    setZoomLevel(100);
    setPanPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewFile) return;
      if (e.key === 'Escape') {
        handleClosePreview();
      } else if (previewFile.type === 'image') {
        if (e.key === '+' || e.key === '=') {
          setZoomLevel(prev => Math.min(prev + 25, 400));
        } else if (e.key === '-') {
          setZoomLevel(prev => Math.max(prev - 25, 50));
        } else if (e.key === '0') {
          setZoomLevel(100);
          setPanPosition({ x: 0, y: 0 });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewFile]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-[Times_New_Roman,serif] animate-fade-in mt-3">
      {/* =========================================================================
          PANEL BÊN TRÁI: TREE VIEW REPAIR SESSIONS (MILITARY GREEN THEME)
         ========================================================================= */}
      <div className="lg:col-span-4 lg:sticky lg:top-4 space-y-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-300/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-900" />
              <h4 className="font-bold text-emerald-950 text-sm tracking-wide uppercase">
                HỒ SƠ SỬA CHỮA
              </h4>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowCampaignManagementModal(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-2xs transition-all cursor-pointer"
                title="Quản lý đợt sửa chữa"
              >
                <FolderOpen className="w-3 h-3" /> Quản lý đợt
              </button>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                {repairSessions.length} hồ sơ
              </span>
            </div>
          </div>

          {/* Search box inside Tree */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm đợt, loại xe, biển số..."
              value={treeSearchQuery}
              onChange={(e) => setTreeSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            />
            {treeSearchQuery && (
              <button 
                onClick={() => setTreeSearchQuery('')} 
                className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600 text-xs font-bold cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          {/* Tree View 5 Cấp */}
          <div className="space-y-1 text-xs select-none max-h-[600px] overflow-y-auto pr-1">
            {isLoadingSessions ? (
              <div className="text-center py-8 text-xs text-emerald-800 font-semibold animate-pulse">
                Đang tải danh sách hồ sơ...
              </div>
            ) : Object.keys(treeData).length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 italic bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4">
                {treeSearchQuery ? 'Không tìm thấy hồ sơ phù hợp.' : 'Chưa có hồ sơ sửa chữa nào. Nhấp nút bên dưới để tạo hồ sơ mới.'}
              </div>
            ) : (
              Object.keys(treeData).sort((a, b) => b.localeCompare(a)).map((year) => {
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
                        {Object.keys(campaignsObj).map((campaign) => {
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
                                                        const isSelected = selectedSession?.id === session.id;
                                                        const sessionNumberStr = `Lần sửa chữa ${String(session.repairNumber || idx + 1).padStart(2, '0')}`;

                                                        return (
                                                          /* Cấp 5: Lần sửa chữa */
                                                          <div 
                                                            key={session.id}
                                                            className={`group flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer transition-all text-xs ${
                                                              isSelected 
                                                                ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 shadow-2xs' 
                                                                : 'hover:bg-stone-100 text-stone-600 font-medium'
                                                            }`}
                                                            onClick={() => handleSelectSession(session)}
                                                          >
                                                            <div className="flex items-center gap-2 min-w-0">
                                                              <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-emerald-600 ring-2 ring-emerald-300' : 'bg-stone-400'}`}></div>
                                                              <span className="truncate">{sessionNumberStr}</span>
                                                            </div>
                                                            {canEdit && (
                                                              <button
                                                                onClick={(e) => handleDeleteSession(session, e)}
                                                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-all cursor-pointer"
                                                                title="Xóa hồ sơ sửa chữa"
                                                              >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                              </button>
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
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Action button: Tạo hồ sơ sửa chữa mới */}
          {canEdit && (
            <button
              onClick={handleOpenCreateSessionModal}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer uppercase tracking-wide"
            >
              <Plus className="w-4 h-4" /> TẠO HỒ SƠ SỬA CHỮA MỚI
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          PANEL BÊN PHẢI: DASHBOARD THÔNG TIN XE (EDITABLE HEADER CARDS & MILITARY GREEN THEME)
         ========================================================================= */}
      <div className="lg:col-span-8 space-y-6">
        {/* If user clicked a document subtab [MỞ], show file manager panel */}
        {activeDocSubTab || docSearchQuery.trim() ? (
          <div className="bg-white rounded-2xl border border-emerald-300 shadow-sm overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
              <div>
                <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-0.5">
                  Tài Liệu Hồ Sơ Đính Kèm Xe: {currentVehicleData.plateNumber}
                </div>
                <h3 className="font-bold text-slate-900 text-base md:text-lg flex items-center gap-2 uppercase">
                  <FolderOpen className="h-5 w-5 text-emerald-900" />
                  <span>
                    {activeDocSubTab === 'REPAIR_ORDER'
                      ? 'Lệnh sửa chữa'
                      : activeDocSubTab === 'VEHICLE_PAPERS'
                      ? 'Giấy tờ xe'
                      : activeDocSubTab === 'INTRO_LETTER'
                      ? 'Giấy giới thiệu'
                      : 'Biên bản kiểm tra kỹ thuật xe-máy'}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveDocSubTab(null);
                  setDocSearchQuery('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg transition-all cursor-pointer"
              >
                ← Quay lại Dashboard
              </button>
            </div>

            {/* Drag and Drop Upload */}
            {canModifyReception && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files) {
                    addFiles(Array.from(e.dataTransfer.files));
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  dragOver
                    ? 'border-emerald-600 bg-emerald-50/40'
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70 hover:border-emerald-700/50'
                }`}
                onClick={() => document.getElementById('file-upload-input')?.click()}
              >
                <input
                  type="file"
                  id="file-upload-input"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <UploadCloud className="h-8 w-8 text-emerald-800" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">
                    Kéo thả tệp hoặc nhấp để tải tài liệu lên cho xe {currentVehicleData.plateNumber}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Định dạng: Ảnh (jpeg, png), Word (docx), Excel (xlsx), PDF
                  </p>
                </div>
              </div>
            )}

            {/* File list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-600 uppercase">
                  Danh mục tệp đính kèm ({uploadedFiles.length})
                </h4>
              </div>

              {uploadedFiles.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs">
                  Chưa có tài liệu đính kèm cho mục này.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                            file.type === 'image'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : file.type === 'excel'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : file.type === 'pdf'
                              ? 'bg-red-50 text-red-700 border-red-100'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {file.type === 'image' ? (
                            <Image className="h-4 w-4" />
                          ) : file.type === 'excel' ? (
                            <FileSpreadsheet className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {file.size} • {file.uploadedAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {file.url && (
                          <button
                            onClick={() => {
                              setPreviewFile(file);
                              setZoomLevel(100);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Xóa tệp"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : !selectedSession || !currentVehicleData ? (
          /* =========================================================================
             THÔNG TIN MÔ TẢ VIEW (HIỂN THỊ KHI CHƯA CHỌN XE)
             ========================================================================= */
          <div className="bg-white rounded-2xl border border-emerald-300 shadow-sm p-6 space-y-6 animate-fade-in">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-6 rounded-xl shadow-xs space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-xs">
                  <Info className="w-7 h-7 text-emerald-200" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold uppercase tracking-wide">
                    THÔNG TIN MÔ TẢ
                  </h2>
                  <p className="text-xs text-emerald-100 mt-1">
                    Phân hệ Quản lý Hồ sơ Tiếp nhận, Đợt Sửa chữa & Biểu mẫu Kỹ thuật Xe-Máy Quân sự
                  </p>
                </div>
              </div>
            </div>

            {/* Instruction Callout */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-200 text-emerald-900 rounded-lg shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 uppercase">Vui lòng chọn xe từ danh sách</h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Nhấp vào bất kỳ phương tiện nào ở danh mục <strong>"ĐỢT SỬA CHỮA"</strong> (cột bên trái) để hiển thị thông tin chi tiết, tiến độ và bộ hồ sơ đính kèm.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Description Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-xs uppercase">
                  <Layers className="w-4 h-4 shrink-0 text-emerald-800" />
                  <span>1. Quản lý Đợt sửa chữa</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Phân nhóm phương tiện theo từng đợt sửa chữa tập trung, đợt bảo dưỡng niêm cất hoặc đợt kỹ thuật định kỳ. Cho phép tạo mới, đổi tên và quản lý đợt linh hoạt.
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-xs uppercase">
                  <Truck className="w-4 h-4 shrink-0 text-emerald-800" />
                  <span>2. Hồ sơ Chi tiết Phương tiện</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Theo dõi đầy đủ biển số, chủng loại/nhãn hiệu, đơn vị quản lý, cấp sửa chữa, ngày tiếp nhận và tiến độ thực hiện nhiệm vụ của từng phương tiện.
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-xs uppercase">
                  <ClipboardList className="w-4 h-4 shrink-0 text-emerald-800" />
                  <span>3. Danh mục 4 Bộ Biểu Mẫu</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Quản lý tập trung 4 hồ sơ biểu mẫu chuẩn hóa: <i>1. Lệnh sửa chữa</i>, <i>2. Giấy tờ xe</i>, <i>3. Giấy giới thiệu</i>, <i>4. Biên bản kiểm tra kỹ thuật xe-máy</i>.
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-xs uppercase">
                  <FolderOpen className="w-4 h-4 shrink-0 text-emerald-800" />
                  <span>4. Lưu trữ Tệp Đính Kèm</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hỗ trợ tải lên và xem trực tiếp tệp hình ảnh, PDF, Word, Excel cho từng xe và từng loại văn bản với đầy đủ phân quyền và nhật ký thao tác.
                </p>
              </div>
            </div>

            {/* Workflow steps */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                Quy trình xử lý tiếp nhận xe (4 bước)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase block mb-1">Bước 01</span>
                  <span className="font-bold text-slate-800 block">Chọn / Tạo đợt</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Tạo hoặc chọn đợt sửa chữa ở danh mục bên trái</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase block mb-1">Bước 02</span>
                  <span className="font-bold text-slate-800 block">Thêm phương tiện</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Thêm xe mới hoặc nhấp chọn xe có sẵn</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase block mb-1">Bước 03</span>
                  <span className="font-bold text-slate-800 block">Lập hồ sơ kỹ thuật</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Tạo lệnh sửa chữa & biên bản kiểm tra kỹ thuật</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase block mb-1">Bước 04</span>
                  <span className="font-bold text-slate-800 block">Quản lý tài liệu</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Đính kèm tệp văn bản và theo dõi tiến độ</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             MAIN DASHBOARD FOR SELECTED VEHICLE
             ========================================================================= */
          <div className="space-y-6">
            {/* 1. THÔNG TIN HỒ SƠ SỬA CHỮA (BÌA HỒ SƠ) */}
            <div className="bg-white rounded-2xl border border-emerald-300 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-900 text-white rounded-xl shadow-xs">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                        BÌA HỒ SƠ SỬA CHỮA
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        Mã HS: {currentVehicleData.sessionCode}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold font-mono text-emerald-950 tracking-tight mt-1 flex items-center gap-2">
                      <span>{currentVehicleData.plateNumber}</span>
                      <span className="text-sm font-sans font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {currentVehicleData.brand}
                      </span>
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${currentVehicleData.statusBadgeColor}`}
                  >
                    {currentVehicleData.statusText}
                  </span>

                  <button
                    onClick={() => setIsEditingHeaderCards(!isEditingHeaderCards)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs border ${
                      isEditingHeaderCards
                        ? 'bg-emerald-800 hover:bg-emerald-900 text-white border-emerald-900'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}
                  >
                    {isEditingHeaderCards ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Đã Lưu
                      </>
                    ) : (
                      <>
                        <Pencil className="w-3.5 h-3.5" /> Chỉnh Sửa Thông Tin
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setViewMode('CREATE_PROTOCOL')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> TẠO BIÊN BẢN
                  </button>

                  <button
                    onClick={() => {
                      setSelectedSession(null);
                      setSelectedTreeVehicle(null);
                      setSelectedVehicle(null);
                      setActiveDocSubTab(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs"
                    title="Trở về màn hình Thông tin mô tả"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> TRỞ LẠI
                  </button>
                </div>
              </div>

              {/* KHU VỰC THÔNG TIN HỒ SƠ SỬA CHỮA (8 TRƯỜNG DỮ LIỆU REPAIR SESSION) */}
              <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-100">
                <div className="text-xs font-bold text-emerald-950 uppercase mb-3 flex items-center gap-1.5 border-b border-emerald-200/60 pb-2">
                  <FileText className="w-4 h-4 text-emerald-800" /> THÔNG TIN HỒ SƠ SỬA CHỮA
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                  {/* 1. Biển số xe */}
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-medium block">Biển Số Xe</span>
                    <span className="font-bold font-mono text-emerald-950 text-sm mt-0.5 block truncate">
                      {currentVehicleData.plateNumber}
                    </span>
                  </div>

                  {/* 2. Nhãn hiệu xe */}
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-medium block">Nhãn Hiệu Xe</span>
                    {isEditingHeaderCards ? (
                      <input
                        type="text"
                        value={currentVehicleData.brand}
                        onChange={(e) => handleUpdateVehicleHeaderField('brand', e.target.value)}
                        className="w-full font-bold text-slate-900 text-xs p-1 mt-0.5 bg-white border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    ) : (
                      <span className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 block truncate">
                        {currentVehicleData.brand}
                      </span>
                    )}
                  </div>

                  {/* 3. Đợt sửa chữa */}
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Đợt Sửa Chữa</span>
                    <select
                      value={selectedSession.campaignId || ''}
                      onChange={(e) => handleUpdateCampaignId(e.target.value)}
                      disabled={!canEdit}
                      className="w-full font-bold text-slate-900 text-xs sm:text-sm p-1 bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer transition-colors truncate disabled:bg-slate-50 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Chưa phân đợt / Tự do --</option>
                      {repairCampaigns
                        .filter((c) => !c.isDeleted)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.campaignCode} - {c.campaignName} ({c.year}{c.round ? ` - Đợt ${c.round}` : ''}) {c.status === 'CLOSED' ? '[Đã đóng]' : ''}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* 4. Lần sửa chữa */}
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-medium block">Lần Sửa Chữa</span>
                    <span className="font-bold text-emerald-900 text-xs sm:text-sm mt-0.5 block truncate">
                      {currentVehicleData.repairNumberStr}
                    </span>
                  </div>

                  {/* 5. Ngày tiếp nhận */}
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-medium block">Ngày Tiếp Nhận</span>
                    {isEditingHeaderCards ? (
                      <input
                        type="text"
                        value={currentVehicleData.receptionDate}
                        onChange={(e) => handleUpdateVehicleHeaderField('receptionDate', e.target.value)}
                        className="w-full font-bold text-slate-900 text-xs p-1 mt-0.5 bg-white border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    ) : (
                      <span className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 block truncate">
                        {formatVNDate(currentVehicleData.receptionDate, selectedSession?.createdAt) || '---'}
                      </span>
                    )}
                  </div>

                  {/* 6. Ngày bàn giao */}
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-medium block">Ngày Bàn Giao</span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 block truncate">
                      {currentVehicleData.handoverDate || 'Chưa bàn giao'}
                    </span>
                  </div>

                  {/* 7. Trạng thái */}
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-medium block mb-1">Trạng Thái</span>
                    <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full ${currentVehicleData.statusBadgeColor}`}>
                      {currentVehicleData.statusText}
                    </span>
                  </div>

                  {/* 8. Người lập hồ sơ */}
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-medium block">Người Lập Hồ Sơ</span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 block truncate">
                      {currentVehicleData.createdBy || 'Ban Xe-Máy'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. DANH MỤC HỒ SƠ & BIỂU MẪU */}
            <div className="bg-white rounded-2xl border border-emerald-300 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-emerald-900" />
                  <h3 className="font-bold text-emerald-950 text-sm uppercase">
                    DANH MỤC HỒ SƠ & BIỂU MẪU TIẾP NHẬN
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                  4 Hồ Sơ
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  { id: 'REPAIR_ORDER', title: '1. Lệnh sửa chữa' },
                  { id: 'VEHICLE_PAPERS', title: '2. Giấy tờ xe' },
                  { id: 'INTRO_LETTER', title: '3. Giấy giới thiệu' },
                  { id: 'TECH_INSPECTION', title: '4. Biên bản kiểm tra kỹ thuật xe-máy' },
                ].map((form) => {
                  const count = getDocCountForSubTab(form.id);
                  const hasDocs = count > 0;

                  return (
                    <div
                      key={form.id}
                      className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-emerald-300 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            hasDocs
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900">{form.title}</div>
                          {hasDocs ? (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Đã hoàn thành ({count} tài liệu)
                            </span>
                          ) : (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                              Trống (Chưa có tài liệu)
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveDocSubTab(form.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 shadow-2xs ${
                          hasDocs
                            ? 'bg-emerald-800 hover:bg-emerald-900 text-white'
                            : 'bg-emerald-900 hover:bg-emerald-950 text-white'
                        }`}
                      >
                        [MỞ]
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Tạo Hồ sơ Sửa chữa Mới */}
      {showCreateSessionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-emerald-300 shadow-xl max-w-md w-full p-6 space-y-4 font-[Times_New_Roman,serif]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-emerald-950 uppercase flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-900" /> Tạo Hồ sơ Sửa chữa Mới
              </h3>
              <button
                onClick={() => setShowCreateSessionModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Nhập thông tin xe và tiếp nhận sửa chữa để tạo hồ sơ mới trên hệ thống.
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Năm sửa chữa <span className="text-red-600">*</span>
                </label>
                <select
                  value={newSessionForm.selectedYear}
                  onChange={(e) =>
                    setNewSessionForm({
                      ...newSessionForm,
                      selectedYear: e.target.value,
                      campaignId: '',
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none bg-white font-medium"
                >
                  <option value="">-- Chọn Năm sửa chữa --</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      Năm {yr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Đợt sửa chữa <span className="text-red-600">*</span>
                </label>
                <select
                  value={newSessionForm.campaignId}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, campaignId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none bg-white font-medium"
                >
                  <option value="">
                    {!newSessionForm.selectedYear
                      ? '-- Vui lòng chọn Năm sửa chữa trước --'
                      : '-- Chọn Đợt sửa chữa --'}
                  </option>
                  {filteredCampaignsForModal.map((c) => {
                    const roundLabel = formatCampaignRoundText(c.round);
                    const labelText = roundLabel
                      ? `${roundLabel} - ${c.campaignName}`
                      : `${c.campaignCode ? c.campaignCode + ' - ' : ''}${c.campaignName}`;
                    return (
                      <option key={c.id} value={c.id}>
                        {labelText} ({c.year}) {c.status === 'CLOSED' ? '[Đã đóng]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Biển số xe *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: AC-88-99"
                  value={newSessionForm.plateNumber}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, plateNumber: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none uppercase"
                  autoFocus
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nhãn hiệu / Tên xe</label>
                <input
                  type="text"
                  placeholder="Ví dụ: UAZ 31512"
                  value={newSessionForm.brand}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, brand: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Đơn vị quản lý</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tiểu đoàn 30"
                  value={newSessionForm.unit}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, unit: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cấp sửa chữa</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Sửa chữa lớn"
                  value={newSessionForm.repairLevel}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, repairLevel: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày tiếp nhận</label>
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={newSessionForm.receptionDate}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, receptionDate: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setShowCreateSessionModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveNewSession}
                className="px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold rounded-lg cursor-pointer uppercase tracking-wide"
              >
                Xác Nhận Tạo
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal: Quản lý Đợt Sửa Chữa */}
      {showCampaignManagementModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 overflow-y-auto p-2 sm:p-4 animate-fade-in">
          <div className="max-w-7xl mx-auto my-4 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300">
            <RepairCampaignManagement
              onClose={() => setShowCampaignManagementModal(false)}
              onCampaignsUpdated={() => {
                loadSessionsData();
              }}
            />
          </div>
        </div>
      )}
      {/* Modal xác nhận xóa RepairSession */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Xóa hồ sơ sửa chữa</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Bạn có chắc chắn muốn xóa hồ sơ sửa chữa của xe{' '}
              <strong className="text-slate-900">{sessionToDelete.plateNumber || 'chưa có biển số'}</strong> – Lần sửa chữa{' '}
              <strong className="text-slate-900">{String(sessionToDelete.repairNumber || '01').padStart(2, '0')}</strong> không?
            </p>

            {deleteSessionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                {deleteSessionError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeletingSession}
                onClick={() => {
                  setSessionToDelete(null);
                  setDeleteSessionError(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isDeletingSession}
                onClick={handleConfirmDeleteSession}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingSession ? (
                  <span>Đang xóa...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xác nhận xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Xem trước tệp đính kèm */}
      {previewFile && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={handleClosePreview}>
          <div className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden max-w-5xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                  previewFile.type === 'image' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : previewFile.type === 'pdf' 
                    ? 'bg-red-50 text-red-700 border-red-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {previewFile.type === 'image' ? <Image className="w-5 h-5" /> : previewFile.type === 'pdf' ? <FileText className="w-5 h-5" /> : <File className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 truncate" title={previewFile.name}>
                    {previewFile.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {previewFile.size} • Tải lên bởi {previewFile.uploadedByFullName || previewFile.uploadedBy || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {previewFile.type === 'image' && (
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 mr-2 shadow-xs">
                    <button onClick={handlePreviewZoomOut} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors font-bold w-8 h-8 flex items-center justify-center cursor-pointer" title="Thu nhỏ ( - )">−</button>
                    <button onClick={handlePreviewZoomReset} className="px-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-md transition-colors h-8 flex items-center justify-center cursor-pointer" title="Đặt lại ( 0 )">{zoomLevel}%</button>
                    <button onClick={handlePreviewZoomIn} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors font-bold w-8 h-8 flex items-center justify-center cursor-pointer" title="Phóng to ( + )">+</button>
                  </div>
                )}
                <button 
                  onClick={handleClosePreview}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div 
              className={`flex-1 p-4 flex items-center justify-center bg-slate-100 min-h-[50vh] ${previewFile.type === 'image' ? 'overflow-hidden' : 'overflow-auto'} ${previewFile.type === 'image' && zoomLevel > 100 ? (isDraggingImage ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
              onWheel={handlePreviewWheel}
              onMouseDown={handlePreviewMouseDown}
              onMouseMove={handlePreviewMouseMove}
              onMouseUp={handlePreviewMouseUpOrLeave}
              onMouseLeave={handlePreviewMouseUpOrLeave}
            >
              {previewFile.type === 'image' && previewFile.url ? (
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name} 
                  style={{
                    transform: `scale(${zoomLevel / 100}) translate(${panPosition.x / (zoomLevel / 100)}px, ${panPosition.y / (zoomLevel / 100)}px)`,
                    transformOrigin: 'center center',
                    transition: isDraggingImage ? 'none' : 'transform 0.15s ease-out'
                  }}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-sm pointer-events-none select-none"
                  draggable={false}
                />
              ) : previewFile.type === 'pdf' && previewFile.url ? (
                <iframe 
                  src={previewFile.url} 
                  title={previewFile.name}
                  className="w-full h-[75vh] rounded-lg border border-slate-200 shadow-sm bg-white"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4">
                    <File className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-700 mb-2">Không thể xem trước loại tệp này</h4>
                  <p className="text-sm text-slate-500 mb-6">Bạn có thể tải xuống hoặc mở tệp trong tab mới</p>
                  <a 
                    href={previewFile.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Mở / Tải tệp</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
