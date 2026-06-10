import { canEditDocument } from '../services/ownershipService';
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, FileDown, Printer, Plus } from 'lucide-react';
import { Vehicle } from '../types';
import { getCurrentUserSession } from '../services/dbService';
import { DataService } from '../firebase';
import { AutoResizeTextarea } from './AutoResizeTextarea';

interface Props {
  vehicle?: Vehicle | null;
  existingFormId?: string;
  templateName?: string;
  stageName?: string;
  templateType?: string;
  onSaved?: (payload?: any) => void;
  onClose: () => void;
  initialData?: any;
}

const BODY_INSPECTION_ITEMS = [
  // I. Kiểm tra vỏ xe, các mối hàn
  { id: 1101, category: 'I. Kiểm tra vỏ xe, các mối hàn', content: 'Vỏ xe không bập bùng.', unit: '-', requirement: 'Không bập bùng' },
  { id: 1102, category: 'I. Kiểm tra vỏ xe, các mối hàn', content: 'Không có rỗ mọt trên toàn xe.', unit: '-', requirement: 'Không có rỗ mọt' },
  { id: 1103, category: 'I. Kiểm tra vỏ xe, các mối hàn', content: 'Mài phẳng mối hàn.', unit: '-', requirement: 'Mài phẳng' },
  
  // II. Kiểm tra hình dáng xe
  { id: 1201, category: 'II. Kiểm tra hình dáng xe', content: 'Hình dạng xe phải hài hòa, cân đối.', unit: '-', requirement: 'Hài hòa, cân đối' },
  { id: 1202, category: 'II. Kiểm tra hình dáng xe', content: 'Độ không đồng phẳng', unit: 'mm', requirement: '≤ 1,5 mm' },
  { id: 1203, category: 'II. Kiểm tra hình dáng xe', content: 'Theo mẫu xe nguyên thủy mà TCN quy định.', unit: '-', requirement: 'Đúng mẫu' },
  
  // III. Khóa cửa, tay nắm, cơ cấu nâng hạ kính
  { id: 1301, category: 'III. Khóa cửa, tay nắm, cơ cấu nâng hạ kính', content: 'Đầy đủ', unit: '-', requirement: 'Có đủ' },
  { id: 1302, category: 'III. Khóa cửa, tay nắm, cơ cấu nâng hạ kính', content: 'Đồng bộ', unit: '-', requirement: 'Đồng bộ' },
  { id: 1303, category: 'III. Khóa cửa, tay nắm, cơ cấu nâng hạ kính', content: 'Hoạt động', unit: '-', requirement: 'Ổn định' }
];

const getInspectionItems = (type?: string) => {
  return BODY_INSPECTION_ITEMS;
};

export const BodyInspectionBeforeRepairForm: React.FC<Props> = ({ vehicle, existingFormId, templateName, stageName, templateType, initialData, onSaved, onClose }) => {
  const [zoom, setZoom] = useState(100);
  const printRef = useRef<HTMLDivElement>(null);
  
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);
  const [showVehicleSelect, setShowVehicleSelect] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicle?.vehicleId || '');

  const [formData, setFormData] = useState(() => {
    const defaultItems = getInspectionItems(templateType);
    return {
      vehicleName: vehicle?.brand || '',
      vehicleNumber: vehicle?.plateNumber || '',
      xxNumber1: '',
      stageNumber: '',
      xxNumber2: '',
      sheetNumber: '',
      items: defaultItems.map(item => ({ ...item, actual: '' })),
      conclusion: 'Cụm thân, vỏ xe đã được kiểm tra đúng Quy trình công nghệ.'
    };
  });

  const resolvedTemplateName = templateName || 'PHIẾU KIỂM TRA THÂN VỎ TRƯỚC SỬA CHỮA';
  const resolvedStageName = stageName || 'Kiểm tra thân vỏ trước sửa chữa';

  const [docId, setDocId] = useState(() => {
    if (existingFormId) return existingFormId;
    const baseId = vehicle ? `BIR_${vehicle.vehicleId}_${Date.now()}` : `BIR_${Date.now()}`;
    return baseId.replace(/[^a-zA-Z0-9_\\-]/g, '_');
  });

  useEffect(() => {
    loadData();
    const loadVehicles = async () => {
      try {
        const dps = await DataService.load('damageProtocols') || [];
        const localDps = JSON.parse(localStorage.getItem('local_damageProtocols') || '[]');
        const allDps = (Array.isArray(dps) && dps.length > 0) ? dps : localDps;

        const activeDps = allDps.filter((p: any) => p.isDeleted !== true && p.isDeleted !== 'true');

        const mappedVehicles = activeDps.map((dp: any) => ({
          vehicleId: dp.vehicleId,
          plateNumber: dp.plateNumber,
          brand: dp.brand,
          vehicleType: dp.vehicleType,
          chassisNumber: dp.chassisNumber,
          engineNumber: dp.engineNumber
        }));

        const uniqueVehicles = Array.from(new Map(mappedVehicles.map((item: any) => [item.vehicleId, item])).values()) as Vehicle[];

        setVehiclesList(uniqueVehicles);
      } catch (err) {}
    };
    loadVehicles();
  }, [vehicle, docId, initialData]);

  const loadData = async () => {
    try {
      let foundDoc = initialData || null;

      // Check local storage first
      const targetType = templateType || 'BODY_PRE_REPAIR';
      const storeKey = `local_${targetType}`;
      let localData = localStorage.getItem(storeKey);
      if (!localData) {
        const legacyKey = 'local_repairForms';
        const legacyData = localStorage.getItem(legacyKey);
        if (legacyData) {
          try {
            const parsedLegacy = JSON.parse(legacyData);
            if (Array.isArray(parsedLegacy)) {
              const legacyItems = parsedLegacy.filter((f: any) => f.templateType === targetType);
              if (legacyItems.length > 0) {
                localStorage.setItem(storeKey, JSON.stringify(legacyItems));
                localData = JSON.stringify(legacyItems);
              }
            }
          } catch (e) {}
        }
      }
      const list = localData ? JSON.parse(localData) : [];
      
      let matchedCount = 0;

      const normalizeStr = (s: any) => s ? String(s).replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';

      if (!foundDoc) {
        if (existingFormId) {
          foundDoc = list.find((item: any) => item.id === existingFormId && !item.isDeleted);
          if (foundDoc) matchedCount++;
        } else if (vehicle) {
          const targetType = templateType || 'BODY_PRE_REPAIR';
          const targetVehId = normalizeStr(vehicle.vehicleId);
          const targetVehPlate = normalizeStr(vehicle.plateNumber);

          foundDoc = list.find((item: any) => {
            const itemVehId = normalizeStr(item.vehicleId);
            const itemPlate = normalizeStr(item.plateNumber || item.formData?.vehicleNumber || '');
            const isMatched = (itemVehId && (itemVehId === targetVehId || itemVehId === targetVehPlate)) ||
                              (itemPlate && (itemPlate === targetVehId || itemPlate === targetVehPlate));
            return isMatched && item.templateType === targetType && !item.isDeleted;
          });
          if (foundDoc) matchedCount++;
        }
      }

      // If not in local storage or didn't find, try Firebase/DataService
      if (!foundDoc) {
        if (existingFormId) {
          const dbDoc = await DataService.get('repairForms', existingFormId);
          if (dbDoc && !dbDoc.isDeleted) {
            foundDoc = dbDoc;
            matchedCount++;
          }
        } else if (vehicle) {
          const targetType = templateType || 'BODY_PRE_REPAIR';
          const dbForms = await DataService.load('repairForms');
          if (Array.isArray(dbForms)) {
            const targetVehId = normalizeStr(vehicle.vehicleId);
            const targetVehPlate = normalizeStr(vehicle.plateNumber);

            const dbDoc = dbForms.find((item: any) => {
              const itemVehId = normalizeStr(item.vehicleId);
              const itemPlate = normalizeStr(item.plateNumber || item.formData?.vehicleNumber || '');
              const isMatched = (itemVehId && (itemVehId === targetVehId || itemVehId === targetVehPlate)) ||
                                (itemPlate && (itemPlate === targetVehId || itemPlate === targetVehPlate));
              return isMatched && item.templateType === targetType && !item.isDeleted;
            });
            if (dbDoc) {
              foundDoc = dbDoc;
              matchedCount++;
            }
          }
        }
      }

      if (foundDoc) {
        if (foundDoc.formData) {
          setFormData(foundDoc.formData);
        }
        if (foundDoc.id && foundDoc.id !== docId) {
          setDocId(foundDoc.id);
        }
      } else {
        if (!existingFormId) {
          const defaultItems = getInspectionItems(templateType);
          setFormData({
            vehicleName: vehicle?.brand || '',
            vehicleNumber: vehicle?.plateNumber || '',
            xxNumber1: '',
            stageNumber: '',
            xxNumber2: '',
            sheetNumber: '',
            items: defaultItems.map(item => ({ ...item, actual: '' })),
            conclusion: 'Cụm thân, vỏ xe đã được kiểm tra đúng Quy trình công nghệ.'
          });
        }
      }
    } catch (err) {
      console.warn('Error loading form data:', err);
    }
  };

  const handleSave = async () => {
    try {
      const formVehicleId = selectedVehicleId || vehicle?.vehicleId || 'NO_VEHICLE';

      const currentUser = getCurrentUserSession();
      
      let docExists = false;
      let existingDoc = null;
      try {
        existingDoc = await DataService.get('repairForms', docId);
        if (existingDoc && !existingDoc.isDeleted) {
          docExists = true;
        }
      } catch (err) {}

      if (existingDoc && currentUser && !canEditDocument(currentUser, existingDoc)) {
        alert('Bạn chỉ có quyền xem dữ liệu.');
        return;
      }

      const payload = {
        id: docId,
        vehicleId: formVehicleId,
        templateType: templateType || 'BODY_PRE_REPAIR',
        templateName: docExists && existingDoc?.templateName ? existingDoc.templateName : resolvedTemplateName,
        stageName: docExists && existingDoc?.stageName ? existingDoc.stageName : resolvedStageName,
        formData: formData,
        isDeleted: false,
        createdBy: docExists && existingDoc?.createdBy ? existingDoc.createdBy : (currentUser?.uid || currentUser?.username || 'unknown'),
        createdByName: docExists && existingDoc?.createdByName ? existingDoc.createdByName : (currentUser?.fullName || 'unknown'),
        createdAt: docExists && existingDoc?.createdAt ? existingDoc.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (docExists) {
        await DataService.update('repairForms', docId, payload);
      } else {
        await DataService.save('repairForms', payload);
      }
      
      // Update local storage cache
      const targetType = templateType || 'BODY_PRE_REPAIR';
      const storeKey = `local_${targetType}`;
      const localData = localStorage.getItem(storeKey);
      const list = localData ? JSON.parse(localData) : [];
      const existingIdx = list.findIndex(
        (item: any) => item.id && docId && String(item.id).trim().toLowerCase() === String(docId).trim().toLowerCase()
      );
      if (existingIdx >= 0) {
        list[existingIdx] = payload;
      } else {
        list.push(payload);
      }
      localStorage.setItem(storeKey, JSON.stringify(list));

      const legacyKey = 'local_repairForms';
      const legacyData = localStorage.getItem(legacyKey);
      if (legacyData) {
        try {
          const legacyList = JSON.parse(legacyData);
          if (Array.isArray(legacyList)) {
            const idx = legacyList.findIndex(
              (item: any) => item.id && docId && String(item.id).trim().toLowerCase() === String(docId).trim().toLowerCase()
            );
            if (idx >= 0) {
              legacyList[idx] = payload;
            } else {
              legacyList.push(payload);
            }
            localStorage.setItem(legacyKey, JSON.stringify(legacyList));
          }
        } catch (e) {}
      }

      console.log('Đã lưu phiếu kiểm tra thân vỏ.');
      if (onSaved) onSaved(payload);
      onClose();
    } catch (err) {
      console.error('Không thể lưu dữ liệu.', err);
    }
  };

  const handleDelete = async () => {
    try {
      const currentUser = getCurrentUserSession();
      let existingDoc = null;
      try {
        existingDoc = await DataService.get('repairForms', docId);
      } catch (err) {}
      if (existingDoc && currentUser && !canEditDocument(currentUser, existingDoc)) {
        alert('Bạn chỉ có quyền xem dữ liệu.');
        return;
      }
    } catch(err) {}

    let confirmed = false;
    try {
      confirmed = window.confirm('Bạn có chắc chắn muốn xóa phiếu kiểm tra này?');
    } catch (err) {
      console.warn('window.confirm is blocked or unsupported in this sandbox:', err);
      confirmed = true;
    }

    if (!confirmed) return;

    try {
      const currentUser = getCurrentUserSession();
      // Soft delete via DataService directly
      try {
        const updatePayload = {
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: currentUser?.uid || currentUser?.username || "unknown",
          deletedByName: currentUser?.fullName || currentUser?.username || "Người dùng",
          deletedByRole: currentUser?.role || "Không xác định",
        };
        await DataService.update('repairForms', docId, updatePayload);
      } catch (err) {
        console.warn('Could not update firebase for delete:', err);
      }
      
      // Update local storage
      const targetType = templateType || 'BODY_PRE_REPAIR';
      const storeKey = `local_${targetType}`;
      let list = [];
      const localData = localStorage.getItem(storeKey);
      if (localData) {
        try {
          list = JSON.parse(localData);
          if (!Array.isArray(list)) list = [];
        } catch (e) {
          list = [];
        }
      }
      
      const existingIdx = list.findIndex(
        (item: any) => item.id && docId && String(item.id).trim().toLowerCase() === String(docId).trim().toLowerCase()
      );
      if (existingIdx >= 0) {
        list[existingIdx] = {
          ...list[existingIdx],
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: currentUser?.uid || currentUser?.username || "unknown",
          deletedByName: currentUser?.fullName || currentUser?.username || "Người dùng",
          deletedByRole: currentUser?.role || "Không xác định",
        };
      } else {
        list.push({
          id: docId,
          vehicleId: vehicle?.vehicleId,
          templateType: targetType,
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: currentUser?.uid || currentUser?.username || "unknown",
          deletedByName: currentUser?.fullName || currentUser?.username || "Người dùng",
          deletedByRole: currentUser?.role || "Không xác định",
        });
      }
      localStorage.setItem(storeKey, JSON.stringify(list));
      
      // Also update legacy local_repairForms if it exists
      const legacyKey = 'local_repairForms';
      let legacyList = [];
      const legacyData = localStorage.getItem(legacyKey);
      if (legacyData) {
        try {
          legacyList = JSON.parse(legacyData);
          if (!Array.isArray(legacyList)) legacyList = [];
        } catch (e) {
          legacyList = [];
        }
      }
      
      const legacyIdx = legacyList.findIndex(
        (item: any) => item.id && docId && String(item.id).trim().toLowerCase() === String(docId).trim().toLowerCase()
      );
      if (legacyIdx >= 0) {
        legacyList[legacyIdx] = {
          ...legacyList[legacyIdx],
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: currentUser?.uid || currentUser?.username || "unknown",
          deletedByName: currentUser?.fullName || currentUser?.username || "Người dùng",
          deletedByRole: currentUser?.role || "Không xác định",
        };
      } else {
        legacyList.push({
          id: docId,
          vehicleId: vehicle?.vehicleId,
          templateType: targetType,
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: currentUser?.uid || currentUser?.username || "unknown",
          deletedByName: currentUser?.fullName || currentUser?.username || "Người dùng",
          deletedByRole: currentUser?.role || "Không xác định",
        });
      }
      localStorage.setItem(legacyKey, JSON.stringify(legacyList));
      
      console.log('Đã xóa phiếu kiểm tra (vào thùng rác).');
      if (onSaved) onSaved(); // call without payload to trigger refresh
      onClose();
    } catch (err) {
      console.error('Không thể xóa dữ liệu.', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...formData.items];
    newItems[index].actual = value;
    setFormData({ ...formData, items: newItems });
  };

  
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-100/90 backdrop-blur-sm overflow-hidden print:bg-white print:static print:h-auto print:overflow-visible">
      
      {/* Header controls */}
      <div className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between shrink-0 print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500 hover:text-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-stone-200"></div>
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="px-2 py-1 hover:bg-white rounded text-sm text-stone-600 font-medium">-</button>
            <span className="text-sm font-mono text-stone-600 w-12 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="px-2 py-1 hover:bg-white rounded text-sm text-stone-600 font-medium">+</button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            id="delete-button-selector"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete();
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
          >
            Xóa
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            In biểu mẫu
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Xuất PDF
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Lưu phiếu
          </button>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 overflow-y-auto w-full flex justify-center p-8 print:p-0 print:block">
        <div 
          ref={printRef}
          style={{ 
            zoom: `${zoom}%`,
            fontFamily: '"Times New Roman", Times, serif'
          }}
          className="bg-white shadow-xl max-w-[210mm] w-full min-h-[297mm] p-[20mm] mx-auto text-black print:shadow-none print:m-0 print:p-0 print:max-w-none origin-top print:!zoom-100"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="text-center font-bold">
              <p className="text-base m-0 leading-tight">CỤC HC - KT</p>
              <p className="text-base m-0 leading-tight">Tiểu đoàn 30</p>
              <p className="text-base m-0 leading-tight">Đại đội S/C xe máy</p>
              <p className="text-base m-0 leading-tight">Tổ S/C Máy, gầm</p>
            </div>
            <div className="text-right">
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-bold uppercase m-0 leading-tight mb-2">PHIẾU KIỂM TRA: Số 1</h1>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 text-[15px] leading-relaxed">
            <div>
              <div className="flex gap-2 relative items-end">
                <span className="whitespace-nowrap">Tên TBKT:</span>
                <input 
                  type="text" 
                  value={formData.vehicleName}
                  onChange={(e) => setFormData({...formData, vehicleName: e.target.value})}
                  className="border-b border-dotted border-black flex-1 bg-transparent outline-none pb-0 px-2 font-bold" 
                />
                <button
                  onClick={() => setShowVehicleSelect(!showVehicleSelect)}
                  className="ml-2 px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-semibold rounded-md shadow-sm transition-colors print:hidden whitespace-nowrap font-sans cursor-pointer focus:outline-none"
                  title="Chọn xe từ danh sách"
                >
                  {showVehicleSelect ? 'Đóng' : 'Chọn xe...'}
                </button>
                {showVehicleSelect && (
                  <div className="absolute top-full right-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-stone-200 shadow-xl rounded-lg z-50 print:hidden text-black font-sans">
                    <div className="sticky top-0 bg-stone-100 px-3 py-2 border-b border-stone-200 flex justify-between items-center z-10">
                      <span className="text-xs font-bold text-stone-600 uppercase">Danh sách xe</span>
                      <button 
                        onClick={() => setShowVehicleSelect(false)}
                        className="text-stone-400 hover:text-stone-700 font-bold px-2"
                        title="Đóng danh sách"
                      >
                        ✕
                      </button>
                    </div>
                    {vehiclesList.length > 0 ? (
                      vehiclesList.map(v => (
                        <div 
                          key={v.vehicleId} 
                          className="px-3 py-2 hover:bg-emerald-50 cursor-pointer border-b border-stone-100 last:border-0 transition-colors"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              vehicleName: v.brand || v.vehicleGroup || 'Không xác định',
                              vehicleNumber: v.plateNumber || ''
                            });
                            setSelectedVehicleId(v.vehicleId);
                            setShowVehicleSelect(false);
                          }}
                        >
                          <div className="font-bold text-sm">{v.plateNumber}</div>
                          <div className="text-xs text-stone-500">{v.brand} - {v.vehicleType}</div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-stone-500 text-center">Không có dữ liệu xe</div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <span className="whitespace-nowrap">Số hiệu:</span>
                <input 
                  type="text" 
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                  className="border-b border-dotted border-black flex-1 bg-transparent outline-none pb-0 px-2 font-bold" 
                />
              </div>
              <div className="flex gap-2 mt-2">
                <span className="whitespace-nowrap">Số XX:</span>
                <input 
                  type="text" 
                  value={formData.xxNumber1}
                  onChange={(e) => setFormData({...formData, xxNumber1: e.target.value})}
                  className="border-b border-dotted border-black flex-1 bg-transparent outline-none pb-0 px-2 font-bold" 
                />
              </div>
            </div>
            
            <div>
              <div className="flex gap-2">
                <span className="whitespace-nowrap">Cụm - Công đoạn:</span>
                <span className="font-bold border-b border-dotted border-black flex-1 whitespace-nowrap">{resolvedStageName}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <span className="whitespace-nowrap">Số hiệu:</span>
                <input 
                  type="text" 
                  value={formData.stageNumber}
                  onChange={(e) => setFormData({...formData, stageNumber: e.target.value})}
                  className="border-b border-dotted border-black flex-1 bg-transparent outline-none pb-0 px-2 font-bold" 
                />
              </div>
              <div className="flex gap-2 mt-2">
                <span className="whitespace-nowrap">Số XX:</span>
                <input 
                  type="text" 
                  value={formData.xxNumber2}
                  onChange={(e) => setFormData({...formData, xxNumber2: e.target.value})}
                  className="border-b border-dotted border-black flex-1 bg-transparent outline-none pb-0 px-2 font-bold" 
                />
              </div>
              <div className="flex gap-2 mt-2">
                <span className="whitespace-nowrap">Tờ số:</span>
                <input 
                  type="text" 
                  value={formData.sheetNumber}
                  onChange={(e) => setFormData({...formData, sheetNumber: e.target.value})}
                  className="border-b border-dotted border-black flex-1 bg-transparent outline-none pb-0 px-2 font-bold" 
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <table className="w-full border-collapse border border-black text-[15px]">
              <thead>
                <tr>
                  <th className="border border-black px-2 py-2 text-center w-12 font-bold">TT</th>
                  <th className="border border-black px-2 py-2 text-center font-bold">NỘI DUNG KIỂM TRA</th>
                  <th className="border border-black px-2 py-2 text-center w-24 font-bold">Đơn vị đo</th>
                  <th className="border border-black px-2 py-2 text-center w-40 font-bold">Yêu cầu</th>
                  <th className="border border-black px-2 py-2 text-center w-48 font-bold">Thực tế</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let lastCategory = '';
                  return formData.items.map((item: any, index: number) => {
                    const showCategoryHeader = item.category && item.category !== lastCategory;
                    if (showCategoryHeader) {
                      lastCategory = item.category;
                    }
                    return (
                      <React.Fragment key={item.id || index}>
                        {showCategoryHeader && (
                          <tr className="bg-stone-50 print:bg-stone-100 font-bold">
                            <td colSpan={5} className="border border-black px-4 py-2 text-left text-[14px]">
                              {item.category}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="border border-black px-2 py-2 text-center">{index + 1}</td>
                          <td className="border border-black px-2 py-2">{item.content}</td>
                          <td className="border border-black px-2 py-2 text-center">{item.unit}</td>
                          <td className="border border-black px-2 py-2 text-center">{item.requirement}</td>
                          <td className="border border-black p-0">
                            <AutoResizeTextarea 
                              value={item.actual || ''}
                              onChange={(e) => handleItemChange(index, e.target.value)}
                              className="w-full h-full min-h-[36px] bg-transparent outline-none px-2 py-2 text-center font-bold text-emerald-700 print:text-black"
                            />
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  });
                })()}
              </tbody>
            </table>

            
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-[15px] mb-2">Kết luận:</h3>
            <textarea 
              value={formData.conclusion}
              onChange={(e) => setFormData({...formData, conclusion: e.target.value})}
              className="w-full h-32 border border-black p-3 outline-none text-[15px] leading-relaxed resize-none font-bold text-emerald-700 print:text-black print:border-none print:p-0 print:h-auto"
              placeholder="Nhập kết luận kiểm tra..."
            />
          </div>

          <div className="grid grid-cols-4 gap-4 mt-12">
            <div className="text-center">
              <p className="font-bold text-[15px] mb-12">THỢ KIỂM TRA</p>
              <input 
                type="text" 
                className="w-full text-center outline-none bg-transparent font-bold text-[15px] print:text-black" 
                value={formData['sign_THỢ KIỂM TRA'] || ''} 
                onChange={(e) => setFormData({...formData, 'sign_THỢ KIỂM TRA': e.target.value})}
                placeholder="..."
              />
            </div>
            <div className="text-center">
              <p className="font-bold text-[15px] mb-12">TỔ TRƯỞNG</p>
              <input 
                type="text" 
                className="w-full text-center outline-none bg-transparent font-bold text-[15px] print:text-black" 
                value={formData['sign_TỔ TRƯỞNG'] || ''} 
                onChange={(e) => setFormData({...formData, 'sign_TỔ TRƯỞNG': e.target.value})}
                placeholder="..."
              />
            </div>
            <div className="text-center">
              <p className="font-bold text-[15px] mb-12">KCS</p>
              <input 
                type="text" 
                className="w-full text-center outline-none bg-transparent font-bold text-[15px] print:text-black" 
                value={formData['sign_KCS'] || ''} 
                onChange={(e) => setFormData({...formData, 'sign_KCS': e.target.value})}
                placeholder="..."
              />
            </div>
            <div className="text-center">
              <p className="font-bold text-[15px] mb-12">ĐẠI ĐỘI TRƯỞNG</p>
              <input 
                type="text" 
                className="w-full text-center outline-none bg-transparent font-bold text-[15px] print:text-black" 
                value={formData['sign_ĐẠI ĐỘI TRƯỞNG'] || ''} 
                onChange={(e) => setFormData({...formData, 'sign_ĐẠI ĐỘI TRƯỞNG': e.target.value})}
                placeholder="..."
              />
            </div>
          </div>
</div>
      </div>
    </div>
  );
};
