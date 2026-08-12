import { normalizeNFC } from '../utils/stringUtils';
import { canEditDocument } from '../services/ownershipService';
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, FileDown, Printer, Plus } from 'lucide-react';
import { Vehicle } from '../types';
import { getCurrentUserSession } from '../services/dbService';
import { DataService } from '../firebase';
import { AutoResizeTextarea } from './AutoResizeTextarea';

interface Props {
  targetSessionId?: string;
  vehicle?: Vehicle | null;
  existingFormId?: string;
  templateName?: string;
  stageName?: string;
  templateType?: string;
  onSaved?: (payload?: any) => void;
  onClose: () => void;
  initialData?: any;
}

const ITEMS: any[] = [
  { category: 'I. Chuẩn bị', stt: 1, noiDung: 'Nhận các cụm, bộ phận chi tiết đã sửa chữa xong ở các tổ chuyên sửa chữa. Các chi tiết còn dùng cũ ở tổ chuẩn bị. Các chi tiết thay mới ở kho', yeuCau: 'Tất cả các cụm, các chi tiết có dấu của KCS xác nhận và dựa theo phiếu sổ dự toán của KCS' },
  { category: 'I. Chuẩn bị', stt: 2, noiDung: 'Đưa các chi tiết cụm về vị trí tập kết chờ tổng lắp xe', yeuCau: 'Đưa dần từng cụm, bộ phận lắp đến đâu nhận đến đó' },
  { category: 'I. Chuẩn bị', stt: 3, noiDung: 'Chuẩn bị đồ nghề cho tổng lắp xe. Dọn vị trí đặt khung xe cho tổng lắp', yeuCau: 'Vị trí tổng lắp theo quy định' },
  
  { category: 'II. Tổng lắp xe', stt: 1, noiDung: 'Đặt ngửa khung sát si đã sửa chữa xong lên 2 mễ kê xe', yeuCau: 'Mễ kê sát si chắc chắn' },
  { category: 'II. Tổng lắp xe', stt: 2, noiDung: 'Lắp đủ các bạc cao su vào các mõ nhíp cái', yeuCau: 'Bạc cao su mới' },
  { category: 'II. Tổng lắp xe', stt: 3, noiDung: 'Lắp 4 bộ nhíp vào khung xe', yeuCau: 'Lắp đúng vị trí mõ nhíp trước sau, đai ốc chốt nhíp có đủ đệm vênh' },
  { category: 'II. Tổng lắp xe', stt: 4, noiDung: 'Lắp cụm cầu trước vào 2 bộ nhíp trước. Lắp chốt rốn nhíp. Lắp đủ 2 tấm đế nhíp trên lắp ốp nhíp vào thân cầu trước. Luồn 2 quang nhíp liên kết cầu nhíp. Xiết bulông quang nhíp', yeuCau: 'Nhíp có đủ mỡ bôi. Bulông quang nhíp có đủ đệm vênh. Mô men M = 15 - 17 kgm' },
  { category: 'II. Tổng lắp xe', stt: 5, noiDung: 'Lắp cụm cầu sau vào 2 bó nhíp sau. Lắp chốt rốn nhíp. Lắp đủ 2 tấm đế nhíp trên lắp ốp nhíp vào thân cầu sau. Luồn 2 quang nhíp liên kết cầu nhíp. Xiết bulông quang nhíp', yeuCau: 'Nhíp có đủ mỡ bôi. Bulông quang nhíp có đủ đệm vênh. Mômen xiết M = 15 - 17 kgm' },
  { category: 'II. Tổng lắp xe', stt: 6, noiDung: 'Lắp đủ 4 ống giảm xóc cho 2 cầu xe. Lắp trước 4 bạc cao su côn vào 2 lỗ đầu ống. Lắp ống giảm xóc vào chốt ở cầu xe và khung xe', yeuCau: 'Đủ bạc cao su, vòng đệm chặn 2 đầu mỗi ống giảm xóc. Xiết chặt đai ốc, chốt có đủ đệm vênh.' },
  { category: 'II. Tổng lắp xe', stt: 7, noiDung: 'Lật sấp khung xe cho thuận chiều trên 2 mễ kê xe', yeuCau: 'Mễ kê chắc chắn an toàn' },
  { category: 'II. Tổng lắp xe', stt: 8, noiDung: 'Lắp toàn bộ đường dầu phanh chạy dọc khung, dọc thân cầu xe. Uốn theo dạng lượn chạy dọc khung xe, cầu xe. Bắt kẹp giữa đường ống', yeuCau: 'Các đường ống phải được kẹp giữ bằng đai ở thân khung, thân cầu xe, bảo đảm khi xe hoạt động không bị vướng' },
  { category: 'II. Tổng lắp xe', stt: 9, noiDung: 'Lắp thùng xăng: lắp đai thùng xăng, giá treo thùng xăng, xiết chặt đai treo', yeuCau: 'Đai giữ thùng xăng đều phải có lót dải cao su, xiết chặt bulông nút. Thùng xăng treo chắc chắn' },
  { category: 'II. Tổng lắp xe', stt: 10, noiDung: 'Lắp bầu lọc xăng ở khung xe, lắp toàn bộ đường ống dẫn xăng. Uốn đường xăng gọn ở vị trí ống chuyển hướng', yeuCau: 'Vị trí uốn cáo R hợp lý. Không làm gãy, nứt ống dẫn xăng' },
  { category: 'II. Tổng lắp xe', stt: 11, noiDung: 'Lắp 04 bánh xe vào moay ơ các cầu trước, sau. Lắp bơm đủ hơi. Gá lắp 2 lốp trước. Gá lắp 2 lốp sau. Bắt đầu tuyô dầu phanh vào bơm con, bơm cụt 4 bánh xe', yeuCau: 'Các đau ốc bulông có ren trơn nhẹ. Xiết tăng dần theo thứ tự đối xứng cho đến đủ cân M = 15 - 17 kgm. Quay thử các bánh xe, thấy trơn nhẹ là được' },
  { category: 'II. Tổng lắp xe', stt: 12, noiDung: 'Cẩu lắp động cơ lên khung xe. Kê gỗ đầu cuôi bưởng ly hợp. Cẩu nhấc đặt động cơ lên đúng vị trí của giá bắt động cơ', yeuCau: 'Có 2 người, đặt đúng vị trí chân trước và gỗ kê phía sau' },
  { category: 'II. Tổng lắp xe', stt: 13, noiDung: 'Lắp hoàn chỉnh các tuyô xăng liên kết từ bình xăng chính, bầu lọc. Bơm xăng động cơ', yeuCau: 'Đảm bảo tẩu nối kín đường xăng kín, không nứt hở' },
  { category: 'II. Tổng lắp xe', stt: 14, noiDung: 'Cẩu lắp hộp sô chính lên xe. Đặt đệm cao su vào vị trí để kê hộp số. Cẩu đặt hộp số lên khung xe', yeuCau: 'Cao su lót đệm mới, xiết bulông đủ chặt, có đệm vênh hãm, hoặc bằng chốt chẻ. Trục acơ hộp số vào rãnh then hoa các đĩa ma sát' },
  { category: 'II. Tổng lắp xe', stt: 15, noiDung: 'Cẩu lắp hộp số phụ lên khung xe. Đặt đệm cao su vào vị trí lắp. Cẩu đặt hộp số lên 4 đệm cao su. Luồn 4 bulông xiết chặt', yeuCau: 'Cao su đệm mới, hãm chốt chẻ' },
  { category: 'II. Tổng lắp xe', stt: 16, noiDung: 'Lắp các đăng ngắn giữ HSC và HSP', yeuCau: 'Lắp đúng chiều nạng các đăng, 04 bulông M 10 có đủ đệm xiết chặt với M = 7kgm' },
  { category: 'II. Tổng lắp xe', stt: 17, noiDung: 'Lắp trục các đăng từ HSP đi cầu sau. Lắp cụm phanh tay vào hộp số. Lắp các đăng vào bích phanh tay', yeuCau: 'Xoay đúng chiều nạng các đăng, 8 bulông có đệm vênh M = 7 kgm' },
  { category: 'II. Tổng lắp xe', stt: 18, noiDung: 'Lắp trục các đăng từ HSP đi cầu trước', yeuCau: 'Xoay đúng chiều nạng các đăng, 8 bulông có đệm vênh M = 7 kgm' },
  { category: 'II. Tổng lắp xe', stt: 19, noiDung: 'Lắp 2 móc kéo trước và chắn đòn trước vào khung xe', yeuCau: 'Các bulông có đệm vênh xiết chặt M = 7.5 - 8 kgm' },
  { category: 'II. Tổng lắp xe', stt: 20, noiDung: 'Lắp hộp tay lái vào khung xe', yeuCau: 'Lắp đúng vị trí có đủ đệm vênh xiết chặt' },
  { category: 'II. Tổng lắp xe', stt: 21, noiDung: 'Lắp két nước vào khung xe. Lắp đủ các đệm cao su chân két nước. Xiết chặt bulông chân két nước. Lắp chặt các đường ống cao su nước ra, vào động cơ', yeuCau: 'Có đủ đệm cao su mới. Ống cao su dẫn nước mới, có đai xiết ống nước chắc chắn' },
  { category: 'II. Tổng lắp xe', stt: 22, noiDung: 'Lắp vành tôn hướng gió vào két nước của quạt gió động cơ', yeuCau: 'Quay cánh quạt gió động cơ không vướng chạm hứng gió' },
  { category: 'II. Tổng lắp xe', stt: 23, noiDung: 'Lắp cụm ba ngang chuyển hướng trước', yeuCau: '2 bánh trước hướng thẳng, điều chỉnh độ dài chuyển hướng và hãm chắc' },
  { category: 'II. Tổng lắp xe', stt: 24, noiDung: 'Lắp vilet với cụm chuyển hướng trước', yeuCau: 'Chia tay lái ăn đều 2 phía trái phải' },
  { category: 'II. Tổng lắp xe', stt: 25, noiDung: 'Lắp càng cua của ly hợp, lắp cam dẫn động ly hợp, lắp bơm dầu ly hợp', yeuCau: 'Đặt càng cua vào khớp, điều chỉnh thanh dẫn động ly hợp cho hợp lý' },
  { category: 'II. Tổng lắp xe', stt: 26, noiDung: 'Lắp bệ xe lên khung xe: đặt đủ các đệm cao su sàn xe ở 12 bulông sàn. Dùng cẩu chuyển 2 tấn móc cẩu bệ xe lên khung, điều chỉnh bệ xe cho trùng lỗ bệ xe và lỗ ở tai khung. Cho đủ 12 bulông M12 vào lỗ bệ xe, bắt gá bệ xe vào khung xe', yeuCau: 'Các đệm sàn xe mới, móc cẩu bệ chuyên dùng (không làm vênh méo bệ xe). Bắt đầu gá đai ốc. Bệ xe chưa bắt chặt' },
  { category: 'II. Tổng lắp xe', stt: 27, noiDung: 'Bắt bầu lọc gió. Bắt thanh giữ đai bầu lọc gió. Bắt các ống vào nắp bầu lọc', yeuCau: 'Bình lọc có đủ ruột lọc. Đường ống kín' },
  { category: 'II. Tổng lắp xe', stt: 28, noiDung: 'Bắt tổng bơm côn phanh vào bệ xe. Bắt thân tổng bơm. Bắt các rắc co đường ống vào thân bơm', yeuCau: 'Thân bơm bắt chắc chắn' },
  { category: 'II. Tổng lắp xe', stt: 29, noiDung: 'Bắt cụm dẫn động ga. Dây ga gió', yeuCau: 'Các cụm dẫn ga, dây ga gió phải hoạt động nhẹ nhàng' },
  { category: 'II. Tổng lắp xe', stt: 30, noiDung: 'Bắt 2 cánh gà buồng máy cửa xe', yeuCau: 'Bắt đúng vị trí và chắc chắn' },
  { category: 'II. Tổng lắp xe', stt: 31, noiDung: 'Bắt 2 chắn bùn trước xe', yeuCau: 'Bắt đủ bulông, đệm vênh' },
  { category: 'II. Tổng lắp xe', stt: 32, noiDung: 'Lắp phần điện nổ cho xe. Lắp khoá điện nổ. Lắp tiết chế, tăng điện trên cho thân xe', yeuCau: 'Lắp trước khi sơn để đi thử xe' },
  { category: 'II. Tổng lắp xe', stt: 33, noiDung: 'Lắp bình điện, nối cáp mát, cáp lửa với khởi động', yeuCau: 'Bình điện mới, nạp đủ, cáp điện có đủ đầu bọp' },
  { category: 'II. Tổng lắp xe', stt: 34, noiDung: 'Lắp trục tay quay láo, lắp ty dẫn trục tay quay lái, lắp ống dẫn tay lái', yeuCau: 'Can đuya vào khít, xiết chặt tay lái, có đệm vênh' },
  { category: 'II. Tổng lắp xe', stt: 35, noiDung: 'Lắp vô lăng tay lái.', yeuCau: 'Lắp đúng vị trí, không làm vỡ hỏng vô lăng' },
  { category: 'II. Tổng lắp xe', stt: 36, noiDung: 'Lắp bình xăng phụ. Lắp khoá 3 chạc. lắp nối đường ống xăng, khoá xăng', yeuCau: 'Cố định chắc chắn' },
  { category: 'II. Tổng lắp xe', stt: 37, noiDung: 'Lắp calăng với thân xe', yeuCau: 'Bắt chắc, ngay ngắn' },
  { category: 'II. Tổng lắp xe', stt: 38, noiDung: 'Lắp bàn đạp côn phanh: lắp bàn đạp côn. lắp bàn đạp phanh, hiệu chỉnh hành trình tự do bàn đạp côn phanh', yeuCau: 'Có đệm, có chốt chẻ chắc chắn, có lò xo tự nhả nhẹ nhàng' },
  { category: 'II. Tổng lắp xe', stt: 39, noiDung: 'Lắp cụm dây kéo phanh tay. Lắp cụm dây kéo dây phanh. Điều chỉnh khe hở má phanh', yeuCau: 'Dây mới, đủ tiêu chuẩn' },
  { category: 'II. Tổng lắp xe', stt: 40, noiDung: 'Lắp cabô buồng máy', yeuCau: 'Capô nắp đậy kín khít' },
  { category: 'II. Tổng lắp xe', stt: 41, noiDung: 'Lắp bảng đồng hồ điện trên xe. Lắp còi xe', yeuCau: 'Các động cơ đã được sửa chữa' },
  { category: 'II. Tổng lắp xe', stt: 42, noiDung: 'Lắp kính chắn gió, đặt khung kính, điều chỉnh bắt bulông bản lề kính', yeuCau: 'Bắt chắc chắn, kiểm tra khung kính, không được xê dịch' },
  { category: 'II. Tổng lắp xe', stt: 43, noiDung: 'Lắp 2 ghế chính phụ', yeuCau: 'Có thể tận dụng đệm tựa cũ để thử xe' },
  { category: 'II. Tổng lắp xe', stt: 44, noiDung: 'Điều chỉnh kiểm tra lại hệ thống phối khí của động cơ. Quay maniven và điều chỉnh từng máy', yeuCau: 'Kiểm tra thời điểm đánh lửa và khe hở supáp' },
  { category: 'II. Tổng lắp xe', stt: 45, noiDung: 'Đổ xăng dầu, nước theo quy định vào động cơ', yeuCau: 'Dầu mới BP = 5.8 lít, nước sạch đổ đầy két nước' },
  { category: 'II. Tổng lắp xe', stt: 46, noiDung: 'Nổ máy tại chỗ. Nổ máy kiểm tra các thông số trên đồng hồ', yeuCau: 'Theo quy định của tiêu chuẩn kỹ thuật' },
  { category: 'II. Tổng lắp xe', stt: 47, noiDung: 'Xả e và điều chỉnh guốc phanh chân', yeuCau: 'Khe hở guốc với tang trống: 0.15 - 0.25' },
  { category: 'II. Tổng lắp xe', stt: 48, noiDung: 'Nổ máy tại chỗ, kiểm tra: Đạp côn, đi thử các số, đạp phanh, kiểm tra độ bám má phanh', yeuCau: 'Tổ trưởng kiểm tra xe tại chỗ' }
];

const getInspectionItems = (type?: string) => {
  return ITEMS;
};

export const PhieuTongLapTrangBiKyThuatForm: React.FC<Props> = ({ vehicle, existingFormId, targetSessionId, templateName, stageName, templateType, initialData, onSaved, onClose }) => {
  const [zoom, setZoom] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 800) {
      return Math.max(30, Math.floor((window.innerWidth) / 7.94));
    }
    return 100;
  });
  const printRef = useRef<HTMLDivElement>(null);
  
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);
  const [showVehicleSelect, setShowVehicleSelect] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicle?.vehicleId || '');

  const [formData, setFormData] = useState<any>(() => {
    const defaultItems = getInspectionItems(templateType);
    const nowStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    return {
      vehicleName: vehicle?.brand || '',
      vehicleNumber: vehicle?.plateNumber || '',
      xxNumber1: '',
      stageNumber: '',
      xxNumber2: '',
      sheetNumber: '',
      tenTBKT: vehicle?.brand || '',
      soHieu: vehicle?.plateNumber || '',
      soXX: '',
      cumCongDoan: 'Sửa chữa chi tiết, linh kiện của cụm động cơ',
      toSo: '1',
      soTo: '9',
      soPhieu: '',
      items: defaultItems.map((item: any) => ({ ...item, actual: '', evaluation: '', notes: '' })),
      conclusion: '',
      ketLuan: 'Các chi tiết, linh kiện cụm động cơ đã được sửa chữa đúng Quy trình công nghệ.',
      ngayLap: `Ngày ${new Date().getDate().toString().padStart(2, '0')} tháng ${(new Date().getMonth() + 1).toString().padStart(2, '0')} năm ${new Date().getFullYear()}`,
      toTruong: '',
      daiDoiTruong: '',
      nhanVienKCS: '',
      chiHuyTieuDoan: '',
      status: 'DRAFT',
      createdAt: nowStr,
      updatedAt: nowStr,
      completedAt: null,
      approvedAt: null,
      updatedBy: ''
    };
  });

  const resolvedTemplateName = templateName || 'PHIẾU SỬA CHỮA';
  const resolvedStageName = stageName || 'Sửa chữa chi tiết, linh kiện của cụm động cơ';

  const [docId, setDocId] = useState(() => {
    if (existingFormId) return existingFormId;
    const baseId = vehicle ? `GDR_${vehicle.vehicleId}_${Date.now()}` : `GDR_${Date.now()}`;
    return baseId.replace(/[^a-zA-Z0-9_\-]/g, '_');
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
      const targetType = templateType || 'ENGINE_COMPONENT_REPAIR';
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
        }
      }

      if (foundDoc) {
        if (foundDoc.formData) {
          setFormData({
            ...foundDoc.formData,
            originalStatus: foundDoc.formData.status || 'DRAFT'
          });
        }
        if (foundDoc.id && foundDoc.id !== docId) {
          setDocId(foundDoc.id);
        }
      } else {
        if (!existingFormId) {
          try {
            const defaultItems = typeof getInspectionItems === 'function' ? getInspectionItems(templateType) : [];
            setFormData({
              vehicleName: vehicle?.brand || '',
              vehicleNumber: vehicle?.plateNumber || '',
              items: defaultItems.map((item: any) => ({ ...item, actual: '' }))
            });
          } catch(e) {}
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
      } catch (err) {}

      if (existingDoc && currentUser && !canEditDocument(currentUser, existingDoc)) {
        alert('Bạn chỉ có quyền xem dữ liệu.');
        return;
      }

      const payload = {
        repairSessionId: targetSessionId || (docExists ? existingDoc?.repairSessionId : null),
        id: docId,
        vehicleId: formVehicleId,
        templateType: templateType || 'ENGINE_COMPONENT_REPAIR',
        templateName: docExists && existingDoc?.templateName ? existingDoc.templateName : resolvedTemplateName,
        stageName: docExists && existingDoc?.stageName ? existingDoc.stageName : resolvedStageName,
        formData: {
          ...formData,
          tongGioCong: (formData.items || []).reduce((sum: number, item: any) => sum + (parseFloat(item.gioCong) || 0), 0),
          updatedBy: currentUser?.fullName || currentUser?.username || 'unknown',
          updatedAt: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
          originalStatus: formData.status || 'DRAFT'
        },
        isDeleted: false,
        createdBy: docExists && existingDoc?.createdBy ? existingDoc.createdBy : (currentUser?.uid || currentUser?.username || 'unknown'),
        createdByName: docExists && existingDoc?.createdByName ? existingDoc.createdByName : (currentUser?.fullName || 'unknown'),
        createdAt: docExists && existingDoc?.createdAt ? existingDoc.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (docExists) {
        await DataService.update('repairForms', docId, normalizeNFC(payload));
      } else {
        await DataService.save('repairForms', normalizeNFC(payload));
      }
      
      // Update local storage cache
      const targetType = templateType || 'ENGINE_COMPONENT_REPAIR';
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
      
      setFormData(payload.formData);

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

      console.log('Đã lưu phiếu sửa chữa tổng tháo.');
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
      confirmed = window.confirm('Bạn có chắc chắn muốn xóa phiếu này?');
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
        await DataService.update('repairForms', docId, normalizeNFC(updatePayload));
      } catch (err) {
        console.warn('Could not update firebase for delete:', err);
      }
      
      // Update local storage
      const targetType = templateType || 'ENGINE_COMPONENT_REPAIR';
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
      
      console.log('Đã xóa phiếu (vào thùng rác).');
      if (onSaved) onSaved(); // call without payload to trigger refresh
      onClose();
    } catch (err) {
      console.error('Không thể xóa dữ liệu.', err);
    }
  };

  const currentUser = getCurrentUserSession();
  const currentUserRole = currentUser?.role;
  const isAdmin = currentUserRole === "admin";
  const isLocked = formData.originalStatus === 'APPROVED';

  const tongGioCong = formData.items?.reduce((sum: number, item: any) => sum + (parseFloat(item.gioCong) || 0), 0) || 0;
  const vatTuList = formData.items?.map((i: any) => i.vatTu?.trim()).filter((v: string) => v && v.length > 0) || [];

  const handlePrint = () => {
    window.print();
  };

  
  const handleExportPDF = () => {
    const originalTitle = document.title;
    document.title = `PhieuTongThao_${formData?.soPhieu || '0'}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-100/90 backdrop-blur-sm overflow-hidden print:bg-white print:static print:h-auto print:overflow-visible">
      
      {/* Header controls */}
      <div className="bg-white border-b border-stone-200 px-2 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-between shrink-0 print:hidden gap-3 sm:gap-0">
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500 hover:text-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-stone-200 hidden sm:block"></div>
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="px-2 py-1 hover:bg-white rounded text-sm text-stone-600 font-medium">-</button>
            <span className="text-sm font-mono text-stone-600 w-12 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="px-2 py-1 hover:bg-white rounded text-sm text-stone-600 font-medium">+</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
          <button 
            id="delete-button-selector"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isLocked && !isAdmin}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${
              isLocked && !isAdmin ? 'text-stone-400 border-stone-200 cursor-not-allowed hidden' : 'text-red-600 hover:bg-red-50 border-red-200'
            }`}
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
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Xuất PDF
          </button>
          
          <select 
            value={typeof (formData.status || 'DRAFT') === 'string' ? (formData.status || 'DRAFT').normalize('NFC') : (formData.status || 'DRAFT')}
            onChange={(e) => setFormData({ 
              ...formData, 
              status: e.target.value.normalize('NFC'),
              completedAt: e.target.value.normalize('NFC') === 'COMPLETED' ? new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : (formData.completedAt || null),
              approvedAt: e.target.value.normalize('NFC') === 'APPROVED' ? new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : (formData.approvedAt || null),
             })}
            disabled={isLocked && !isAdmin}
            className={`px-3 py-2 text-sm font-medium rounded-lg border outline-none ${
              formData.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              formData.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              formData.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-stone-50 text-stone-700 border-stone-200'
            }`}
          >
            <option value="DRAFT">Nháp</option>
            <option value="IN_PROGRESS">Đang thực hiện</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="APPROVED">Đã nghiệm thu</option>
          </select>

          <button 
            onClick={handleSave}
            disabled={isLocked && !isAdmin}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${
              isLocked && !isAdmin ? 'bg-stone-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Save className="w-4 h-4" />
            Lưu phiếu
          </button>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full flex sm:justify-center p-2 sm:p-8 print:p-0 print:block">
        <div 
          ref={printRef}
          style={{ 
            zoom: `${zoom}%`,
            fontFamily: '"Times New Roman", Times, serif'
          }}
          className="bg-white text-stone-900 sm:shadow-2xl origin-top-left sm:origin-top w-full sm:w-[210mm] border-none sm:border-2 border-transparent sm:border-stone-200 print:border-none print:w-full print:p-0 print:shadow-none print:!zoom-100 min-h-[max-content] mx-auto p-4 sm:p-[20mm] font-serif"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="text-center font-bold text-base w-48 font-times">
              <p className="m-0 leading-tight">CỤC HC - KT</p>
              <p className="m-0 leading-tight">Tiểu đoàn 30</p>
              <p className="m-0 leading-tight">Đại đội S/C xe máy</p>
              <p className="m-0 leading-tight">Tổ S/C Máy, gầm</p>
            </div>
            <div className="text-center flex-1">
              <h2 className="text-2xl font-bold uppercase m-0 leading-tight font-times">PHIẾU SỬA CHỮA</h2>
              <div className="italic text-lg mt-1 font-times">
                <span className="font-bold">Số: </span>
                <input 
                  type="text" 
                  value={typeof (formData.soPhieu !== undefined ? formData.soPhieu : '2') === 'string' ? (formData.soPhieu !== undefined ? formData.soPhieu : '2').normalize('NFC') : (formData.soPhieu !== undefined ? formData.soPhieu : '2')}
                  onChange={(e) => setFormData({...formData, soPhieu: e.target.value.normalize('NFC')})}
                  disabled={isLocked && !isAdmin}
                  className="font-bold border-b border-dotted border-black bg-transparent outline-none w-16 text-center disabled:opacity-75 disabled:cursor-not-allowed" 
                />
              </div>
            </div>
            <div className="w-48 text-left text-base font-times">
              <div className="flex mb-1 items-end relative">
                <span className="whitespace-nowrap font-bold">Tên TBKT: </span>
                <input 
                  type="text" 
                  value={typeof (formData.tenTBKT !== undefined ? formData.tenTBKT : (formData.vehicleName || '')) === 'string' ? (formData.tenTBKT !== undefined ? formData.tenTBKT : (formData.vehicleName || '')).normalize('NFC') : (formData.tenTBKT !== undefined ? formData.tenTBKT : (formData.vehicleName || ''))}
                  onChange={(e) => setFormData({...formData, tenTBKT: e.target.value.normalize('NFC')})}
                  disabled={isLocked && !isAdmin}
                  className="border-b border-dotted border-black flex-1 bg-transparent outline-none pb-0 px-1 font-bold disabled:opacity-75 disabled:cursor-not-allowed text-center ml-1" 
                />
                <button
                  disabled={isLocked && !isAdmin}
                  onClick={() => setShowVehicleSelect(!showVehicleSelect)}
                  className="absolute left-0 top-full mt-1 px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-semibold rounded-md shadow-sm transition-colors print:hidden whitespace-nowrap font-sans cursor-pointer focus:outline-none z-50"
                  title="Chọn xe từ danh sách"
                >
                  {showVehicleSelect ? 'Đóng' : 'Chọn xe...'}
                </button>
                {showVehicleSelect && (
                  <div className="absolute top-[calc(100%+30px)] right-0 w-64 max-h-60 overflow-y-auto bg-white border border-stone-200 shadow-xl rounded-lg z-50 print:hidden text-black font-sans">
                    <div className="sticky top-0 bg-stone-100 px-3 py-2 border-b border-stone-200 flex justify-between items-center z-10">
                      <span className="text-xs font-bold text-stone-600 uppercase">Danh sách xe</span>
                      <button 
                        onClick={() => setShowVehicleSelect(false)}
                        className="text-stone-400 hover:text-stone-700 font-bold px-2"
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
                              vehicleNumber: v.plateNumber || '',
                              tenTBKT: v.brand || v.vehicleGroup || 'Không xác định',
                              soHieu: v.plateNumber || ''
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
              <div className="flex mb-1 items-end">
                <span className="whitespace-nowrap font-bold">Số hiệu: </span>
                <input 
                  type="text" 
                  value={typeof (formData.soHieu !== undefined ? formData.soHieu : (formData.vehicleNumber || '')) === 'string' ? (formData.soHieu !== undefined ? formData.soHieu : (formData.vehicleNumber || '')).normalize('NFC') : (formData.soHieu !== undefined ? formData.soHieu : (formData.vehicleNumber || ''))}
                  onChange={(e) => setFormData({...formData, soHieu: e.target.value.normalize('NFC')})}
                  disabled={isLocked && !isAdmin}
                  className="border-b border-dotted border-black flex-1 bg-transparent outline-none pb-0 px-1 font-bold disabled:opacity-75 disabled:cursor-not-allowed text-center ml-1" 
                />
              </div>
              <div className="flex mb-1 items-end">
                <span className="whitespace-nowrap font-bold">Số XX: </span>
                <input 
                  type="text" 
                  value={typeof (formData.soXX !== undefined ? formData.soXX : (formData.xxNumber1 || '')) === 'string' ? (formData.soXX !== undefined ? formData.soXX : (formData.xxNumber1 || '')).normalize('NFC') : (formData.soXX !== undefined ? formData.soXX : (formData.xxNumber1 || ''))}
                  onChange={(e) => setFormData({...formData, soXX: e.target.value.normalize('NFC')})}
                  disabled={isLocked && !isAdmin}
                  className="border-b border-dotted border-black flex-1 bg-transparent outline-none pb-0 px-1 font-bold disabled:opacity-75 disabled:cursor-not-allowed text-center ml-1" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end mb-6 font-times text-[15px]">
            <div className="flex-1 flex mr-4">
              <span className="whitespace-nowrap font-bold">Cụm - công đoạn: </span>
              <input 
                type="text" 
                value={typeof (formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Tổng lắp trang thiết bị kỹ thuật') === 'string' ? (formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Tổng lắp trang thiết bị kỹ thuật').normalize('NFC') : (formData.cumCongDoan !== undefined ? formData.cumCongDoan : 'Tổng lắp trang thiết bị kỹ thuật')}
                onChange={(e) => setFormData({...formData, cumCongDoan: e.target.value.normalize('NFC')})}
                disabled={isLocked && !isAdmin}
                className="border-b border-dotted border-black flex-1 bg-transparent outline-none pb-0 px-2 font-bold disabled:opacity-75 disabled:cursor-not-allowed ml-2" 
              />
            </div>
            <div className="flex gap-4">
              <div className="flex">
                <span className="whitespace-nowrap font-bold">Tờ số: </span>
                <input 
                  type="text" 
                  value={typeof (formData.toSo !== undefined ? formData.toSo : '1') === 'string' ? (formData.toSo !== undefined ? formData.toSo : '1').normalize('NFC') : (formData.toSo !== undefined ? formData.toSo : '1')}
                  onChange={(e) => setFormData({...formData, toSo: e.target.value.normalize('NFC')})}
                  disabled={isLocked && !isAdmin}
                  className="border-b border-dotted border-black w-12 bg-transparent outline-none pb-0 px-1 text-center font-bold disabled:opacity-75 disabled:cursor-not-allowed ml-1" 
                />
              </div>
              <div className="flex">
                <span className="whitespace-nowrap font-bold ml-2">Số tờ: </span>
                <input 
                  type="text" 
                  value={typeof (formData.soTo !== undefined ? formData.soTo : '12') === 'string' ? (formData.soTo !== undefined ? formData.soTo : '12').normalize('NFC') : (formData.soTo !== undefined ? formData.soTo : '12')}
                  onChange={(e) => setFormData({...formData, soTo: e.target.value.normalize('NFC')})}
                  disabled={isLocked && !isAdmin}
                  className="border-b border-dotted border-black w-12 bg-transparent outline-none pb-0 px-1 text-center font-bold disabled:opacity-75 disabled:cursor-not-allowed ml-1" 
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <table className="w-full border-collapse border-y border-x sm:border border-stone-300 sm:border-black text-[15px]">
              <thead className="hidden sm:table-header-group">
                <tr>
                  <th className="border border-black px-2 py-2 text-center w-12 font-bold">TT</th>
                  <th className="border border-black px-2 py-2 text-center font-bold">Nội dung</th>
                  <th className="border border-black px-2 py-2 text-center font-bold">Yêu cầu</th>
                  <th className="border border-black px-2 py-2 text-center font-bold">Thực tế</th>
                  <th className="border border-black px-2 py-2 text-center font-bold">Vật tư</th>
                  <th className="border border-black px-2 py-2 text-center font-bold" style={{width: '80px'}}>Giờ công</th>
                  <th className="border border-black px-2 py-2 text-center w-32 font-bold">Ghi chú</th>
                  <th className="border border-black px-2 py-2 text-center w-32 font-bold">Ngày thực hiện</th>
                  </tr>
              </thead>
              <tbody>
                {formData.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="border border-black px-2 py-4 text-center text-stone-500 italic">
                      Chưa có nội dung
                    </td>
                  </tr>
                )}
                {(() => {
                  let lastCategory = '';
                  return formData.items.map((item: any, index: number) => {
                    const showCategoryHeader = item.category && item.category !== lastCategory;
                    if (showCategoryHeader) {
                      lastCategory = item.category;
                    }
                    return (
                      <React.Fragment key={index}>
                        {showCategoryHeader && (
                          <tr className="bg-stone-50 print:bg-stone-100 font-bold block sm:table-row">
                            <td colSpan={7} className="border border-black px-4 py-2 text-left text-[14px]">
                              {item.category}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="border border-black px-2 py-2 text-center">{item.stt || index + 1}</td>
                          <td className="border border-black p-0 relative">
                            <div className="flex flex-col h-full">
                              <AutoResizeTextarea 
                                value={typeof (item.noiDung || '') === 'string' ? (item.noiDung || '').normalize('NFC') : (item.noiDung || '')}
                                onChange={(e) => {
                                  const newItems = [...formData.items];
                                  newItems[index].noiDung = e.target.value.normalize('NFC');
                                  setFormData({ ...formData, items: newItems });
                                }}
                                disabled={isLocked && !isAdmin}
                                className="w-full h-full min-h-[36px] bg-transparent outline-none px-2 py-2 font-bold text-emerald-700 print:text-black disabled:opacity-75"
                              />
                            </div>
                          </td>
                          <td className="border border-black p-0">
                            <AutoResizeTextarea 
                              value={typeof (item.yeuCau || '') === 'string' ? (item.yeuCau || '').normalize('NFC') : (item.yeuCau || '')}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[index].yeuCau = e.target.value.normalize('NFC');
                                setFormData({ ...formData, items: newItems });
                              }}
                              disabled={isLocked && !isAdmin}
                              className="w-full h-full min-h-[36px] bg-transparent outline-none px-2 py-2 font-bold text-emerald-700 print:text-black disabled:opacity-75"
                            />
                          </td>
                          <td className="border border-black p-0">
                            <AutoResizeTextarea 
                              value={typeof (item.thucTe || '') === 'string' ? (item.thucTe || '').normalize('NFC') : (item.thucTe || '')}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[index].thucTe = e.target.value.normalize('NFC');
                                setFormData({ ...formData, items: newItems });
                              }}
                              disabled={isLocked && !isAdmin}
                              className="w-full h-full min-h-[36px] bg-transparent outline-none px-2 py-2 text-center font-bold text-emerald-700 print:text-black disabled:opacity-75"
                            />
                          </td>
                          <td className="border border-black p-0">
                            <AutoResizeTextarea 
                              value={typeof (item.vatTu || '') === 'string' ? (item.vatTu || '').normalize('NFC') : (item.vatTu || '')}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[index].vatTu = e.target.value.normalize('NFC');
                                setFormData({ ...formData, items: newItems });
                              }}
                              disabled={isLocked && !isAdmin}
                              className="w-full h-full min-h-[36px] bg-transparent outline-none px-2 py-2 text-center font-bold text-emerald-700 print:text-black disabled:opacity-75"
                            />
                          </td>
                          <td className="border border-black p-0">
                            <AutoResizeTextarea 
                              value={typeof (item.gioCong || '') === 'string' ? (item.gioCong || '').normalize('NFC') : (item.gioCong || '')}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[index].gioCong = e.target.value.normalize('NFC');
                                setFormData({ ...formData, items: newItems });
                              }}
                              disabled={isLocked && !isAdmin}
                              className="w-full h-full min-h-[36px] bg-transparent outline-none px-2 py-2 text-center font-bold text-emerald-700 print:text-black disabled:opacity-75"
                            />
                          </td>
                          <td className="border border-black p-0">
                            <AutoResizeTextarea 
                              value={typeof (item.ghiChu || '') === 'string' ? (item.ghiChu || '').normalize('NFC') : (item.ghiChu || '')}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[index].ghiChu = e.target.value.normalize('NFC');
                                setFormData({ ...formData, items: newItems });
                              }}
                              disabled={isLocked && !isAdmin}
                              className="w-full h-full min-h-[36px] bg-transparent outline-none px-2 py-2 text-center font-bold text-emerald-700 print:text-black disabled:opacity-75"
                            />
                          </td>
                            <td className="border border-black px-2 py-2">
                              <input 
                                type="date" 
                                className="w-full bg-transparent outline-none text-center"
                                value={typeof (item.ngayThucHien || '') === 'string' ? (item.ngayThucHien || '').normalize('NFC') : (item.ngayThucHien || '')}
                                onChange={(e) => {
                                  const newItems = [...formData.items];
                                  newItems[index].ngayThucHien = e.target.value.normalize('NFC');
                                  setFormData({ ...formData, items: newItems });
                                }}
                                disabled={isLocked && !isAdmin}
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

          <div className="mb-6 bg-stone-50 border border-stone-200 p-4 rounded-lg print:border-black print:bg-white print:rounded-none">
            <h3 className="font-bold text-[15px] mb-2 uppercase text-emerald-800 print:text-black">Tổng hợp giờ công</h3>
            <div className="text-[14px] mb-4">
              <span className="font-bold text-2xl text-emerald-700 print:text-black">{tongGioCong.toFixed(1)}</span> <span className="text-stone-600 font-medium print:text-black">giờ</span>
            </div>

            <h3 className="font-bold text-[15px] mb-2 uppercase text-emerald-800 print:text-black">Tổng hợp vật tư sử dụng</h3>
            <div className="text-[14px] text-stone-700 print:text-black min-h-[40px]">
              {vatTuList.length > 0 ? vatTuList.join(', ') : <span className="italic text-stone-400">Không có vật tư ghi nhận</span>}
            </div>
          </div>

          <div className="mb-4">
            <span className="font-bold text-[15px] mr-2">KẾT LUẬN:</span>
            <AutoResizeTextarea
              value={typeof (formData.ketLuan !== undefined ? formData.ketLuan : (formData.conclusion || 'Tổng lắp được thực hiện đúng Quy trình công nghệ.')) === 'string' ? (formData.ketLuan !== undefined ? formData.ketLuan : (formData.conclusion || 'Tổng lắp được thực hiện đúng Quy trình công nghệ.')).normalize('NFC') : (formData.ketLuan !== undefined ? formData.ketLuan : (formData.conclusion || 'Tổng lắp được thực hiện đúng Quy trình công nghệ.'))}
              onChange={(e) => setFormData({...formData, ketLuan: e.target.value.normalize('NFC')})}
              disabled={isLocked && !isAdmin}
              className="flex-1 w-full border-none p-0 outline-none text-[15px] leading-relaxed font-bold text-emerald-700 print:text-black bg-transparent min-h-[40px] disabled:opacity-75 disabled:cursor-not-allowed"
              placeholder="Nhập kết luận..."
            />
          </div>

          <div className="flex justify-end mb-4">
            <input 
              type="text" 
              value={typeof (formData.ngayLap || '') === 'string' ? (formData.ngayLap || '').normalize('NFC') : (formData.ngayLap || '')}
              onChange={(e) => setFormData({...formData, ngayLap: e.target.value.normalize('NFC')})}
              disabled={isLocked && !isAdmin}
              className="text-right italic font-bold text-emerald-700 print:text-black bg-transparent outline-none min-w-[250px] disabled:opacity-75 disabled:cursor-not-allowed" 
            />
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center flex flex-col items-center">
              <p className="font-bold text-[15px] mb-12">TỔ TRƯỞNG</p>
              <input 
                type="text" 
                className="w-full text-center outline-none bg-transparent font-bold text-[15px] print:text-black" 
                value={typeof (formData['sign_TỔ TRƯỞNG'] || '') === 'string' ? (formData['sign_TỔ TRƯỞNG'] || '').normalize('NFC') : (formData['sign_TỔ TRƯỞNG'] || '')} 
                onChange={(e) => setFormData({...formData, 'sign_TỔ TRƯỞNG': e.target.value.normalize('NFC')})}
                placeholder="..."
              />
              <input 
                type="text" 
                value={typeof (formData.toTruong || '') === 'string' ? (formData.toTruong || '').normalize('NFC') : (formData.toTruong || '')}
                onChange={(e) => setFormData({...formData, toTruong: e.target.value.normalize('NFC')})}
                disabled={isLocked && !isAdmin}
                className="text-center font-bold text-emerald-700 print:text-black bg-transparent outline-none w-full disabled:opacity-75 disabled:cursor-not-allowed" 
              />
            </div>
            <div className="text-center flex flex-col items-center">
              <p className="font-bold text-[15px] mb-12">ĐẠI ĐỘI TRƯỞNG</p>
              <input 
                type="text" 
                className="w-full text-center outline-none bg-transparent font-bold text-[15px] print:text-black" 
                value={typeof (formData['sign_ĐẠI ĐỘI TRƯỞNG'] || '') === 'string' ? (formData['sign_ĐẠI ĐỘI TRƯỞNG'] || '').normalize('NFC') : (formData['sign_ĐẠI ĐỘI TRƯỞNG'] || '')} 
                onChange={(e) => setFormData({...formData, 'sign_ĐẠI ĐỘI TRƯỞNG': e.target.value.normalize('NFC')})}
                placeholder="..."
              />
              <input 
                type="text" 
                value={typeof (formData.daiDoiTruong || '') === 'string' ? (formData.daiDoiTruong || '').normalize('NFC') : (formData.daiDoiTruong || '')}
                onChange={(e) => setFormData({...formData, daiDoiTruong: e.target.value.normalize('NFC')})}
                disabled={isLocked && !isAdmin}
                className="text-center font-bold text-emerald-700 print:text-black bg-transparent outline-none w-full disabled:opacity-75 disabled:cursor-not-allowed" 
              />
            </div>
            <div className="text-center flex flex-col items-center">
              <p className="font-bold text-[15px] mb-12">NHÂN VIÊN KCS</p>
              <input 
                type="text" 
                className="w-full text-center outline-none bg-transparent font-bold text-[15px] print:text-black" 
                value={typeof (formData['sign_NHÂN VIÊN KCS'] || '') === 'string' ? (formData['sign_NHÂN VIÊN KCS'] || '').normalize('NFC') : (formData['sign_NHÂN VIÊN KCS'] || '')} 
                onChange={(e) => setFormData({...formData, 'sign_NHÂN VIÊN KCS': e.target.value.normalize('NFC')})}
                placeholder="..."
              />
              <input 
                type="text" 
                value={typeof (formData.nhanVienKCS || '') === 'string' ? (formData.nhanVienKCS || '').normalize('NFC') : (formData.nhanVienKCS || '')}
                onChange={(e) => setFormData({...formData, nhanVienKCS: e.target.value.normalize('NFC')})}
                disabled={isLocked && !isAdmin}
                className="text-center font-bold text-emerald-700 print:text-black bg-transparent outline-none w-full disabled:opacity-75 disabled:cursor-not-allowed" 
              />
            </div>
            <div className="text-center flex flex-col items-center">
              <p className="font-bold text-[15px] mb-12">CHỈ HUY TIỂU ĐOÀN</p>
              <input 
                type="text" 
                className="w-full text-center outline-none bg-transparent font-bold text-[15px] print:text-black" 
                value={typeof (formData['sign_CHỈ HUY TIỂU ĐOÀN'] || '') === 'string' ? (formData['sign_CHỈ HUY TIỂU ĐOÀN'] || '').normalize('NFC') : (formData['sign_CHỈ HUY TIỂU ĐOÀN'] || '')} 
                onChange={(e) => setFormData({...formData, 'sign_CHỈ HUY TIỂU ĐOÀN': e.target.value.normalize('NFC')})}
                placeholder="..."
              />
              <input 
                type="text" 
                value={typeof (formData.chiHuyTieuDoan || '') === 'string' ? (formData.chiHuyTieuDoan || '').normalize('NFC') : (formData.chiHuyTieuDoan || '')}
                onChange={(e) => setFormData({...formData, chiHuyTieuDoan: e.target.value.normalize('NFC')})}
                disabled={isLocked && !isAdmin}
                className="text-center font-bold text-emerald-700 print:text-black bg-transparent outline-none w-full disabled:opacity-75 disabled:cursor-not-allowed" 
              />
            </div>
          </div>

          
</div>
      </div>
    </div>
  );
};
