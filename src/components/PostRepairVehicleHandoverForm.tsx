import { normalizeNFC } from '../utils/stringUtils';
import React, { useState, useEffect } from 'react';
import { Save, Maximize2, Minimize2, ChevronLeft } from 'lucide-react';
import { Vehicle } from '../types';
import { getCurrentUserSession, getCreatorAuditParams, getUpdaterAuditParams } from '../services/dbService';
import { DataService } from '../firebase';

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

export function PostRepairHandoverForm({
  vehicle,
  existingFormId,
  targetSessionId,
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
  const [repairHistories, setRepairHistories] = useState<any[]>([]);

  // 1. Header & Căn cứ states
  const [reportNo, setReportNo] = useState('');
  const [docDateDay, setDocDateDay] = useState('');
  const [docDateMonth, setDocDateMonth] = useState('');
  const [docDateYear, setDocDateYear] = useState('2026');

  const [commandNo, setCommandNo] = useState('');
  const [commandDate, setCommandDate] = useState('');
  const [noticeNo, setNoticeNo] = useState('');
  const [noticeDate, setNoticeDate] = useState('');
  const [todayDate, setTodayDate] = useState('');

  // 2. Đại diện bên giao
  const [giverRep, setGiverRep] = useState('');
  const [giverRank, setGiverRank] = useState('');
  const [giverPosition, setGiverPosition] = useState('');

  // 3. Đại diện bên nhận
  const [receiverUnit, setReceiverUnit] = useState('');
  const [receiverRep, setReceiverRep] = useState('');
  const [receiverRank, setReceiverRank] = useState('');
  const [receiverPosition, setReceiverPosition] = useState('');

  // 4. Thông tin xe
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleGroup, setVehicleGroup] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [dateIn, setDateIn] = useState('');
  const [dateOut, setDateOut] = useState('');
  const [inspectionReportNo, setInspectionReportNo] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [testRunKm, setTestRunKm] = useState('');

  // 5. Bảng tình trạng kỹ thuật (9 dòng)
  const [row1Tech, setRow1Tech] = useState('');
  const [row1New, setRow1New] = useState('');

  const [row2Tech, setRow2Tech] = useState('');
  const [row2New, setRow2New] = useState('');

  const [row3Tech, setRow3Tech] = useState('');
  const [row3New, setRow3New] = useState('');

  const [row4Tech, setRow4Tech] = useState('');
  const [row4New, setRow4New] = useState('');

  const [row5Tech, setRow5Tech] = useState('');
  const [row5New, setRow5New] = useState('');

  const [row6Tech, setRow6Tech] = useState('');
  const [row6New, setRow6New] = useState('');

  const [row7Tech, setRow7Tech] = useState('');
  const [row7New, setRow7New] = useState('');

  const [row8Tech, setRow8Tech] = useState('');
  const [row8New, setRow8New] = useState('');

  const [row9Tech, setRow9Tech] = useState('');
  const [row9New, setRow9New] = useState('');

  // 6. Tài liệu kèm theo
  const [profileQty, setProfileQty] = useState('01');
  const [kcsReportNo, setKcsReportNo] = useState('');
  const [kcsDateDay, setKcsDateDay] = useState('');
  const [kcsDateMonth, setKcsDateMonth] = useState('');
  const [kcsDateYear, setKcsDateYear] = useState('');
  const [warehouseExportNo, setWarehouseExportNo] = useState('');
  const [warehouseExportDay, setWarehouseExportDay] = useState('');
  const [warehouseExportMonth, setWarehouseExportMonth] = useState('');
  const [warehouseExportYear, setWarehouseExportYear] = useState('');

  // 7. Nhận xét đơn vị sau khi nhận xe
  const [unitFeedback, setUnitFeedback] = useState('');

  // 8. Chữ ký
  const [signReceiver, setSignReceiver] = useState('');
  const [signGiver, setSignGiver] = useState('');
  const [signCommander, setSignCommander] = useState('');

  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Searchable dropdown states for vehicle select
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');

  const filteredList = (handoverVehiclesList || []).filter(item => {
    if (item.isDeleted || item.isDeleted === 'true' || item._original?.isDeleted) return false;
    
    if (targetSessionId) {
      const itemSessionId = item.repairSessionId || item._original?.repairSessionId;
      if (itemSessionId !== targetSessionId) return false;
    }

    const plate = (item.plateNumber || '').toLowerCase();
    const term = dropdownSearch.toLowerCase().trim();
    return plate.includes(term);
  });

  // Sync vehicle ID from Props
  useEffect(() => {
    const vId = vehicle?.vehicleId || (vehicle as any)?.id;
    if (vId) {
      setSelectedVehicleId(vId);
    }
  }, [vehicle]);

  const activeVehicle = savedVehicles.find(v => v.vehicleId === selectedVehicleId) || vehicle;

  // Load repair histories for selected vehicle to enable linking
  useEffect(() => {
    const loadRepairHistories = async () => {
      try {
        const stored = await DataService.load('repairHistory');
        if (Array.isArray(stored)) {
          const filtered = stored.filter((rh: any) => 
            rh.vehicleId === selectedVehicleId && !rh.isDeleted
          );
          setRepairHistories(filtered);
          if (filtered.length > 0 && !repairRecordId) {
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

  // Load/populate existing or default data
  useEffect(() => {
    if (initialData) {
      const data = initialData.formData || {};
      setReportNo(data.reportNo || '');
      setDocDateDay(data.docDateDay || '');
      setDocDateMonth(data.docDateMonth || '');
      setDocDateYear(data.docDateYear || '2026');
      setCommandNo(data.commandNo || '');
      setCommandDate(data.commandDate || '');
      setNoticeNo(data.noticeNo || '');
      setNoticeDate(data.noticeDate || '');
      setTodayDate(data.todayDate || '');
      setGiverRep(data.giverRep || '');
      setGiverRank(data.giverRank || '');
      setGiverPosition(data.giverPosition || '');
      setReceiverUnit(data.receiverUnit || '');
      setReceiverRep(data.receiverRep || '');
      setReceiverRank(data.receiverRank || '');
      setReceiverPosition(data.receiverPosition || '');
      setVehicleName(data.vehicleName || '');
      setVehicleType(data.vehicleType || '');
      setVehicleGroup(data.vehicleGroup || '');
      setPlateNumber(data.plateNumber || '');
      setChassisNumber(data.chassisNumber || '');
      setEngineNumber(data.engineNumber || '');
      setDateIn(data.dateIn || '');
      setDateOut(data.dateOut || '');
      setInspectionReportNo(data.inspectionReportNo || '');
      setInspectionDate(data.inspectionDate || '');
      setTestRunKm(data.testRunKm || '');

      setRow1Tech(data.row1Tech || '');
      setRow1New(data.row1New || '');
      setRow2Tech(data.row2Tech || '');
      setRow2New(data.row2New || '');
      setRow3Tech(data.row3Tech || '');
      setRow3New(data.row3New || '');
      setRow4Tech(data.row4Tech || '');
      setRow4New(data.row4New || '');
      setRow5Tech(data.row5Tech || '');
      setRow5New(data.row5New || '');
      setRow6Tech(data.row6Tech || '');
      setRow6New(data.row6New || '');
      setRow7Tech(data.row7Tech || '');
      setRow7New(data.row7New || '');
      setRow8Tech(data.row8Tech || '');
      setRow8New(data.row8New || '');
      setRow9Tech(data.row9Tech || '');
      setRow9New(data.row9New || '');

      setProfileQty(data.profileQty || '01');
      setKcsReportNo(data.kcsReportNo || '');
      setKcsDateDay(data.kcsDateDay || '');
      setKcsDateMonth(data.kcsDateMonth || '');
      setKcsDateYear(data.kcsDateYear || '');
      setWarehouseExportNo(data.warehouseExportNo || '');
      setWarehouseExportDay(data.warehouseExportDay || '');
      setWarehouseExportMonth(data.warehouseExportMonth || '');
      setWarehouseExportYear(data.warehouseExportYear || '');
      setUnitFeedback(data.unitFeedback || '');
      setSignReceiver(data.signReceiver || '');
      setSignGiver(data.signGiver || '');
      setSignCommander(data.signCommander || '');
      setRepairRecordId(initialData.repairRecordId || '');
    } else if (activeVehicle) {
      setVehicleName(activeVehicle.brand || '');
      setVehicleType(activeVehicle.vehicleType || '');
      setVehicleGroup(activeVehicle.vehicleGroup || '');
      setPlateNumber(activeVehicle.plateNumber || '');
      setChassisNumber(activeVehicle.chassisNumber || '');
      setEngineNumber(activeVehicle.engineNumber || '');

      const d = new Date();
      setDocDateDay(d.getDate().toString().padStart(2, '0'));
      setDocDateMonth((d.getMonth() + 1).toString().padStart(2, '0'));
      setDocDateYear(d.getFullYear().toString());
      setTodayDate(`ngày ${d.getDate().toString().padStart(2, '0')} tháng ${(d.getMonth() + 1).toString().padStart(2, '0')} năm ${d.getFullYear()}`);
      setReportNo(`BBGN-${activeVehicle.plateNumber}`);
      setGiverRep('');
      setGiverRank('');
      setGiverPosition('');
      setReceiverUnit('');
      setReceiverRep('');
      setReceiverRank('');
      setReceiverPosition('');
      setTestRunKm('');
      setInspectionReportNo('');
      setInspectionDate(`ngày ${d.getDate().toString().padStart(2, '0')} tháng ${(d.getMonth() + 1).toString().padStart(2, '0')} năm ${d.getFullYear()}`);
      setDateIn('');
      setDateOut(`${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`);

      // Technical details
      setRow1Tech('');
      setRow1New('');
      setRow2Tech('');
      setRow2New('');
      setRow3Tech('');
      setRow3New('');
      setRow4Tech('');
      setRow4New('');
      setRow5Tech('');
      setRow5New('');
      setRow6Tech('');
      setRow6New('');
      setRow7Tech('');
      setRow7New('');
      setRow8Tech('');
      setRow8New('');
      setRow9Tech('');
      setRow9New('');

      setSignReceiver('');
      setSignGiver('');
      setSignCommander('');
    }
  }, [activeVehicle, initialData]);

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
      repairSessionId: targetSessionId || initialData?.repairSessionId || null,
      id: initialData?.id || `POST_REP_HAND_${Date.now()}`,
      templateType: 'POST_REPAIR_HANDOVER',
      templateName: 'Biên bản bàn giao xe hoàn thành sửa chữa',
      vehicleId: activeVehicle?.vehicleId || 'unknown_id',
      repairRecordId: repairRecordId || '',
      inspectionFormId: selectedInspectionForm?.inspectionFormId || selectedInspectionForm?.id || initialData?.inspectionFormId || '',
      plateNumber: plateNumber || activeVehicle?.plateNumber || 'Chưa rõ',
      vehicleName: vehicleName || activeVehicle?.brand || '',
      vehicleType: vehicleType || '',
      vehicleGroup: vehicleGroup || '',
      repairLevel: selectedInspectionForm?.repairLevel || initialData?.repairLevel || '',
      receiveDate: dateIn || '',
      handoverDate: dateOut || '',
      senderUnit: giverRep || 'Xưởng sửa chữa',
      receiverUnit: receiverUnit || '',
      reportNumber: reportNo || '',
      ...auditCreator,
      ...auditUpdater,
      isDeleted: false,
      formData: {
        reportNo,
        docDateDay,
        docDateMonth,
        docDateYear,
        commandNo,
        commandDate,
        noticeNo,
        noticeDate,
        todayDate,
        giverRep,
        giverRank,
        giverPosition,
        receiverUnit,
        receiverRep,
        receiverRank,
        receiverPosition,
        vehicleName,
        vehicleType,
        vehicleGroup,
        plateNumber,
        chassisNumber,
        engineNumber,
        dateIn,
        dateOut,
        inspectionReportNo,
        inspectionDate,
        testRunKm,
        row1Tech, row1New,
        row2Tech, row2New,
        row3Tech, row3New,
        row4Tech, row4New,
        row5Tech, row5New,
        row6Tech, row6New,
        row7Tech, row7New,
        row8Tech, row8New,
        row9Tech, row9New,
        profileQty,
        kcsReportNo, kcsDateDay, kcsDateMonth, kcsDateYear,
        warehouseExportNo, warehouseExportDay, warehouseExportMonth, warehouseExportYear,
        unitFeedback,
        signReceiver,
        signGiver,
        signCommander,
      }
    };

    await onSave(payload);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className={`bg-stone-100 p-3 sm:p-5 rounded-xl flex flex-col space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto' : ''}`}>
      {/* Sizing & Controls Header */}
      <div className="flex flex-wrap justify-between items-center bg-white p-3 rounded-lg border border-stone-200 gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-stone-600">Hồ sơ sửa chữa:</label>
            {repairHistories.length > 0 ? (
              <select
                value={typeof (repairRecordId) === 'string' ? (repairRecordId).normalize('NFC') : (repairRecordId)}
                onChange={(e) => setRepairRecordId(e.target.value.normalize('NFC'))}
                className="text-xs font-bold bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring focus:ring-emerald-500/20"
              >
                <option value="">-- Chọn hồ sơ liên kết --</option>
                {repairHistories.map(rh => (
                  <option key={rh.historyId || rh.id} value={typeof (rh.historyId || rh.id) === 'string' ? (rh.historyId || rh.id).normalize('NFC') : (rh.historyId || rh.id)}>
                    {rh.reportNumber} ({rh.receiveDate})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-[11px] font-medium text-stone-400 italic">Không tìm thấy lần sửa chữa liên kết</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-stone-50 px-2 py-1 rounded border border-stone-200">
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="text-xs font-bold px-1.5 py-0.5 text-stone-600 cursor-pointer">-</button>
            <span className="text-xs font-mono font-bold text-stone-700 min-w-[35px] text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="text-xs font-bold px-1.5 py-0.5 text-stone-600 cursor-pointer">+</button>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-stone-50 border border-stone-200 hover:bg-stone-100 rounded text-stone-600"
            title="Xem toàn màn hình soạn thảo"
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
            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow cursor-pointer transition-all flex items-center gap-1.5 animate-pulse-subtle"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu & Khóa'}</span>
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-stone-300 p-4 rounded-xl flex justify-center shadow-inner min-h-[800px]">
        {/* Live A4 Sheet Preview & Direct input editing */}
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
          {/* 1. HEADER */}
          <div className="grid grid-cols-2 text-center items-start mb-6 pb-4 border-b border-stone-200" style={{ fontSize: '11pt' }}>
            <div>
              <div className="font-bold uppercase" style={{ fontSize: '11pt' }}>CỤC HẬU CẦN - KỸ THUẬT QUÂN ĐOÀN 34</div>
              <div className="font-bold uppercase underline" style={{ fontSize: '11pt' }}>TIỂU ĐOÀN SCTH30</div>
              <div className="mt-1" style={{ fontSize: '11pt' }}>
                Số: <input type="text" value={typeof (reportNo) === 'string' ? (reportNo).normalize('NFC') : (reportNo)} onChange={e => setReportNo(e.target.value.normalize('NFC'))} className="w-28 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" placeholder=".................." /> /BB-GN
              </div>
            </div>
            <div>
              <div className="font-bold uppercase" style={{ fontSize: '11pt' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div className="font-bold uppercase underline" style={{ fontSize: '11pt' }}>Độc lập - Tự do - Hạnh phúc</div>
              <div className="italic mt-2" style={{ fontSize: '10.5pt' }}>
                Gia Lai, ngày <input type="text" value={typeof (docDateDay) === 'string' ? (docDateDay).normalize('NFC') : (docDateDay)} onChange={e => setDocDateDay(e.target.value.normalize('NFC'))} className="w-8 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" placeholder="..." /> tháng <input type="text" value={typeof (docDateMonth) === 'string' ? (docDateMonth).normalize('NFC') : (docDateMonth)} onChange={e => setDocDateMonth(e.target.value.normalize('NFC'))} className="w-8 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" placeholder="..." /> năm <input type="text" value={typeof (docDateYear) === 'string' ? (docDateYear).normalize('NFC') : (docDateYear)} onChange={e => setDocDateYear(e.target.value.normalize('NFC'))} className="w-12 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent font-bold" />
              </div>
            </div>
          </div>

          {/* 2. TIÊU ĐỀ */}
          <div className="text-center space-y-2 mb-8 select-none">
            <h1 className="font-bold uppercase tracking-normal text-stone-950 font-serif" style={{ fontSize: '18pt' }}>
              BIÊN BẢN GIAO NHẬN XE-MÁY SAU SỬA CHỮA
            </h1>
            <div className="w-24 h-[1px] bg-stone-800 mx-auto mt-2"></div>
          </div>

            {/* 3. PHẦN CĂN CỨ */}
            <div className="space-y-1.5 mb-6 text-[12pt] text-justify leading-relaxed">
              <div>
                - Căn cứ lệnh sửa chữa số: <input type="text" value={typeof (commandNo) === 'string' ? (commandNo).normalize('NFC') : (commandNo)} onChange={e => setCommandNo(e.target.value.normalize('NFC'))} className="w-24 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent" placeholder="........" /> ngày <input type="text" value={typeof (commandDate) === 'string' ? (commandDate).normalize('NFC') : (commandDate)} onChange={e => setCommandDate(e.target.value.normalize('NFC'))} className="w-28 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent" placeholder="............" /> của Cục Hậu cần - Kỹ thuật/QĐ34.
              </div>
              <div>
                - Căn cứ thông báo số: <input type="text" value={typeof (noticeNo) === 'string' ? (noticeNo).normalize('NFC') : (noticeNo)} onChange={e => setNoticeNo(e.target.value.normalize('NFC'))} className="w-24 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent" placeholder="........" /> ngày <input type="text" value={typeof (noticeDate) === 'string' ? (noticeDate).normalize('NFC') : (noticeDate)} onChange={e => setNoticeDate(e.target.value.normalize('NFC'))} className="w-28 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent" placeholder="............" /> của Tiểu đoàn SCTH30/CHC-KT/QĐ34.
              </div>
              <div>
                - Hôm nay ngày <input type="text" value={typeof (todayDate) === 'string' ? (todayDate).normalize('NFC') : (todayDate)} onChange={e => setTodayDate(e.target.value.normalize('NFC'))} className="w-64 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent" placeholder="..................................." /> tại Tiểu đoàn SCTH30/Cục HC-KT/QĐ34.
              </div>
            </div>

            {/* 4. ĐẠI DIỆN BÊN GIAO */}
            <div className="space-y-1 mb-3 text-[12pt]">
              <div className="font-bold">- Đại diện bên giao (Bên A): <span className="font-normal">Tiểu đoàn SCTH 30/Cục HC-KT/QĐ34.</span></div>
              <div className="flex flex-wrap items-center pl-4 gap-x-4">
                <div>
                  Người giao: <input type="text" value={typeof (giverRep) === 'string' ? (giverRep).normalize('NFC') : (giverRep)} onChange={e => setGiverRep(e.target.value.normalize('NFC'))} className="w-48 border-b border-dotted border-stone-600 focus:outline-none bg-transparent" placeholder="..................................." />
                </div>
                <div>
                  Cấp bậc: <input type="text" value={typeof (giverRank) === 'string' ? (giverRank).normalize('NFC') : (giverRank)} onChange={e => setGiverRank(e.target.value.normalize('NFC'))} className="w-24 border-b border-dotted border-stone-600 focus:outline-none bg-transparent" placeholder="..............." />
                </div>
                <div>
                  Chức vụ: <input type="text" value={typeof (giverPosition) === 'string' ? (giverPosition).normalize('NFC') : (giverPosition)} onChange={e => setGiverPosition(e.target.value.normalize('NFC'))} className="w-32 border-b border-dotted border-stone-600 focus:outline-none bg-transparent" placeholder="..............." />
                </div>
              </div>
            </div>

            {/* 5. ĐẠI DIỆN BÊN NHẬN */}
            <div className="space-y-1 mb-6 text-[12pt]">
              <div className="font-bold">
                - Đại diện bên nhận (Bên B): <input type="text" value={typeof (receiverUnit) === 'string' ? (receiverUnit).normalize('NFC') : (receiverUnit)} onChange={e => setReceiverUnit(e.target.value.normalize('NFC'))} className="w-72 border-b border-dotted border-stone-600 focus:outline-none font-normal bg-transparent" placeholder="..................................." />
              </div>
              <div className="flex flex-wrap items-center pl-4 gap-x-4">
                <div>
                  Người nhận: <input type="text" value={typeof (receiverRep) === 'string' ? (receiverRep).normalize('NFC') : (receiverRep)} onChange={e => setReceiverRep(e.target.value.normalize('NFC'))} className="w-48 border-b border-dotted border-stone-600 focus:outline-none bg-transparent" placeholder="..................................." />
                </div>
                <div>
                  Cấp bậc: <input type="text" value={typeof (receiverRank) === 'string' ? (receiverRank).normalize('NFC') : (receiverRank)} onChange={e => setReceiverRank(e.target.value.normalize('NFC'))} className="w-24 border-b border-dotted border-stone-600 focus:outline-none bg-transparent" placeholder="..............." />
                </div>
                <div>
                  Chức vụ: <input type="text" value={typeof (receiverPosition) === 'string' ? (receiverPosition).normalize('NFC') : (receiverPosition)} onChange={e => setReceiverPosition(e.target.value.normalize('NFC'))} className="w-32 border-b border-dotted border-stone-600 focus:outline-none bg-transparent" placeholder="..............." />
                </div>
              </div>
            </div>

            {/* 6. THÔNG TIN XE */}
            <div className="space-y-2 mb-6 text-[12pt] text-justify leading-relaxed">
              <div>
                Đã tiến hành giao xe ô tô: {handoverVehiclesList && handoverVehiclesList.length > 0 ? (
                  <div className="relative inline-block align-bottom text-left select-none">
                    {isDropdownOpen && (
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(!isDropdownOpen);
                        setDropdownSearch('');
                      }}
                      className="w-64 border-b border-dotted border-stone-600 focus:outline-none bg-transparent font-bold text-stone-900 cursor-pointer text-[12pt] text-left"
                      style={{ fontFamily: '"Times New Roman", Times, serif' }}
                    >
                      {selectedInspectionForm ? (
                        `${selectedInspectionForm.plateNumber || 'N/A'} | ${selectedInspectionForm.vehicleName || 'N/A'}`
                      ) : (
                        <span className="text-stone-400 font-normal">-- Chọn xe từ BBGN --</span>
                      )}
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute left-0 mt-1 w-72 bg-white border border-stone-200 rounded-lg shadow-lg z-50 p-2 space-y-2">
                        <input
                          type="text"
                          placeholder="Tìm theo Số Đăng Ký (Biển kiểm soát)..."
                          value={typeof (dropdownSearch) === 'string' ? (dropdownSearch).normalize('NFC') : (dropdownSearch)}
                          onChange={(e) => setDropdownSearch(e.target.value.normalize('NFC'))}
                          className="w-full border border-stone-200 rounded px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-normal bg-stone-50"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
                          {filteredList.length === 0 ? (
                            <div className="text-stone-400 text-xs text-center py-2 font-normal">Không tìm thấy xe</div>
                          ) : (
                            filteredList.map((item) => (
                              <div
                                key={item.inspectionFormId}
                                onClick={() => {
                                  if (setSelectedInspectionForm) {
                                    setSelectedInspectionForm(item);
                                  }
                                  setVehicleName(item.vehicleName || '');
                                  setVehicleType(item.vehicleType || '');
                                  setVehicleGroup(item.vehicleGroup || '');
                                  setPlateNumber(item.plateNumber || '');
                                  setChassisNumber(item.chassisNumber || '');
                                  setEngineNumber(item.engineNumber || '');
                                  setIsDropdownOpen(false);
                                }}
                                className={`px-2 py-1.5 text-xs rounded cursor-pointer text-left transition-colors font-normal text-stone-700 hover:bg-emerald-50 hover:text-emerald-950 ${
                                  selectedInspectionForm?.inspectionFormId === item.inspectionFormId ? 'bg-emerald-50 text-emerald-900 font-medium' : ''
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
                ) : (
                  <input type="text" value={typeof (vehicleName) === 'string' ? (vehicleName).normalize('NFC') : (vehicleName)} onChange={e => setVehicleName(e.target.value.normalize('NFC'))} className="w-56 border-b border-dotted border-stone-600 focus:outline-none bg-transparent font-bold" placeholder="..........................." />
                )} Kiểu xe: <input type="text" value={typeof (vehicleType) === 'string' ? (vehicleType).normalize('NFC') : (vehicleType)} onChange={e => setVehicleType(e.target.value.normalize('NFC'))} className="w-20 border-b border-dotted border-stone-600 focus:outline-none bg-transparent" placeholder="........" /> Nhóm xe: <input type="text" value={typeof (vehicleGroup) === 'string' ? (vehicleGroup).normalize('NFC') : (vehicleGroup)} onChange={e => setVehicleGroup(e.target.value.normalize('NFC'))} className="w-24 border-b border-dotted border-stone-600 focus:outline-none bg-transparent" placeholder="........" />
              </div>
              <div>
                Số đăng ký: <input type="text" value={typeof (plateNumber) === 'string' ? (plateNumber).normalize('NFC') : (plateNumber)} onChange={e => setPlateNumber(e.target.value.normalize('NFC'))} className="w-28 border-b border-dotted border-stone-600 focus:outline-none bg-transparent font-bold" placeholder="............" /> Số khung: <input type="text" value={typeof (chassisNumber) === 'string' ? (chassisNumber).normalize('NFC') : (chassisNumber)} onChange={e => setChassisNumber(e.target.value.normalize('NFC'))} className="w-36 border-b border-dotted border-stone-600 focus:outline-none bg-transparent font-mono" placeholder="...................." /> Số máy: <input type="text" value={typeof (engineNumber) === 'string' ? (engineNumber).normalize('NFC') : (engineNumber)} onChange={e => setEngineNumber(e.target.value.normalize('NFC'))} className="w-36 border-b border-dotted border-stone-600 focus:outline-none bg-transparent font-mono" placeholder="...................." />
              </div>
              <div>
                Ngày vào sửa chữa: <input type="text" value={typeof (dateIn) === 'string' ? (dateIn).normalize('NFC') : (dateIn)} onChange={e => setDateIn(e.target.value.normalize('NFC'))} className="w-36 border-b border-dotted border-stone-600 focus:outline-none bg-transparent" placeholder="...................." /> Ngày sửa chữa xong: <input type="text" value={typeof (dateOut) === 'string' ? (dateOut).normalize('NFC') : (dateOut)} onChange={e => setDateOut(e.target.value.normalize('NFC'))} className="w-36 border-b border-dotted border-stone-600 focus:outline-none bg-transparent" placeholder="...................." />
              </div>
              <div>
                Xe-máy được nghiệm thu tại Biên bản số: <input type="text" value={typeof (inspectionReportNo) === 'string' ? (inspectionReportNo).normalize('NFC') : (inspectionReportNo)} onChange={e => setInspectionReportNo(e.target.value.normalize('NFC'))} className="w-28 border-b border-dotted border-stone-600 focus:outline-none bg-transparent" placeholder="..........." /> ngày <input type="text" value={typeof (inspectionDate) === 'string' ? (inspectionDate).normalize('NFC') : (inspectionDate)} onChange={e => setInspectionDate(e.target.value.normalize('NFC'))} className="w-52 border-b border-dotted border-stone-600 focus:outline-none bg-transparent" placeholder="......................" />
              </div>
              <div>
                Số km (giờ máy) chạy thử khi giao, nhận: <input type="text" value={typeof (testRunKm) === 'string' ? (testRunKm).normalize('NFC') : (testRunKm)} onChange={e => setTestRunKm(e.target.value.normalize('NFC'))} className="w-96 border-b border-dotted border-stone-600 focus:outline-none bg-transparent" placeholder="..................................." />
              </div>
            </div>

            {/* 7. BẢNG TÌNH TRẠNG KỸ THUẬT KHI GIAO, NHẬN */}
            <div className="mb-6">
              <div className="font-bold text-center uppercase tracking-wider mb-2 text-[12pt]">TÌNH TRẠNG KỸ THUẬT KHI GIAO, NHẬN</div>
              <table className="w-full border-collapse border border-black text-[11pt]">
                <thead>
                  <tr className="text-center font-bold">
                    <th className="border border-black w-8 py-1">TT</th>
                    <th className="border border-black w-1/4 py-1">Tên cụm chi tiết</th>
                    <th className="border border-black w-5/12 py-1">Tình trạng kỹ thuật và đồng bộ khi xuất xưởng</th>
                    <th className="border border-black w-1/3 py-1">Các cụm chính, chi tiết cơ bản thay mới</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { idx: 1, label: 'Hệ thống động cơ', tech: row1Tech, setTech: setRow1Tech, replacement: row1New, setReplacement: setRow1New },
                    { idx: 2, label: 'Hệ thống điện', tech: row2Tech, setTech: setRow2Tech, replacement: row2New, setReplacement: setRow2New },
                    { idx: 3, label: 'Hệ thống gầm', tech: row3Tech, setTech: setRow3Tech, replacement: row3New, setReplacement: setRow3New },
                    { idx: 4, label: 'Thân xe, thùng bệ', tech: row4Tech, setTech: setRow4Tech, replacement: row4New, setReplacement: setRow4New },
                    { idx: 5, label: 'Đệm bạt', tech: row5Tech, setTech: setRow5Tech, replacement: row5New, setReplacement: setRow5New },
                    { idx: 6, label: 'Săm, lốp, bình điện', tech: row6Tech, setTech: setRow6Tech, replacement: row6New, setReplacement: setRow6New },
                    { idx: 7, label: 'Phần đặc chủng', tech: row7Tech, setTech: setRow7Tech, replacement: row7New, setReplacement: setRow7New },
                    { idx: 8, label: 'Dụng cụ phụ kiện kèm theo', tech: row8Tech, setTech: setRow8Tech, replacement: row8New, setReplacement: setRow8New },
                    { idx: 9, label: 'Phần sơn', tech: row9Tech, setTech: setRow9Tech, replacement: row9New, setReplacement: setRow9New },
                  ].map(row => (
                    <tr key={row.idx}>
                      <td className="border border-black text-center py-1 font-bold">{row.idx}</td>
                      <td className="border border-black px-2 py-1 font-bold text-center leading-tight bg-stone-50">{row.label}</td>
                      <td className="border border-black p-1">
                        <textarea 
                          value={typeof (row.tech) === 'string' ? (row.tech).normalize('NFC') : (row.tech)} 
                          onChange={e => row.setTech(e.target.value.normalize('NFC'))} 
                          className="w-full min-h-[50px] p-1 text-[11.5pt] focus:outline-none border-none resize-none font-serif leading-normal bg-transparent" 
                          placeholder="..." 
                        />
                      </td>
                      <td className="border border-black p-1">
                        <textarea 
                          value={typeof (row.replacement) === 'string' ? (row.replacement).normalize('NFC') : (row.replacement)} 
                          onChange={e => row.setReplacement(e.target.value.normalize('NFC'))} 
                          className="w-full min-h-[50px] p-1 text-[11.5pt] focus:outline-none border-none resize-none font-serif leading-normal bg-transparent" 
                          placeholder="..." 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 8. TÀI LIỆU KÈM THEO */}
            <div className="space-y-1.5 mb-6 text-[12pt] leading-relaxed">
              <div className="font-bold uppercase tracking-wider mb-1 text-[12pt]">- TÀI LIỆU KÈM THEO:</div>
              <div className="pl-4 space-y-1.5">
                <div>
                  - Lý lịch xe: <input type="text" value={typeof (profileQty) === 'string' ? (profileQty).normalize('NFC') : (profileQty)} onChange={e => setProfileQty(e.target.value.normalize('NFC'))} className="w-8 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent" /> Quyển (có đóng dấu của đơn vị sửa chữa).
                </div>
                <div>
                  - Phiếu kiểm tra hợp cách xuất xưởng số: <input type="text" value={typeof (kcsReportNo) === 'string' ? (kcsReportNo).normalize('NFC') : (kcsReportNo)} onChange={e => setKcsReportNo(e.target.value.normalize('NFC'))} className="w-20 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent" placeholder="........." /> /KCS ngày <input type="text" value={typeof (kcsDateDay) === 'string' ? (kcsDateDay).normalize('NFC') : (kcsDateDay)} onChange={e => setKcsDateDay(e.target.value.normalize('NFC'))} className="w-8 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent" placeholder="..." /> tháng <input type="text" value={typeof (kcsDateMonth) === 'string' ? (kcsDateMonth).normalize('NFC') : (kcsDateMonth)} onChange={e => setKcsDateMonth(e.target.value.normalize('NFC'))} className="w-8 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent" placeholder="..." /> năm <input type="text" value={typeof (kcsDateYear) === 'string' ? (kcsDateYear).normalize('NFC') : (kcsDateYear)} onChange={e => setKcsDateYear(e.target.value.normalize('NFC'))} className="w-12 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent" placeholder="..." />.
                </div>
                <div>
                  - Biên bản giao nhận xe - máy sau sửa chữa dã ngoại kỹ thuật.
                </div>
                <div>
                  - Phiếu xuất kho phụ tùng số: <input type="text" value={typeof (warehouseExportNo) === 'string' ? (warehouseExportNo).normalize('NFC') : (warehouseExportNo)} onChange={e => setWarehouseExportNo(e.target.value.normalize('NFC'))} className="w-20 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent" placeholder="........." /> ngày <input type="text" value={typeof (warehouseExportDay) === 'string' ? (warehouseExportDay).normalize('NFC') : (warehouseExportDay)} onChange={e => setWarehouseExportDay(e.target.value.normalize('NFC'))} className="w-8 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent" placeholder="..." /> tháng <input type="text" value={typeof (warehouseExportMonth) === 'string' ? (warehouseExportMonth).normalize('NFC') : (warehouseExportMonth)} onChange={e => setWarehouseExportMonth(e.target.value.normalize('NFC'))} className="w-8 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent" placeholder="..." /> năm <input type="text" value={typeof (warehouseExportYear) === 'string' ? (warehouseExportYear).normalize('NFC') : (warehouseExportYear)} onChange={e => setWarehouseExportYear(e.target.value.normalize('NFC'))} className="w-12 border-b border-dotted border-stone-600 text-center focus:outline-none bg-transparent" placeholder="..." />.
                </div>
              </div>
            </div>

            {/* 9. NHẬN XÉT CỦA ĐƠN VỊ SAU KHI NHẬN XE */}
            <div className="mb-8 text-[12pt]">
              <div className="font-bold uppercase tracking-wider mb-2 text-[12pt]">- NHẬN XÉT CỦA ĐƠN VỊ SAU KHI NHẬN XE:</div>
              <textarea
                value={typeof (unitFeedback) === 'string' ? (unitFeedback).normalize('NFC') : (unitFeedback)}
                onChange={e => setUnitFeedback(e.target.value.normalize('NFC'))}
                className="w-full h-20 border-b border-dotted border-stone-600 p-2 focus:outline-none resize-none font-serif text-[11.5pt] leading-relaxed bg-transparent"
                placeholder="Ý kiến đánh giá chạy thử dã ngoại và tình trạng kỹ thuật cụ thể của đơn vị thụ hưởng..."
              />
            </div>

            {/* 10. KHỐI CHỮ KÝ */}
            <div className="grid grid-cols-3 text-center text-[12pt] mt-12 gap-2" style={{ fontSize: '11pt' }}>
              <div>
                <p className="font-bold uppercase">NGƯỜI NHẬN</p>
                <p className="italic text-stone-500 font-normal text-[10pt] mt-1">(Ký, ghi rõ họ tên)</p>
                <div className="mt-20">
                  <input type="text" value={typeof (signReceiver) === 'string' ? (signReceiver).normalize('NFC') : (signReceiver)} onChange={e => setSignReceiver(e.target.value.normalize('NFC'))} className="w-11/12 border-b border-stone-300 text-center font-bold focus:outline-none bg-transparent" placeholder="Họ và tên..." />
                </div>
              </div>
              <div>
                <p className="font-bold uppercase">NGƯỜI GIAO</p>
                <p className="italic text-stone-500 font-normal text-[10pt] mt-1">(Ký, ghi rõ họ tên)</p>
                <div className="mt-20">
                  <input type="text" value={typeof (signGiver) === 'string' ? (signGiver).normalize('NFC') : (signGiver)} onChange={e => setSignGiver(e.target.value.normalize('NFC'))} className="w-11/12 border-b border-stone-300 text-center font-bold focus:outline-none bg-transparent" placeholder="Họ và tên..." />
                </div>
              </div>
              <div>
                <p className="font-bold uppercase">CHỈ HUY ĐƠN VỊ</p>
                <p className="italic text-stone-500 font-normal text-[10pt] mt-1">(Ký tên, đóng dấu)</p>
                <div className="mt-20">
                  <input type="text" value={typeof (signCommander) === 'string' ? (signCommander).normalize('NFC') : (signCommander)} onChange={e => setSignCommander(e.target.value.normalize('NFC'))} className="w-11/12 border-b border-stone-300 text-center font-bold focus:outline-none bg-transparent" placeholder="Thủ trưởng..." />
                </div>
              </div>
            </div>

          </div>
        </div>
    </div>
  );
}

export function PostRepairHandoverPrintView({ data }: { data: any }) {
  const fData = data?.formData || {};

  return (
    <div 
      className="bg-white p-12 shadow-md border border-stone-200 font-serif text-black mx-auto"
      style={{ 
        width: '100%', 
        maxWidth: '800px',
        minHeight: '297mm',
        fontFamily: '"Times New Roman", Times, serif',
        lineHeight: '1.4'
      }}
    >
      {/* 1. HEADER */}
      <div className="grid grid-cols-2 text-center items-start mb-6 pb-4 border-b border-stone-200" style={{ fontSize: '11pt' }}>
        <div>
          <div className="font-bold uppercase" style={{ fontSize: '11pt' }}>CỤC HẬU CẦN - KỸ THUẬT QUÂN ĐOÀN 34</div>
          <div className="font-bold uppercase underline" style={{ fontSize: '11pt' }}>TIỂU ĐOÀN SCTH30</div>
          <div className="mt-1" style={{ fontSize: '11pt' }}>Số: {fData.reportNo || '.......'} /BB-GN</div>
        </div>
        <div>
          <div className="font-bold uppercase" style={{ fontSize: '11pt' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div className="font-bold uppercase underline" style={{ fontSize: '11pt' }}>Độc lập - Tự do - Hạnh phúc</div>
          <div className="italic mt-2" style={{ fontSize: '10.5pt' }}>
            Gia Lai, ngày {fData.docDateDay || '...'} tháng {fData.docDateMonth || '...'} năm {fData.docDateYear || '2026'}
          </div>
        </div>
      </div>

      {/* 2. TIÊU ĐỀ */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="font-bold uppercase tracking-normal text-stone-950 font-serif" style={{ fontSize: '18pt' }}>
          BIÊN BẢN GIAO NHẬN XE-MÁY SAU SỬA CHỮA
        </h1>
        <div className="w-24 h-[1px] bg-stone-800 mx-auto mt-2"></div>
      </div>

      {/* 3. PHẦN CĂN CỨ */}
      <div className="space-y-1.5 mb-6 text-[12pt] text-justify leading-relaxed">
        <div>
          - Căn cứ lệnh sửa chữa số: <strong>{fData.commandNo || '.......'}</strong> ngày <strong>{fData.commandDate || '............'}</strong> của Cục Hậu cần - Kỹ thuật/QĐ34.
        </div>
        <div>
          - Căn cứ thông báo số: <strong>{fData.noticeNo || '.......'}</strong> ngày <strong>{fData.noticeDate || '............'}</strong> của Tiểu đoàn SCTH30/CHC-KT/QĐ34.
        </div>
        <div>
          - Hôm nay {fData.todayDate || 'ngày ... tháng ... năm ...'} tại Tiểu đoàn SCTH30/Cục HC-KT/QĐ34.
        </div>
      </div>

      {/* 4. ĐẠI DIỆN BÊN GIAO */}
      <div className="space-y-1 mb-3 text-[12pt]">
        <div className="font-bold">- Đại diện bên giao (Bên A): <span className="font-normal">Tiểu đoàn SCTH 30/Cục HC-KT/QĐ34.</span></div>
        <div className="pl-4 leading-relaxed">
          - Người giao: <strong>{fData.giverRep}</strong> — Cấp bậc: <strong>{fData.giverRank}</strong> — Chức vụ: <strong>{fData.giverPosition}</strong>
        </div>
      </div>

      {/* 5. ĐẠI DIỆN BÊN NHẬN */}
      <div className="space-y-1 mb-6 text-[12pt]">
        <div className="font-bold">- Đại diện bên nhận (Bên B): <span className="font-normal">{fData.receiverUnit}</span></div>
        <div className="pl-4 leading-relaxed">
          - Người nhận: <strong>{fData.receiverRep}</strong> — Cấp bậc: <strong>{fData.receiverRank}</strong> — Chức vụ: <strong>{fData.receiverPosition}</strong>
        </div>
      </div>

      {/* 6. THÔNG TIN XE */}
      <div className="space-y-2 mb-6 text-[12pt] text-justify leading-relaxed">
        <div>
          Đã tiến hành giao xe ô tô: <strong>{fData.vehicleName}</strong> — Kiểu xe: <strong>{fData.vehicleType}</strong> — Nhóm xe: <strong>{fData.vehicleGroup}</strong>
        </div>
        <div>
          Số đăng ký: <strong>{fData.plateNumber}</strong> — Số khung: <strong>{fData.chassisNumber}</strong> — Số máy: <strong>{fData.engineNumber}</strong>
        </div>
        <div>
          Ngày vào sửa chữa: <strong>{fData.dateIn}</strong> — Ngày sửa chữa xong: <strong>{fData.dateOut}</strong>
        </div>
        <div>
          Xe-máy được nghiệm thu tại Biên bản số: <strong>{fData.inspectionReportNo}</strong> ngày <strong>{fData.inspectionDate}</strong>
        </div>
        <div>
          Số km (giờ máy) chạy thử khi giao, nhận: <strong>{fData.testRunKm}</strong>
        </div>
      </div>

      {/* 7. BẢNG TÌNH TRẠNG KỸ THUẬT KHI GIAO, NHẬN */}
      <div className="mb-6">
        <div className="font-bold text-center uppercase tracking-wider mb-2 text-[12pt]">TÌNH TRẠNG KỸ THUẬT KHI GIAO, NHẬN</div>
        <table className="w-full border-collapse border border-black text-[11pt]">
          <thead>
            <tr className="text-center font-bold">
              <th className="border border-black w-8 py-1">TT</th>
              <th className="border border-black w-1/4 py-1">Tên cụm chi tiết</th>
              <th className="border border-black w-5/12 py-1">Tình trạng kỹ thuật và đồng bộ khi xuất xưởng</th>
              <th className="border border-black w-1/3 py-1">Các cụm chính, chi tiết cơ bản thay mới</th>
            </tr>
          </thead>
          <tbody>
            {[
              { idx: 1, label: 'Hệ thống động cơ', tech: fData.row1Tech, replacement: fData.row1New },
              { idx: 2, label: 'Hệ thống điện', tech: fData.row2Tech, replacement: fData.row2New },
              { idx: 3, label: 'Hệ thống gầm', tech: fData.row3Tech, replacement: fData.row3New },
              { idx: 4, label: 'Thân xe, thùng bệ', tech: fData.row4Tech, replacement: fData.row4New },
              { idx: 5, label: 'Đệm bạt', tech: fData.row5Tech, replacement: fData.row5New },
              { idx: 6, label: 'Săm, lốp, bình điện', tech: fData.row6Tech, replacement: fData.row6New },
              { idx: 7, label: 'Phần đặc chủng', tech: fData.row7Tech, replacement: fData.row7New },
              { idx: 8, label: 'Dụng cụ phụ kiện kèm theo', tech: fData.row8Tech, replacement: fData.row8New },
              { idx: 9, label: 'Phần sơn', tech: fData.row9Tech, replacement: fData.row9New },
            ].map(row => (
              <tr key={row.idx}>
                <td className="border border-black text-center py-1 font-bold">{row.idx}</td>
                <td className="border border-black px-2 py-1 font-bold text-center leading-tight bg-stone-50">{row.label}</td>
                <td className="border border-black p-2 text-justify whitespace-pre-wrap">{row.tech || '...'}</td>
                <td className="border border-black p-2 text-justify whitespace-pre-wrap">{row.replacement || '...'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 8. TÀI LIỆU KÈM THEO */}
      <div className="space-y-1.5 mb-6 text-[12pt] leading-relaxed">
        <div className="font-bold uppercase tracking-wider mb-1 text-[12pt]">- TÀI LIỆU KÈM THEO:</div>
        <div className="pl-4 space-y-1.5">
          <div>
            - Lý lịch xe: <strong>{fData.profileQty}</strong> Quyển (có đóng dấu của đơn vị sửa chữa).
          </div>
          <div>
            - Phiếu kiểm tra hợp cách xuất xưởng số: <strong>{fData.kcsReportNo}</strong> /KCS ngày {fData.kcsDateDay || '...'} tháng {fData.kcsDateMonth || '...'} năm {fData.kcsDateYear || '...'}.
          </div>
          <div>
            - Biên bản giao nhận xe - máy sau sửa chữa dã ngoại kỹ thuật.
          </div>
          <div>
            - Phiếu xuất kho phụ tùng số: <strong>{fData.warehouseExportNo}</strong> ngày {fData.warehouseExportDay || '...'} tháng {fData.warehouseExportMonth || '...'} năm {fData.warehouseExportYear || '...'}.
          </div>
        </div>
      </div>

      {/* 9. NHẬN XÉT CỦA ĐƠN VỊ SAU KHI NHẬN XE */}
      <div className="mb-8 text-[12pt] text-justify leading-relaxed">
        <div className="font-bold uppercase tracking-wider mb-2 text-[12pt]">- NHẬN XÉT CỦA ĐƠN VỊ SAU KHI NHẬN XE:</div>
        <p className="italic pl-4 whitespace-pre-wrap border-l-2 border-stone-300">{fData.unitFeedback || 'Không có ý kiến nhận xét bổ sung.'}</p>
      </div>

      {/* 10. KHỐI CHỮ KÝ */}
      <div className="grid grid-cols-3 text-center text-[12pt] mt-12 gap-2">
        <div>
          <p className="font-bold uppercase">NGƯỜI NHẬN</p>
          <p className="italic text-stone-500 text-[10pt] mt-1">(Ký, ghi rõ họ tên)</p>
          <p className="font-bold mt-20">{fData.signReceiver || '...................................'}</p>
        </div>
        <div>
          <p className="font-bold uppercase">NGƯỜI GIAO</p>
          <p className="italic text-stone-500 text-[10pt] mt-1">(Ký, ghi rõ họ tên)</p>
          <p className="font-bold mt-20">{fData.signGiver || '...................................'}</p>
        </div>
        <div>
          <p className="font-bold uppercase">CHỈ HUY ĐƠN VỊ</p>
          <p className="italic text-stone-500 text-[10pt] mt-1">(Ký tên, đóng dấu)</p>
          <p className="font-bold mt-20">{fData.signCommander || '...................................'}</p>
        </div>
      </div>
    </div>
  );
}
