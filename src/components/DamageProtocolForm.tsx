import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Printer, 
  FileText, 
  AlertTriangle 
} from 'lucide-react';
import { Vehicle, DamageProtocol, DamageItem } from '../types';
import { logger } from '../utils/logger';

interface DamageProtocolFormProps {
  vehicle: Vehicle | null;
  onCancel: () => void;
  onSave: (protocol: Omit<DamageProtocol, 'protocolId' | 'createdAt'>) => Promise<void>;
  initialProtocol?: DamageProtocol | null;
}

export const DamageProtocolForm: React.FC<DamageProtocolFormProps> = ({ 
  vehicle, 
  onCancel, 
  onSave,
  initialProtocol = null
}) => {
  // Form general state
  const [reportNumber, setReportNumber] = useState(initialProtocol?.reportNumber || '03/BB-SCTH30');
  const [createdDate, setCreatedDate] = useState(initialProtocol?.createdDate || new Date().toISOString().split('T')[0]);
  const [place, setPlace] = useState(initialProtocol?.place || 'Xưởng Sửa chữa Tổng hợp, Tiểu đoàn SCTH30');
  
  // Council and representatives
  const [representativeGeneral, setRepresentativeGeneral] = useState(initialProtocol?.representativeGeneral || 'Trung tá Lê Hồng Nam - Tiểu đoàn trưởng');
  const [representativeTechnical, setRepresentativeTechnical] = useState(initialProtocol?.representativeTechnical || 'Đại úy Đỗ Văn Minh - Trưởng ban Kỹ thuật');
  const [technician, setTechnician] = useState(initialProtocol?.technician || 'Thượng úy Trần Quốc Tuấn - Trưởng tổ kỹ thuật');
  const [driver, setDriver] = useState(
    initialProtocol?.driver || 
    (vehicle ? `Hạ sĩ Nguyễn Văn Hùng - Lái xe ${vehicle.brand}` : 'Hạ sĩ Nguyễn Văn Hùng - Lái xe')
  );
  
  // Vehicle Spec States
  const [plateNumber, setPlateNumber] = useState(initialProtocol?.plateNumber || vehicle?.plateNumber || '');
  const [brand, setBrand] = useState(initialProtocol?.brand || vehicle?.brand || '');
  const [vehicleType, setVehicleType] = useState(initialProtocol?.vehicleType || vehicle?.vehicleType || '');
  const [chassisNumber, setChassisNumber] = useState(initialProtocol?.chassisNumber || vehicle?.chassisNumber || '');
  const [engineNumber, setEngineNumber] = useState(initialProtocol?.engineNumber || vehicle?.engineNumber || '');
  const [odometer, setOdometer] = useState(initialProtocol?.odometer || '15,400 km');

  // Dynamic Item List State
  const [items, setItems] = useState<DamageItem[]>(
    initialProtocol?.items || [
      {
        id: "item-1",
        itemName: "Động cơ xe - Pít tông, xéc măng",
        damageDetail: "Pít tông số 3 cào xước vỏ lốc xi-lanh, xéc măng bị nứt gãy cơ học, tiếng gõ cò súp áp kêu to dội hầm máy",
        solution: "Đề nghị thay thế mới bộ pít tông + xéc măng tiêu chuẩn, xoáy lại xu-páp nạp thải cốt 1"
      },
      {
        id: "item-2",
        itemName: "Hệ thống điện - Bộ chia điện phụ",
        damageDetail: "Tiếp điểm má vít bị rỗ mòn đánh điện chập chờn, cuộn đánh lửa có điện áp tản mạn yếu",
        solution: "Đề nghị tháo kiểm tra gờ mút bôi trơn lại trục chia điện, thay mới má vít thứ cấp"
      }
    ]
  );

  // General conclusion
  const [conclusion, setConclusion] = useState(
    initialProtocol?.conclusion ||
    "Hội đồng kiểm tra kỹ thuật lập biên bản thống nhất xác nhận tình trạng hư hỏng của phương tiện nêu trên. Kiến nghị đưa xe vào kế hoạch sửa chữa vừa của Tiểu đoàn SCTH30 theo đúng cấp độ hư hỏng thực tế. Xin cấp phát đồng bộ vật tư thay thế."
  );

  // Flow controllers
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(!!initialProtocol);

  // Dynamic Row Operations
  const handleAddItem = () => {
    const newItemId = 'item-' + Math.random().toString(36).substring(2, 9);
    setItems(prev => [
      ...prev,
      {
        id: newItemId,
        itemName: '',
        damageDetail: '',
        solution: ''
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      logger.warn("Dữ liệu chưa đầy đủ.");
      return;
    }
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof Omit<DamageItem, 'id'>, value: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    // Validation
    if (!reportNumber.trim()) {
      setSaveError("Mã/Số hiệu biên bản không được bỏ trống.");
      return;
    }
    if (!plateNumber.trim()) {
      setSaveError("Biển số đăng ký phương tiện không được bỏ trống.");
      return;
    }
    if (items.some(item => !item.itemName.trim() || !item.damageDetail.trim())) {
      setSaveError("Tất cả các dòng danh mục hư hỏng phải điền đầy đủ thông tin tên và hiện trạng cụ thể.");
      return;
    }

    setIsSaving(true);
    try {
      const payload: Omit<DamageProtocol, 'protocolId' | 'createdAt'> = {
        vehicleId: vehicle?.vehicleId || plateNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
        reportNumber,
        createdDate,
        place,
        representativeGeneral,
        representativeTechnical,
        technician,
        driver,
        plateNumber,
        brand,
        vehicleType,
        chassisNumber,
        engineNumber,
        odometer,
        items,
        conclusion
      };

      await onSave(payload);
    } catch (err) {
      console.error(err);
      setSaveError("Gặp lối trong lúc lưu hồ sơ chi tiết. Hãy thử lại!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      
      {/* Header Accent Bar */}
      <div className="h-2 bg-yellow-500 w-full" />
      
      {/* Inner Controls Toolbar */}
      <div className="px-5 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-850" />
          <h3 className="font-bold text-stone-850 text-base md:text-lg font-sans">
            {isPreviewMode ? "XEM TRƯỚC BẢN IN QUÂN QUY" : "LẬP BIÊN BẢN CHI TIẾT HƯ HỎNG"}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
              isPreviewMode
                ? 'bg-stone-200 text-stone-800 border-stone-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {isPreviewMode ? "Quay lại soạn thảo" : "Xem trước trang in"}
          </button>
          
          {isPreviewMode && (
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>In Biên Bản</span>
            </button>
          )}

          <button
            onClick={onCancel}
            className="p-1 px-1.5 bg-stone-150 hover:bg-stone-200 text-stone-600 rounded-lg cursor-pointer text-xs"
            title="Hủy lập biên bản"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isPreviewMode ? (
        /* ==================== PRINT PREVIEW TEMPLATE ==================== */
        <div className="p-8 md:p-12 overflow-x-auto select-text font-serif bg-white" id="print-area">
          <div className="w-full max-w-4xl mx-auto text-black leading-normal text-sm space-y-8 print:p-0">
            
            {/* National Header & Unit */}
            <div className="grid grid-cols-2 gap-4 items-start text-center">
              <div>
                <span className="font-bold uppercase block text-xs md:text-sm">BỘ QUỐC PHÒNG</span>
                <span className="font-bold uppercase block text-xs md:text-sm tracking-wide">QUÂN ĐOÀN 34 - CỤC HẬU CẦN KỸ THUẬT</span>
                <span className="font-bold uppercase block text-xs text-stone-800">TIỂU ĐOÀN SCTH30</span>
                <div className="flex justify-center my-1.5">
                  <span className="border-t border-black w-24 block"></span>
                </div>
                <span className="text-[11px] font-sans block mt-1">Số: <strong className="underline font-serif">{reportNumber}</strong>/BB-SCTH30</span>
              </div>
              
              <div>
                <span className="font-bold uppercase block text-xs md:text-sm">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</span>
                <span className="font-bold block text-xs md:text-sm">Độc lập - Tự do - Hạnh phúc</span>
                <div className="flex justify-center my-1.5">
                  <span className="border-t border-black w-36 block"></span>
                </div>
                <span className="italic block text-xs">Địa danh, ngày {createdDate.split('-')[2]} tháng {createdDate.split('-')[1]} năm {createdDate.split('-')[0]}</span>
              </div>
            </div>

            {/* Title Document */}
            <div className="text-center space-y-2 pt-4">
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-wide">BIÊN BẢN CHI TIẾT HƯ HỎNG</h2>
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider">(V/v: Giám định chi tiết hư hỏng phương tiện kỹ thuật)</h3>
            </div>

            {/* Time and Representatives details */}
            <div className="space-y-2 mt-4 text-xs md:text-sm">
              <p>
                Hôm nay, ngày {createdDate.split('-')[2]} tháng {createdDate.split('-')[1]} năm {createdDate.split('-')[0]}, tại địa điểm: <strong className="border-b border-black md:px-2">{place}</strong>
              </p>
              <p className="font-bold italic">Chúng tôi gồm Hội đồng Giám định kỹ thuật gồm có:</p>
              <ul className="list-none pl-4 space-y-1.5">
                <li>1. Đồng chí: <strong className="border-b border-black px-2">{representativeGeneral}</strong></li>
                <li>2. Đồng chí: <strong className="border-b border-black px-2">{representativeTechnical}</strong></li>
                <li>3. Đồng chí: <strong className="border-b border-black px-2">{technician}</strong></li>
                <li>4. Đồng chí: <strong className="border-b border-black px-2">{driver}</strong> (Lái xe, trưởng xe chịu trách nhiệm bảo lưu xe)</li>
              </ul>
            </div>

            {/* Vehicle Profile Info */}
            <div className="space-y-3.5 mt-4">
              <p className="font-bold uppercase text-xs md:text-sm tracking-wide">I. THÔNG TIN PHƯƠNG TIỆN ĐỐI CHIẾU DANH BẢN:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-xs md:text-sm pl-4">
                <div>- Biển số đăng ký quân sự: <strong className="font-mono underline text-stone-900">{plateNumber}</strong></div>
                <div>- Nhãn hiệu phương tiện: <strong className="underline text-stone-900">{brand}</strong></div>
                <div>- Số khung (Chassis): <strong className="font-mono text-stone-900">{chassisNumber}</strong></div>
                <div>- Số máy (Engine): <strong className="font-mono text-stone-900">{engineNumber}</strong></div>
                <div>- Loại phương tiện: <strong className="underline text-stone-900">{vehicleType}</strong></div>
                <div>- Số Km đã chạy thực tế (Odometer): <strong className="underline text-stone-900">{odometer}</strong></div>
              </div>
            </div>

            {/* Technical Detail list of damages TABLE */}
            <div className="space-y-2">
              <p className="font-bold uppercase text-xs md:text-sm tracking-wide">II. DANH MỤC CỤ TRẰNG CHI TIẾT HƯ HỎNG VÀ ĐỀ XUẤT:</p>
              <table className="w-full border-collapse border border-black text-left text-xs md:text-sm">
                <thead>
                  <tr className="bg-stone-50 text-center">
                    <th className="border border-black p-2 font-bold w-12">STT</th>
                    <th className="border border-black p-2 font-bold w-1/4">Tên cụm, chi tiết hư hỏng</th>
                    <th className="border border-black p-2 font-bold w-2/5">Hiện trạng cụ thể hư hại kỹ thuật</th>
                    <th className="border border-black p-2 font-bold">Biện pháp khắc phục kiến nghị</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="border border-black p-2 text-center font-bold">{idx + 1}</td>
                      <td className="border border-black p-2 font-bold">{item.itemName}</td>
                      <td className="border border-black p-2 whitespace-pre-wrap">{item.damageDetail}</td>
                      <td className="border border-black p-2 italic">{item.solution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Council Conclusion */}
            <div className="space-y-2">
              <p className="font-bold uppercase text-xs md:text-sm tracking-wide">III. KẾT LUẬN CHUNG CỦA HỘI ĐỒNG GIÁM ĐỊNH:</p>
              <p className="pl-4 italic leading-relaxed text-justify text-xs md:text-sm border-l-2 border-stone-850 bg-stone-50/50 p-2.5 rounded">
                "{conclusion}"
              </p>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-3 gap-4 pt-8 text-center text-xs md:text-sm">
              <div>
                <span className="font-bold uppercase block">LÁI XE / TRƯỞNG XE</span>
                <span className="text-[11px] italic text-stone-600 block">(Ký, ghi rõ họ tên)</span>
                <div className="h-20"></div>
                <span className="font-bold underline block">{driver.includes('-') ? driver.split('-')[0].trim() : driver}</span>
              </div>
              
              <div>
                <span className="font-bold uppercase block">THỢ SỬA PHỤ TRÁCH</span>
                <span className="text-[11px] italic text-stone-600 block">(Ký, ghi rõ họ tên)</span>
                <div className="h-20"></div>
                <span className="font-bold underline block">{technician.includes('-') ? technician.split('-')[0].trim() : technician}</span>
              </div>

              <div>
                <span className="font-bold uppercase block">ĐẠI DIỆN HỘI ĐỒNG</span>
                <span className="text-[11px] italic text-stone-600 block">(Ký, đóng dấu chỉ huy)</span>
                <div className="h-20"></div>
                <span className="font-bold underline block">{representativeGeneral.includes('-') ? representativeGeneral.split('-')[0].trim() : representativeGeneral}</span>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ==================== SOẠN THẢO/EDIT FORM ==================== */
        <form onSubmit={handleFormSubmit} className="p-5 md:p-6 space-y-6">
          
          {saveError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Section 1: Official Header Meta */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-150 space-y-4">
            <h4 className="text-xs font-bold text-stone-600 uppercase tracking-widest border-b border-stone-200 pb-1.5 font-sans">
              Thông tin hành chính quân sự
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Mã/Số hiệu biên bản</label>
                <input
                  type="text"
                  value={reportNumber}
                  onChange={(e) => setReportNumber(e.target.value)}
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-lg text-sm text-stone-850 font-mono"
                  placeholder="ví dụ: 03/BB-SCTH30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Ngày lập văn bản</label>
                <input
                  type="date"
                  value={createdDate}
                  onChange={(e) => setCreatedDate(e.target.value)}
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-lg text-sm text-stone-850 font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Địa điểm thiết lập</label>
                <input
                  type="text"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-lg text-sm text-stone-850 font-sans"
                  placeholder="ví dụ: Tiểu đoàn SCTH30"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Council Members */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-4">
            <h4 className="text-xs font-bold text-stone-600 uppercase tracking-widest border-b border-stone-150 pb-1.5 font-sans">
              Thành viên hội đồng giám định kỹ thuật
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Đại diện Ban Chỉ huy / Trạm trưởng</label>
                <input
                  type="text"
                  value={representativeGeneral}
                  onChange={(e) => setRepresentativeGeneral(e.target.value)}
                  className="w-full bg-stone-50 focus:bg-white border border-stone-300 p-2.5 rounded-lg text-sm text-stone-850 transition-colors"
                  placeholder="ví dụ: Trung tá Lê Hồng Nam - Tiểu đoàn trưởng"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Đại diện Ban Hậu cần-Kỹ thuật</label>
                <input
                  type="text"
                  value={representativeTechnical}
                  onChange={(e) => setRepresentativeTechnical(e.target.value)}
                  className="w-full bg-stone-50 focus:bg-white border border-stone-300 p-2.5 rounded-lg text-sm text-stone-850 transition-colors"
                  placeholder="ví dụ: Đại úy Đỗ Văn Minh - Trưởng ban"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Thợ kỹ thuật sửa chính phụ trách</label>
                <input
                  type="text"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full bg-stone-50 focus:bg-white border border-stone-300 p-2.5 rounded-lg text-sm text-stone-850 transition-colors"
                  placeholder="ví dụ: Thượng úy Trần Quốc Tuấn - Trưởng tổ kỹ thuật"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Lái xe / Trưởng xe phụ trách thiết bị</label>
                <input
                  type="text"
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  className="w-full bg-stone-50 focus:bg-white border border-stone-300 p-2.5 rounded-lg text-sm text-stone-850 transition-colors"
                  placeholder="ví dụ: Thiếu úy Nguyễn Văn Hùng - Lái xe"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Vehicle Information Overlay */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-150 space-y-4">
            <h4 className="text-xs font-bold text-stone-600 uppercase tracking-widest border-b border-stone-200 pb-1.5 font-sans">
              Thông số kỹ thuật định dạng phương tiện
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Số đăng ký xe (Biển số)</label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-lg text-sm text-stone-800 font-mono uppercase"
                  placeholder="Biển số quân sự"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Nhãn hiệu (Hãng xe)</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-lg text-sm text-stone-800 font-sans"
                  placeholder="ví dụ: Ural-4320"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Dòng/Loại xe quân sự</label>
                <input
                  type="text"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-lg text-sm text-stone-800 font-sans"
                  placeholder="ví dụ: Xe tải chở quân"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Số khung xe</label>
                <input
                  type="text"
                  value={chassisNumber}
                  onChange={(e) => setChassisNumber(e.target.value)}
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-lg text-sm text-stone-805 font-mono"
                  placeholder="Chassis number"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Số máy động cơ</label>
                <input
                  type="text"
                  value={engineNumber}
                  onChange={(e) => setEngineNumber(e.target.value)}
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-lg text-sm text-stone-805 font-mono"
                  placeholder="Engine number"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Số Km đã chạy (Odometer)</label>
                <input
                  type="text"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-lg text-sm text-stone-805 font-sans"
                  placeholder="ví dụ: 15,200 km"
                />
              </div>
            </div>
          </div>

          {/* Section 4: DAMAGE ITEMS (DYNAMIC TABLE INPUTS) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2 flex-wrap gap-2">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-widest font-sans flex items-center gap-1.5">
                Danh mục chi tiết hư hỏng hiện hữu
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Thêm dòng hư hỏng</span>
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div 
                  key={item.id} 
                  className="p-4 bg-stone-50 border border-stone-200 rounded-xl relative group space-y-3"
                >
                  {/* Delete button top-right */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute top-3 right-3 p-1.5 bg-white hover:bg-red-50 text-stone-400 hover:text-red-650 border border-stone-250 rounded-lg transition-colors cursor-pointer"
                    title="Xóa hạng mục này"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-5 w-5 rounded-full bg-stone-300 text-stone-800 text-[11px] font-bold flex items-center justify-center font-mono">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-stone-700 font-sans">Chi tiết hư hại</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-4">
                      <label className="block text-[11px] font-semibold text-stone-500 mb-1 uppercase tracking-wider">
                        Tên cụm / Chi tiết hỏng hóc
                      </label>
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
                        placeholder="Ví dụ: Động cơ - lốc pít tông"
                        className="w-full bg-white border border-stone-300 p-2 rounded-lg text-sm text-stone-800"
                        required
                      />
                    </div>
                    
                    <div className="lg:col-span-5">
                      <label className="block text-[11px] font-semibold text-stone-500 mb-1 uppercase tracking-wider">
                        Hiện trạng hư hỏng thật cụ thể, chi tiết
                      </label>
                      <textarea
                        rows={2}
                        value={item.damageDetail}
                        onChange={(e) => handleItemChange(item.id, 'damageDetail', e.target.value)}
                        placeholder="Ví dụ: Hư hỏng pít tông, xéc măng gãy, tiếng cò mổ kêu to..."
                        className="w-full bg-white border border-stone-300 p-2 rounded-lg text-sm text-stone-800 font-sans leading-relaxed"
                        required
                      />
                    </div>

                    <div className="lg:col-span-3 pr-8">
                      <label className="block text-[11px] font-semibold text-stone-500 mb-1 uppercase tracking-wider">
                        Đề xuất xử lý phục hồi
                      </label>
                      <input
                        type="text"
                        value={item.solution}
                        onChange={(e) => handleItemChange(item.id, 'solution', e.target.value)}
                        placeholder="Ví dụ: Thay mới pít tông, vệ sinh..."
                        className="w-full bg-white border border-stone-300 p-2 rounded-lg text-sm text-stone-800"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Conclusion */}
          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider font-sans">
              III. Kết luận chung của Hội đồng kỹ thuật
            </label>
            <textarea
              rows={4}
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              placeholder="Ý kiến chung và phê nghị giải quyết khắc phục sự cố phương hại của Hội đồng kỹ thuật..."
              className="w-full bg-stone-50 focus:bg-white border border-stone-300 p-3 rounded-lg text-sm text-stone-800 font-sans leading-relaxed resize-none"
            />
          </div>

          {/* Footer Submit Bar */}
          <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-stone-150 hover:bg-stone-200 text-stone-750 font-bold rounded-xl transition-all font-sans text-sm cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-950 text-white font-bold rounded-xl transition-all font-sans text-xs md:text-sm shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Đang lưu thông tin...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Lưu Biên Bản</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
