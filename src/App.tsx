/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { NotificationPanel } from './components/NotificationPanel';
import { logger } from './utils/logger';
import { 
  Database, 
  Wrench, 
  BookOpen, 
  RotateCcw,
  PlusCircle,
  Truck,
  FileText,
  ClipboardList,
  Users,
  LogOut,
  Lock,
  X,
  Trash2,
  FolderOpen,
  Search
} from 'lucide-react';
import { isFirebaseConfigured, db, DataService } from './firebase';
import { dbService } from './services/dbService';
import { Vehicle, RepairHistory, DamageProtocol, User, RepairSession } from './types';
import { VehicleProfileCard } from './components/VehicleProfileCard';
import { HistoryTimeline } from './components/HistoryTimeline';
import { ReceiveForm } from './components/ReceiveForm';
import { DamageProtocolForm } from './components/DamageProtocolForm';
import { DamageProtocolList } from './components/DamageProtocolList';
import { TemplateDamageProtocol } from './components/TemplateDamageProtocol';
import { MilitaryInspectionForm } from './components/MilitaryInspectionForm';
import { LoginScreen } from './components/LoginScreen';
import { UserManagement } from './components/UserManagement';
import { TrashTab } from './components/TrashTab';
import { userService } from './services/userService';
import { IntroTab } from './components/IntroTab';
import { ReceptionTab } from './components/ReceptionTab';
import { canViewModule } from './services/permissionService';
import { InspectionTab } from './components/InspectionTab';
import { RepairRecordsTab } from './components/RepairRecordsTab';
import { OperationsTab } from './components/OperationsTab';
import { PostRepairRecordsTab } from './components/PostRepairRecordsTab';
import { QuickLookupTab } from './components/QuickLookupTab';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => userService.getCurrentUser());
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(() => {
    try {
      const stored = localStorage.getItem('saved_selected_vehicle');
      console.log(
        "STORAGE CHECK = " +
        (stored ? "FOUND" : "NULL")
      );
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [selectedRepairSession, setSelectedRepairSession] = useState<RepairSession | null>(() => {
    try {
      const stored = localStorage.getItem('saved_selected_repair_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [repairHistory, setRepairHistory] = useState<RepairHistory[]>([]);
  const [damageProtocols, setDamageProtocols] = useState<DamageProtocol[]>([]);
  const [activeDamageProtocol, setActiveDamageProtocol] = useState<DamageProtocol | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);
  const [savedVehicles, setSavedVehicles] = useState<Vehicle[]>([]);
  const [workspaceTab, setWorkspaceTab] = useState<'INTRO' | 'RECEPTION' | 'INSPECTION' | 'REPAIR_RECORDS' | 'POST_REPAIR_RECORDS' | 'OPERATIONS' | 'QUICK_LOOKUP'>(() => {
    return (localStorage.getItem('saved_workspaceTab') as any) || 'INTRO';
  });
  const [pendingOpenRequest, setPendingOpenRequest] = useState<{
    module: 'INSPECTION' | 'REPAIR_RECORDS' | 'POST_REPAIR_RECORDS';
    formType?: 'DAMAGE_PROTOCOL' | 'REPAIR_HISTORY' | 'POST_REPAIR_INSPECTION' | 'POST_REPAIR_HANDOVER';
    recordId: string;
  } | null>(null);
  const [allDamageProtocols, setAllDamageProtocols] = useState<DamageProtocol[]>([]);
  const [allVehicleInspectionForms, setAllVehicleInspectionForms] = useState<any[]>([]);

  const loadAllSavedVehicles = async () => {
    try {
      const list = await dbService.getAllVehicles();
      setSavedVehicles(list);
    } catch (e) {
      console.error("Failed to load saved vehicles:", e);
    }
  };

  const loadAllDamageProtocols = async () => {
    try {
      const list = await dbService.getAllDamageProtocols();
      setAllDamageProtocols(list);
      
      const formList = await dbService.getAllVehicleInspectionForms();
      setAllVehicleInspectionForms(formList);
    } catch (e) {
      console.error("Failed to load damage protocols or inspection forms:", e);
    }
  };
  
  // Controls the current operational view
  const [viewMode, setViewMode] = useState<'BROWSE' | 'CREATE_PROTOCOL' | 'CREATE_DAMAGE_PROTOCOL' | 'VIEW_PRINT_DAMAGE_PROTOCOL' | 'USER_MANAGEMENT' | 'TRASH'>(() => {
    return (localStorage.getItem('saved_viewMode') as any) || 'BROWSE';
  });
  
  // Controls the new Military Inspection Form view
  const [showDetailedInspectionForm, setShowDetailedInspectionForm] = useState(() => {
    return localStorage.getItem('saved_showDetailedInspectionForm') === 'true';
  });

  // Controls the dynamic template damage protocol panel
  const [isTemplatePanelOpen, setIsTemplatePanelOpen] = useState(false);
  
  // Tab controller for repair history vs detailed damage protocol
  const [activeTab, setActiveTab] = useState<'REPAIR_HISTORY' | 'DAMAGE_PROTOCOL'>('REPAIR_HISTORY');
  
  // Track search states
  const [notFoundPlate, setNotFoundPlate] = useState<string | null>(null);
  const [lastSearchedPlate, setLastSearchedPlate] = useState<string>('');

  const [firestoreTestStatus, setFirestoreTestStatus] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  // Refresh current user info from DB on mount
  useEffect(() => {
    const purgeDeprecatedUsers = async () => {
      if (!localStorage.getItem('purged_default_users_3')) {
        try {
          await userService.deleteUser('tuan.tq').catch(() => {});
          await userService.deleteUser('nam.lh').catch(() => {});
          await userService.deleteUser('hung.nv').catch(() => {});
          localStorage.setItem('purged_default_users_3', 'true');
        } catch (e) {}
      }
    };
    purgeDeprecatedUsers();

    if (currentUser?.username) {
      userService.loadUsers().then(users => {
        const fresh = users.find(u => u.username === currentUser?.username);
        if (fresh && JSON.stringify(fresh) !== JSON.stringify(currentUser)) {
          setCurrentUser(fresh);
          localStorage.setItem('current_user', JSON.stringify(fresh));
        }
      });
    }
  }, [currentUser?.username]);

  const handleTestFirestore = async () => {
    setFirestoreTestStatus({ status: 'loading', message: '' });
    try {
      if (!isFirebaseConfigured || !db) {
        throw new Error("Chưa cấu hình Firebase/Firestore. Vui lòng kiểm tra file firebase-applet-config.json");
      }
      const { doc, setDoc } = await import('firebase/firestore');
      const docId = 'TEST_' + Math.random().toString(36).substring(2, 11).toUpperCase();
      const testData = {
        name: "test",
        time: Date()
      };
      
      const docRef = doc(db, 'test', docId);
      await setDoc(docRef, testData);

      setFirestoreTestStatus({
        status: 'success',
        message: 'Kết nối Firestore thành công'
      });
    } catch (err: any) {
      console.error("Firestore test write error:", err);
      const errMsg = err?.message || String(err);
      setFirestoreTestStatus({
        status: 'error',
        message: errMsg
      });
    }
  };

  // Persist states to LocalStorage
  useEffect(() => {
    localStorage.setItem('saved_viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('saved_workspaceTab', workspaceTab);
  }, [workspaceTab]);

  useEffect(() => {
    localStorage.setItem('saved_showDetailedInspectionForm', String(showDetailedInspectionForm));
  }, [showDetailedInspectionForm]);

  useEffect(() => {
    if (selectedRepairSession) {
      localStorage.setItem('saved_selected_repair_session', JSON.stringify(selectedRepairSession));
    } else {
      localStorage.removeItem('saved_selected_repair_session');
    }
  }, [selectedRepairSession]);

  useEffect(() => {
    if (selectedVehicle) {
      console.log(
        "SAVE VEHICLE = " +
        JSON.stringify({
          vehicleId: selectedVehicle.vehicleId,
          plateNumber: selectedVehicle.plateNumber
        })
      );
      localStorage.setItem('saved_selected_vehicle', JSON.stringify(selectedVehicle));
      localStorage.setItem('saved_last_searched_plate', selectedVehicle.plateNumber);
      localStorage.setItem('temp_plateNumber', selectedVehicle.plateNumber);
      localStorage.setItem('temp_vktbktName', selectedVehicle.brand || '');
      localStorage.setItem('temp_chassisNumber', selectedVehicle.chassisNumber || '');
      localStorage.setItem('temp_actualChassisNumber', selectedVehicle.chassisNumber || '');
      localStorage.setItem('temp_engineNumber', selectedVehicle.engineNumber || '');
      localStorage.setItem('temp_actualEngineNumber', selectedVehicle.engineNumber || '');
      if ((selectedVehicle as any).unit) {
        localStorage.setItem('temp_giverUnit', (selectedVehicle as any).unit);
      }
    }
  }, [selectedVehicle]);

  // Start with a clean dashboard on mount so that the welcoming dynamic features menu of choice is displayed first
  useEffect(() => {
    const initApp = async () => {
      await loadAllSavedVehicles();
      await loadAllDamageProtocols();
      
      const storedSession = localStorage.getItem('saved_selected_repair_session');
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          if (parsedSession && parsedSession.id) {
            const sessions = await dbService.getAllRepairSessions();
            const freshSession = sessions.find(s => s.id === parsedSession.id && !s.isDeleted);
            if (freshSession) {
              setSelectedRepairSession(freshSession);
            } else {
              setSelectedRepairSession(parsedSession);
            }
          }
        } catch (e) {
          console.error("Failed to restore selected repair session on mount:", e);
        }
      }

      const stored = localStorage.getItem('saved_selected_vehicle');
      console.log(
        "STORAGE CHECK = " +
        (stored ? "FOUND" : "NULL")
      );
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.vehicleId) {
            const result = await dbService.searchVehicle(parsed.plateNumber || parsed.vehicleId);
            if (result.vehicle) {
              setSelectedVehicle(result.vehicle);
              setRepairHistory(result.history || []);
              const dps = await dbService.getDamageProtocols(result.vehicle.vehicleId);
              setDamageProtocols(dps || []);
            }
          }
        } catch (e) {
          console.error("Failed to restore selected vehicle on mount:", e);
        }
      }
    };
    initApp();
  }, []);

  const handleSearch = async (plate: string) => {
    setIsSearching(true);
    setNotFoundPlate(null);
    setSelectedVehicle(null);
    setSelectedRepairSession(null);
    setRepairHistory([]);
    setDamageProtocols([]);
    setViewMode('BROWSE');
    setWorkspaceTab('RECEPTION');

    try {
      const result = await dbService.searchVehicle(plate);
      console.log(
        "SEARCH RESULT = " +
        JSON.stringify({
          hasVehicle: !!result.vehicle,
          vehicleId: result.vehicle?.vehicleId,
          plateNumber: result.vehicle?.plateNumber
        })
      );
      if (result.vehicle) {
        setSelectedVehicle(result.vehicle);
        setRepairHistory(result.history);
        setLastSearchedPlate(result.vehicle.plateNumber);
        const dps = await dbService.getDamageProtocols(result.vehicle.vehicleId);
        setDamageProtocols(dps);

        // Fetch repair sessions for this vehicle and set active open session
        const sessions = await dbService.getAllRepairSessions();
        const vSessions = sessions.filter(s => (s.vehicleId === result.vehicle.vehicleId || s.plateNumber === result.vehicle.plateNumber) && !s.isDeleted);
        const openSession = vSessions.find(s => s.status !== 'CLOSED' && s.workflowState !== 'HANDED_OVER' && !s.closedAt);
        if (openSession) {
          setSelectedRepairSession(openSession);
        } else if (vSessions.length > 0) {
          vSessions.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setSelectedRepairSession(vSessions[0]);
        }
      } else {
        setNotFoundPlate(plate);
        setLastSearchedPlate(plate);
      }
    } catch (e) {
      console.error("Critical search error:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenCreateNew = () => {
    setViewMode('CREATE_PROTOCOL');
    setNotFoundPlate(null);
  };

  const handleSaveSuccess = async (savedPlate: string) => {
    setViewMode('BROWSE');
    setActiveDamageProtocol(null);
    await loadAllSavedVehicles();
    await loadAllDamageProtocols();
    // Re-trigger search for the saved plate to display its updated specs/timeline
    await handleSearch(savedPlate);
  };

  const handleReset = () => {
    setSelectedVehicle(null);
    setSelectedRepairSession(null);
    setRepairHistory([]);
    setDamageProtocols([]);
    setActiveDamageProtocol(null);
    setNotFoundPlate(null);
    setLastSearchedPlate('');
    setViewMode('BROWSE');
    setActiveTab('REPAIR_HISTORY');
    localStorage.removeItem('saved_selected_vehicle');
    localStorage.removeItem('saved_selected_repair_session');
  };

  const handleDeleteHistory = async (historyId: string) => {
    await dbService.deleteRepairLog(historyId);
    setRepairHistory(prev => prev.filter(h => h.historyId !== historyId));
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    await dbService.deleteVehicle(vehicleId);
    await loadAllSavedVehicles();
    if (selectedVehicle && (selectedVehicle.vehicleId === vehicleId || selectedVehicle.plateNumber === vehicleId)) {
      setSelectedVehicle(null);
      setSelectedRepairSession(null);
      localStorage.removeItem('saved_selected_vehicle');
      localStorage.removeItem('saved_selected_repair_session');
    }
  };

  // Damage Protocol Handlers
  const handleSaveDamageProtocol = async (payload: Omit<DamageProtocol, 'protocolId' | 'createdAt'>) => {
    await dbService.saveDamageProtocol(payload);
    await loadAllDamageProtocols();
    if (selectedVehicle) {
      const dps = await dbService.getDamageProtocols(selectedVehicle.vehicleId);
      setDamageProtocols(dps);
    }
    setViewMode('BROWSE');
    setActiveTab('DAMAGE_PROTOCOL');
  };

  const handleDeleteDamageProtocol = async (id: string) => {
    try {
      await dbService.deleteDamageProtocol(id);
      await loadAllDamageProtocols();
      setDamageProtocols(prev => prev.filter(p => p.protocolId !== id));
      logger.success("Đã xóa biên bản.");
    } catch (e) {
      logger.error("Không thể xóa biên bản.", e);
    }
  };

  const handleDeleteVehicleInspectionForm = async (id: string) => {
    try {
      await dbService.deleteVehicleInspectionForm(id);
      setAllVehicleInspectionForms(prev => prev.filter(f => f.docId !== id && f.protocolId !== id && f.vehicleId !== id && f.id !== id));
      await loadAllDamageProtocols();
      logger.success("Đã xóa biên bản kiểm chọn.");
    } catch (e) {
      logger.error("Không thể xóa biên bản kiểm chọn.", e);
    }
  };

  const handlePrintDamageProtocol = (protocol: DamageProtocol) => {
    setActiveDamageProtocol(protocol);
    setViewMode('VIEW_PRINT_DAMAGE_PROTOCOL');
  };

  const handleOpenRecord = (request: {
    module: 'INSPECTION' | 'REPAIR_RECORDS' | 'POST_REPAIR_RECORDS';
    formType?: 'DAMAGE_PROTOCOL' | 'REPAIR_HISTORY' | 'POST_REPAIR_INSPECTION' | 'POST_REPAIR_HANDOVER';
    recordId: string;
  }) => {
    console.log("Unified open record request in App.tsx:", request);
    setPendingOpenRequest(request);
    
    // Attempt to set selectedVehicle to load properly if formType is DAMAGE_PROTOCOL
    if (request.formType === 'DAMAGE_PROTOCOL') {
      const matched = allDamageProtocols.find(p => p.protocolId === request.recordId || p.id === request.recordId);
      if (matched) {
        const vPlate = matched.plateNumber;
        const vId = matched.vehicleId;
        const matchedVehicle = savedVehicles.find(v => v.plateNumber === vPlate || v.vehicleId === vId);
        if (matchedVehicle) {
          setSelectedVehicle(matchedVehicle);
        } else if (vPlate) {
          setSelectedVehicle({
            vehicleId: vId || 'TEMP-' + Date.now(),
            plateNumber: vPlate,
            brand: matched.brand || 'Hyundai County',
            vehicleType: matched.vehicleType || 'Xe quân sự',
            vehicleGroup: '',
            chassisNumber: matched.chassisNumber || '',
            engineNumber: matched.engineNumber || '',
            yearOfManufacture: '',
            countryOfOrigin: ''
          } as any);
        }
      }
    } else if (request.formType === 'REPAIR_HISTORY') {
      const loadVehicleForRepairHistory = async () => {
        try {
          const stored = await DataService.load('postRepairRecords') || [];
          const matched = stored.find((p: any) => p.repairRecordId === request.recordId);
          if (matched) {
            const vPlate = matched.plateNumber;
            const vId = matched.vehicleId;
            const matchedVehicle = savedVehicles.find(v => v.plateNumber === vPlate || v.vehicleId === vId);
            if (matchedVehicle) {
              setSelectedVehicle(matchedVehicle);
            }
          } else {
            const storedHistory = await DataService.load('repairHistory') || [];
            const matchedHistory = storedHistory.find((h: any) => h.historyId === request.recordId || h.id === request.recordId);
            if (matchedHistory) {
              const matchedVehicle = savedVehicles.find(v => v.vehicleId === matchedHistory.vehicleId);
              if (matchedVehicle) {
                setSelectedVehicle(matchedVehicle);
              }
            }
          }
        } catch (e) {
          console.warn("Failed to auto-select vehicle for repair history:", e);
        }
      };
      loadVehicleForRepairHistory();
    } else if (request.formType === 'POST_REPAIR_INSPECTION' || request.formType === 'POST_REPAIR_HANDOVER') {
      const loadVehicleForPostRepair = async () => {
        try {
          const stored = await DataService.load('postRepairRecords') || [];
          const matched = stored.find((p: any) => p.repairRecordId === request.recordId && p.templateType === request.formType);
          if (matched) {
            const vPlate = matched.plateNumber;
            const vId = matched.vehicleId;
            const matchedVehicle = savedVehicles.find(v => v.plateNumber === vPlate || v.vehicleId === vId);
            if (matchedVehicle) {
              setSelectedVehicle(matchedVehicle);
            }
          }
        } catch (e) {
          console.warn("Failed to auto-select vehicle for post repair records:", e);
        }
      };
      loadVehicleForPostRepair();
    }
    
    // Transition the workspace tab based on the requested module
    setWorkspaceTab(request.module);
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-850 font-sans selection:bg-emerald-800 selection:text-white pb-12 overflow-x-hidden print:bg-white">
      
      {/* 1. Header Banner & Branding */}
      <header className="bg-emerald-950 border-b border-emerald-900 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-5">
          
          {/* Logo & Military Depot Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-900 border border-emerald-800 rounded-xl flex items-center justify-center text-emerald-100 shadow-inner">
              <Wrench className="h-6 w-6 text-yellow-500 animate-pulse" />
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs font-bold text-yellow-500 uppercase tracking-widest">
                <span>TIỂU ĐOÀN SCTH30 - CỤC HẬU CẦN-KỸ THUẬT QUÂN ĐOÀN 34</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-white mt-0.5">
                Hệ thống tiếp nhận và quản lý xe sửa chữa
              </h1>
            </div>
          </div>

          {/* Right Section: Test Widget + User profile */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto justify-end">
            
            {/* Diagnostic Firestore Test Widget */}
            <div className="flex flex-col items-center md:items-end gap-1.5">
              <button
                onClick={handleTestFirestore}
                disabled={firestoreTestStatus.status === 'loading'}
                id="test-firestore-btn"
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-sm border transition-all flex items-center gap-2 cursor-pointer ${
                  firestoreTestStatus.status === 'loading'
                    ? 'bg-stone-800/50 text-stone-400 border-stone-700 cursor-not-allowed'
                    : 'bg-emerald-900 border-emerald-800 hover:bg-emerald-850 text-emerald-100'
                }`}
              >
                <Database className="h-3.5 w-3.5 text-yellow-500" />
                <span>Test Firestore</span>
              </button>
              {firestoreTestStatus.status === 'success' && (
                <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-900 px-2 py-0.5 rounded animate-fade-in">
                  Kết nối Firestore thành công
                </span>
              )}
              {firestoreTestStatus.status === 'error' && (
                <span className="text-[11px] font-medium text-red-400 bg-red-950/85 border border-red-900 px-2 py-0.5 rounded break-all max-w-xs text-center md:text-right animate-fade-in">
                  {firestoreTestStatus.message}
                </span>
              )}
            </div>

            {/* User Session Profile & Controls */}
            <div className="flex items-center gap-3.5 bg-emerald-900 border border-emerald-800 rounded-xl p-3 text-white self-stretch md:self-auto shadow-inner">
              <div className="text-left">
                <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-extrabold leading-none pb-0.5">
                  {currentUser.rank || 'Chưa rõ cấp bậc'} • {currentUser.unit || 'Chưa rõ đơn vị'}
                </div>
                <div className="text-xs font-black text-white flex items-center gap-1.5 py-0.5 leading-none">
                  <span>{currentUser.fullName || 'Chưa cập nhật tên'}</span>
                  <span className="text-[10px] text-emerald-200/70 font-mono font-medium">@{currentUser.username}</span>
                </div>
                <div className="text-[10px] text-stone-300 font-semibold leading-none">
                  {currentUser.role === 'pho_dai_doi_truong' ? 'Phó Đại đội trưởng' :
                   currentUser.role === 'trung_doi_truong' ? 'Trung đội trưởng' :
                   currentUser.role === 'to_truong' ? 'Tổ trưởng' :
                   currentUser.role === 'kcs' ? 'Nhân viên KCS' :
                   currentUser.role === 'tro_ly_ky_thuat' ? 'Trợ lý Kỹ thuật' :
                   currentUser.role === 'quan_ly_cap_tren' ? 'Quản lý cấp trên' :
                   currentUser.role === 'admin' ? 'Quản trị hệ thống' : 'Chưa rõ chức vụ'}
                </div>
              </div>
              
              <div className="h-6 w-px bg-emerald-800"></div>

              <div className="flex gap-1.5">
                {['admin'].includes(currentUser.role) && (
                  <button
                    onClick={() => setViewMode(viewMode === 'TRASH' ? 'BROWSE' : 'TRASH')}
                    className={`p-2 rounded-lg transition-all border cursor-pointer ${
                      viewMode === 'TRASH'
                        ? 'bg-yellow-500 text-emerald-950 border-yellow-400'
                        : 'bg-emerald-905 border-emerald-800 hover:bg-emerald-800 text-emerald-100'
                    }`}
                    title="Quản lý thùng rác"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                {canViewModule(currentUser.role, 'USER_MANAGEMENT') && (
                  <button
                    onClick={() => setViewMode(viewMode === 'USER_MANAGEMENT' ? 'BROWSE' : 'USER_MANAGEMENT')}
                    className={`p-2 rounded-lg transition-all border cursor-pointer ${
                      viewMode === 'USER_MANAGEMENT'
                        ? 'bg-yellow-500 text-emerald-950 border-yellow-400'
                        : 'bg-emerald-905 border-emerald-800 hover:bg-emerald-800 text-emerald-100'
                    }`}
                    title="Quản lý tài khoản cán bộ quân sự"
                  >
                    <Users className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={() => {
                    userService.logout();
                    setCurrentUser(null);
                    setSelectedVehicle(null);
                    setViewMode('BROWSE');
                    localStorage.removeItem('saved_selected_vehicle');
                  }}
                  className="p-2 rounded-lg bg-red-900/60 border border-red-800 hover:bg-red-800 text-red-100 transition-all cursor-pointer"
                  title="Đăng xuất khỏi hệ thống"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* 2. Main Content Canvas */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
        
        {/* Main Content Areas */}

        {/* Beautiful Workspace Tabs Navigation */}
        <div className="flex items-center gap-1.5 md:gap-2 p-1.5 bg-white rounded-2xl shadow-sm border border-stone-200 mt-4 mb-3 font-sans w-full max-w-full overflow-x-auto scroll-smooth print:hidden">
          <button
            onClick={() => setWorkspaceTab('INTRO')}
            className={`shrink-0 lg:flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-3.5 py-2.5 md:py-3 text-xs md:text-sm font-extrabold text-center rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              workspaceTab === 'INTRO'
                ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600/30'
                : 'text-stone-700 bg-stone-50 hover:bg-stone-100 hover:text-emerald-900 border border-stone-200/60'
            }`}
          >
            <BookOpen className={`h-4 w-4 shrink-0 ${workspaceTab === 'INTRO' ? 'text-yellow-400' : 'text-stone-500'}`} />
            <span className="whitespace-nowrap">Giới thiệu</span>
          </button>
          {canViewModule(currentUser.role, 'RECEPTION') && (
            <button
              onClick={async () => {
                setWorkspaceTab('RECEPTION');
                await loadAllSavedVehicles();
              }}
              className={`shrink-0 lg:flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-3.5 py-2.5 md:py-3 text-xs md:text-sm font-extrabold text-center rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                workspaceTab === 'RECEPTION'
                  ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600/30'
                  : 'text-stone-700 bg-stone-50 hover:bg-stone-100 hover:text-emerald-900 border border-stone-200/60'
              }`}
            >
              <Truck className={`h-4 w-4 shrink-0 ${workspaceTab === 'RECEPTION' ? 'text-yellow-400' : 'text-stone-500'}`} />
              <span className="whitespace-nowrap">Tiếp nhận</span>
            </button>
          )}
          {canViewModule(currentUser.role, 'INSPECTION') && (
            <button
              onClick={async () => {
                setWorkspaceTab('INSPECTION');
                await loadAllDamageProtocols();
              }}
              className={`shrink-0 lg:flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-3.5 py-2.5 md:py-3 text-xs md:text-sm font-extrabold text-center rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                workspaceTab === 'INSPECTION'
                  ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600/30'
                  : 'text-stone-700 bg-stone-50 hover:bg-stone-100 hover:text-emerald-900 border border-stone-200/60'
              }`}
            >
              <Wrench className={`h-4 w-4 shrink-0 ${workspaceTab === 'INSPECTION' ? 'text-yellow-400' : 'text-stone-500'}`} />
              <span className="whitespace-nowrap">Hồ sơ kiểm tra đầu vào</span>
            </button>
          )}
          {canViewModule(currentUser.role, 'REPAIR') && (
            <button
              onClick={async () => {
                setWorkspaceTab('REPAIR_RECORDS');
              }}
              className={`shrink-0 lg:flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-3.5 py-2.5 md:py-3 text-xs md:text-sm font-extrabold text-center rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                workspaceTab === 'REPAIR_RECORDS'
                  ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600/30'
                  : 'text-stone-700 bg-stone-50 hover:bg-stone-100 hover:text-emerald-900 border border-stone-200/60'
              }`}
            >
              <ClipboardList className={`h-4 w-4 shrink-0 ${workspaceTab === 'REPAIR_RECORDS' ? 'text-yellow-400' : 'text-stone-500'}`} />
              <span className="whitespace-nowrap">Hồ sơ sửa chữa</span>
            </button>
          )}
          {canViewModule(currentUser.role, 'POST_REPAIR') && (
            <button
              onClick={async () => {
                setWorkspaceTab('POST_REPAIR_RECORDS');
              }}
              className={`shrink-0 lg:flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-3.5 py-2.5 md:py-3 text-xs md:text-sm font-extrabold text-center rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                workspaceTab === 'POST_REPAIR_RECORDS'
                  ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600/30'
                  : 'text-stone-700 bg-stone-50 hover:bg-stone-100 hover:text-emerald-900 border border-stone-200/60'
              }`}
            >
              <FileText className={`h-4 w-4 shrink-0 ${workspaceTab === 'POST_REPAIR_RECORDS' ? 'text-yellow-400' : 'text-stone-500'}`} />
              <span className="whitespace-nowrap">Hồ sơ sau sửa chữa</span>
            </button>
          )}
          {canViewModule(currentUser.role, 'OPERATIONS') && (
            <button
              onClick={async () => {
                setWorkspaceTab('OPERATIONS');
              }}
              className={`shrink-0 lg:flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-3.5 py-2.5 md:py-3 text-xs md:text-sm font-extrabold text-center rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                workspaceTab === 'OPERATIONS'
                  ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600/30'
                  : 'text-stone-700 bg-stone-50 hover:bg-stone-100 hover:text-emerald-900 border border-stone-200/60'
              }`}
            >
              <FolderOpen className={`h-4 w-4 shrink-0 ${workspaceTab === 'OPERATIONS' ? 'text-yellow-400' : 'text-stone-500'}`} />
              <span className="whitespace-nowrap">Điều hành công việc</span>
            </button>
          )}
          {canViewModule(currentUser.role, 'QUICK_LOOKUP') && (
            <button
              onClick={() => {
                setWorkspaceTab('QUICK_LOOKUP');
              }}
              className={`shrink-0 lg:flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-3.5 py-2.5 md:py-3 text-xs md:text-sm font-extrabold text-center rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                workspaceTab === 'QUICK_LOOKUP'
                  ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600/30'
                  : 'text-stone-700 bg-stone-50 hover:bg-stone-100 hover:text-emerald-900 border border-stone-200/60'
              }`}
            >
              <Search className={`h-4 w-4 shrink-0 ${workspaceTab === 'QUICK_LOOKUP' ? 'text-yellow-400' : 'text-stone-500'}`} />
              <span className="whitespace-nowrap">Tra cứu nhanh</span>
            </button>
          )}
        </div>

        {/* Mobile Active Module Header Banner */}
        <div className="md:hidden mb-5 p-3.5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-2xl shadow-md border border-emerald-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/20 border border-yellow-500/40 rounded-xl text-yellow-400 shrink-0 shadow-inner">
              {workspaceTab === 'INTRO' && <BookOpen className="h-5 w-5" />}
              {workspaceTab === 'RECEPTION' && <Truck className="h-5 w-5" />}
              {workspaceTab === 'INSPECTION' && <Wrench className="h-5 w-5" />}
              {workspaceTab === 'REPAIR_RECORDS' && <ClipboardList className="h-5 w-5" />}
              {workspaceTab === 'POST_REPAIR_RECORDS' && <FileText className="h-5 w-5" />}
              {workspaceTab === 'OPERATIONS' && <FolderOpen className="h-5 w-5" />}
              {workspaceTab === 'QUICK_LOOKUP' && <Search className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-extrabold text-yellow-400 tracking-wider">MODULE HIỆN TẠI</div>
              <div className="text-sm font-black text-white leading-tight">
                {workspaceTab === 'INTRO' && 'Giới thiệu hệ thống'}
                {workspaceTab === 'RECEPTION' && 'Tiếp nhận xe sửa chữa'}
                {workspaceTab === 'INSPECTION' && 'Hồ sơ kiểm tra đầu vào'}
                {workspaceTab === 'REPAIR_RECORDS' && 'Hồ sơ sửa chữa'}
                {workspaceTab === 'POST_REPAIR_RECORDS' && 'Hồ sơ sau sửa chữa'}
                {workspaceTab === 'OPERATIONS' && 'Điều hành công việc'}
                {workspaceTab === 'QUICK_LOOKUP' && 'Tra cứu nhanh'}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-800 text-emerald-100 border border-emerald-700 shrink-0 shadow-xs">
            {['INTRO', 'RECEPTION', 'INSPECTION', 'REPAIR_RECORDS', 'POST_REPAIR_RECORDS', 'OPERATIONS', 'QUICK_LOOKUP'].indexOf(workspaceTab) + 1}/7
          </span>
        </div>

        {/* Global USER_MANAGEMENT view has override priority */}
        {viewMode === 'USER_MANAGEMENT' ? (
          <UserManagement 
            currentUser={currentUser}
            onBack={() => setViewMode('BROWSE')}
            onCurrentUserUpdate={(u) => setCurrentUser(u)}
          />
        ) : viewMode === 'TRASH' && ['admin'].includes(currentUser.role) ? (
          <TrashTab
            onBack={() => {
              loadAllDamageProtocols();
              setViewMode('BROWSE');
            }}
          />
        ) : (
          <>
            {/* Search Loading State */}
            {isSearching ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="h-10 w-10 text-emerald-800 animate-spin mb-3" />
                <h3 className="font-bold text-stone-800 text-lg">Đang đối chiếu dữ liệu quân kỳ</h3>
                <p className="text-stone-500 text-sm mt-1">Vui lòng đợi giây lát để kiểm tra hồ sơ cơ bản...</p>
              </div>
            ) : (
              <>
                {/* Tab 1: "Giới thiệu" */}
                {workspaceTab === 'INTRO' && (
                  <IntroTab 
                    currentUser={currentUser!}
                    onNavigateToTab={(tab) => {
                      setWorkspaceTab(tab);
                      if (tab === 'RECEPTION') {
                        loadAllSavedVehicles();
                      } else {
                        loadAllDamageProtocols();
                      }
                    }}
                    onOpenCreateNew={() => {
                      setWorkspaceTab('RECEPTION');
                      setViewMode('CREATE_PROTOCOL');
                      setNotFoundPlate(null);
                    }}
                    onOpenInspection={() => {
                      setWorkspaceTab('INSPECTION');
                      setShowDetailedInspectionForm(true);
                    }}
                  />
                )}

                {/* Tab 2: "Tiếp nhận" */}
                {workspaceTab === 'RECEPTION' && canViewModule(currentUser.role, 'RECEPTION') && (
                  <ReceptionTab 
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    selectedVehicle={selectedVehicle}
                    setSelectedVehicle={setSelectedVehicle}
                    selectedRepairSession={selectedRepairSession}
                    onSelectRepairSession={setSelectedRepairSession}
                    savedVehicles={savedVehicles}
                    repairHistory={repairHistory}
                    notFoundPlate={notFoundPlate}
                    lastSearchedPlate={lastSearchedPlate}
                    setNotFoundPlate={setNotFoundPlate}
                    handleSaveSuccess={handleSaveSuccess}
                    handleSearch={handleSearch}
                    handleDeleteHistory={handleDeleteHistory}
                    handleDeleteVehicle={handleDeleteVehicle}
                    currentUserRole={currentUser?.role}
                  />
                )}

                {/* Tab 3: "Hồ sơ kiểm tra đầu vào" */}
                {workspaceTab === 'INSPECTION' && canViewModule(currentUser.role, 'INSPECTION') && (
                  <InspectionTab 
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    selectedVehicle={selectedVehicle}
                    setSelectedVehicle={setSelectedVehicle}
                    selectedRepairSession={selectedRepairSession}
                    onSelectRepairSession={setSelectedRepairSession}
                    savedVehicles={savedVehicles}
                    showDetailedInspectionForm={showDetailedInspectionForm}
                    setShowDetailedInspectionForm={setShowDetailedInspectionForm}
                    activeDamageProtocol={activeDamageProtocol}
                    setActiveDamageProtocol={setActiveDamageProtocol}
                    allDamageProtocols={allDamageProtocols}
                    allVehicleInspectionForms={allVehicleInspectionForms}
                    loadAllDamageProtocols={loadAllDamageProtocols}
                    handleSaveDamageProtocol={handleSaveDamageProtocol}
                    handleDeleteDamageProtocol={handleDeleteDamageProtocol}
                    handleDeleteVehicleInspectionForm={handleDeleteVehicleInspectionForm}
                    handlePrintDamageProtocol={handlePrintDamageProtocol}
                    currentUserRole={currentUser?.role}
                    pendingOpenRequest={pendingOpenRequest}
                    onClearPendingOpenRequest={() => setPendingOpenRequest(null)}
                  />
                )}

                {/* Tab 4: "Hồ sơ sửa chữa" */}
                {workspaceTab === 'REPAIR_RECORDS' && canViewModule(currentUser.role, 'REPAIR') && (
                  <RepairRecordsTab 
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    selectedVehicle={selectedVehicle}
                    selectedRepairSession={selectedRepairSession}
                    onSelectRepairSession={setSelectedRepairSession}
                    savedVehicles={savedVehicles}
                    pendingOpenRequest={pendingOpenRequest}
                    onClearPendingOpenRequest={() => setPendingOpenRequest(null)}
                  />
                )}

                {/* Tab 4.5: "Hồ sơ sau sửa chữa" */}
                {workspaceTab === 'POST_REPAIR_RECORDS' && canViewModule(currentUser.role, 'POST_REPAIR') && (
                  <PostRepairRecordsTab 
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    selectedVehicle={selectedVehicle}
                    selectedRepairSession={selectedRepairSession}
                    onSelectRepairSession={setSelectedRepairSession}
                    savedVehicles={savedVehicles}
                    currentUserRole={currentUser?.role}
                    pendingOpenRequest={pendingOpenRequest}
                    onClearPendingOpenRequest={() => setPendingOpenRequest(null)}
                  />
                )}

                {/* Tab 5: "Điều hành công việc" */}
                {workspaceTab === 'OPERATIONS' && canViewModule(currentUser.role, 'OPERATIONS') && (
                  <OperationsTab />
                )}

                {/* Tab 6: "Tra cứu nhanh" */}
                {workspaceTab === 'QUICK_LOOKUP' && canViewModule(currentUser.role, 'QUICK_LOOKUP') && (
                  <QuickLookupTab 
                    onOpenRecord={handleOpenRecord}
                    selectedRepairSession={selectedRepairSession}
                    onSelectRepairSession={setSelectedRepairSession}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>
      
      {/* Footer credits */}
      <footer className="mt-12 text-center text-xs text-stone-400 font-sans pb-6 print:hidden">
        <p>© 2026 TIỂU ĐOÀN SCTH30 - CỤC HẬU CẦN-KỸ THUẬT QUÂN ĐOÀN 34</p>
      </footer>

      {isTemplatePanelOpen && selectedVehicle && (
        <TemplateDamageProtocol
          vehicle={selectedVehicle}
          onClose={async () => {
            setIsTemplatePanelOpen(false);
            if (selectedVehicle) {
              const dps = await dbService.getDamageProtocols(selectedVehicle.vehicleId);
              setDamageProtocols(dps);
            }
          }}
        />
      )}

      <NotificationPanel />
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      className={`animate-spin ${className}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
