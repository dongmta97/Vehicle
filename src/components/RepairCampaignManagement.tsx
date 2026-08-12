import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Eye, 
  FolderOpen, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Search,
  Edit2,
  Trash2,
  X,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';
import { RepairCampaign, CampaignStatus } from '../types';
import { dbService } from '../services/dbService';
import { userService } from '../services/userService';
import { canEditModule } from '../services/permissionService';

export interface CampaignWithCount extends RepairCampaign {
  vehicleCount: number;
}

interface RepairCampaignManagementProps {
  onClose?: () => void;
  onCampaignsUpdated?: () => void;
}

export const RepairCampaignManagement: React.FC<RepairCampaignManagementProps> = ({
  onClose,
  onCampaignsUpdated,
}) => {
  const [campaigns, setCampaigns] = useState<CampaignWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<RepairCampaign | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithCount | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<RepairCampaign | null>(null);

  // Form states for Create/Edit
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formYear, setFormYear] = useState<number>(new Date().getFullYear());
  const [formRound, setFormRound] = useState<number>(1);
  const [formDesc, setFormDesc] = useState('');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState<CampaignStatus>('OPEN');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = userService.getCurrentUser();
  const canEdit = currentUser?.role ? canEditModule(currentUser.role, 'RECEPTION') : true;

  // Fetch campaigns and calculate vehicle counts from repair sessions
  const loadCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allCampaigns, allSessions] = await Promise.all([
        dbService.getAllRepairCampaigns(),
        dbService.getAllRepairSessions(),
      ]);

      const visibleCampaigns = (allCampaigns || []).filter((c) => !c.isDeleted);

      // Calculate vehicle count per campaign
      const mapped: CampaignWithCount[] = visibleCampaigns.map((c) => {
        const matchingSessions = (allSessions || []).filter(
          (s) => !s.isDeleted && s.campaignId === c.id
        );

        const uniqueVehicles = new Set(
          matchingSessions.map((s) => s.vehicleId || s.plateNumber).filter(Boolean)
        );

        return {
          ...c,
          vehicleCount: uniqueVehicles.size,
        };
      });

      setCampaigns(mapped);
    } catch (err) {
      console.error('Failed to load repair campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // Handle open Create Modal
  const handleOpenCreate = () => {
    const nextRound = campaigns.length + 1;
    const yearStr = new Date().getFullYear();
    setFormCode(`DSC-${yearStr}-${String(nextRound).padStart(2, '0')}`);
    setFormName(`Đợt sửa chữa ${nextRound} - ${yearStr}`);
    setFormYear(yearStr);
    setFormRound(nextRound);
    setFormDesc('');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('');
    setFormStatus('OPEN');
    setFormError('');
    setShowCreateModal(true);
  };

  // Handle open Edit Modal
  const handleOpenEdit = (c: RepairCampaign) => {
    setEditingCampaign(c);
    setFormCode(c.campaignCode || '');
    setFormName(c.campaignName || '');
    setFormYear(c.year || new Date().getFullYear());
    setFormRound(c.round || 1);
    setFormDesc(c.description || '');
    setFormStartDate(c.startDate || new Date().toISOString().split('T')[0]);
    setFormEndDate(c.endDate || '');
    setFormStatus(c.status || 'OPEN');
    setFormError('');
  };

  // Save Create or Edit
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      setFormError('Vui lòng nhập Mã đợt sửa chữa.');
      return;
    }
    if (!formName.trim()) {
      setFormError('Vui lòng nhập Tên đợt sửa chữa.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingCampaign) {
        // UPDATE
        await dbService.updateRepairCampaign(editingCampaign.id, {
          campaignCode: formCode.trim(),
          campaignName: formName.trim(),
          year: Number(formYear),
          round: Number(formRound),
          description: formDesc.trim(),
          startDate: formStartDate,
          endDate: formEndDate,
          status: formStatus,
        });
        setEditingCampaign(null);
      } else {
        // CREATE
        await dbService.saveRepairCampaign({
          campaignCode: formCode.trim(),
          campaignName: formName.trim(),
          year: Number(formYear),
          round: Number(formRound),
          description: formDesc.trim(),
          startDate: formStartDate,
          endDate: formEndDate,
          status: formStatus,
          createdBy: currentUser?.fullName || currentUser?.username || 'Ban Kỹ Thuật',
        });
        setShowCreateModal(false);
      }

      await loadCampaigns();
      onCampaignsUpdated?.();
    } catch (err: any) {
      console.error('Failed to save campaign:', err);
      setFormError('Lỗi khi lưu đợt sửa chữa: ' + (err.message || 'Thao tác thất bại'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Close Campaign
  const handleCloseCampaign = async (c: RepairCampaign) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ĐÓNG đợt sửa chữa "${c.campaignName}"?`)) {
      return;
    }
    try {
      await dbService.closeRepairCampaign(c.id);
      await loadCampaigns();
      onCampaignsUpdated?.();
      if (selectedCampaign?.id === c.id) {
        setSelectedCampaign(null);
      }
    } catch (err) {
      console.error('Failed to close campaign:', err);
      alert('Không thể đóng đợt sửa chữa.');
    }
  };

  // Handle Open Campaign
  const handleOpenCampaignStatus = async (c: RepairCampaign) => {
    try {
      await dbService.openRepairCampaign(c.id);
      await loadCampaigns();
      onCampaignsUpdated?.();
      if (selectedCampaign?.id === c.id) {
        setSelectedCampaign((prev) => (prev ? { ...prev, status: 'OPEN' } : null));
      }
    } catch (err) {
      console.error('Failed to open campaign:', err);
      alert('Không thể mở lại đợt sửa chữa.');
    }
  };

  // Handle Delete Campaign (Soft Delete)
  const handleConfirmDelete = async () => {
    if (!deletingCampaign) return;
    try {
      await dbService.deleteRepairCampaign(deletingCampaign.id);
      setDeletingCampaign(null);
      await loadCampaigns();
      onCampaignsUpdated?.();
      if (selectedCampaign?.id === deletingCampaign.id) {
        setSelectedCampaign(null);
      }
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      alert('Lỗi khi xóa đợt sửa chữa.');
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.campaignCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ĐANG MỞ
          </span>
        );
      case 'PLANNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> KẾ HOẠCH
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" /> ĐÃ ĐÓNG
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-[Times_New_Roman,serif]">
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-red-800 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" /> Hệ Thống Quản Lý Sửa Chữa TBKT
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              QUẢN LÝ ĐỢT SỬA CHỮA (REPAIR CAMPAIGN)
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Tổ chức, theo dõi và quản lý các đợt sửa chữa trang bị kỹ thuật tập trung
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadCampaigns();
                onCampaignsUpdated?.();
              }}
              className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            {canEdit && (
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white font-semibold px-5 py-2.5 rounded-lg text-sm shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> TẠO ĐỢT SỬA CHỮA
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2.5 rounded-lg text-sm transition-all cursor-pointer"
              >
                <X className="w-4 h-4" /> Đóng
              </button>
            )}
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã hoặc tên đợt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="OPEN">Đang mở (OPEN)</option>
              <option value="PLANNING">Kế hoạch (PLANNING)</option>
              <option value="CLOSED">Đã đóng (CLOSED)</option>
            </select>
          </div>
        </div>

        {/* Campaign Cards / Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-700">
                  <th className="py-3.5 px-4">Mã Đợt</th>
                  <th className="py-3.5 px-4">Tên Đợt Sửa Chữa</th>
                  <th className="py-3.5 px-4 text-center">Năm / Đợt</th>
                  <th className="py-3.5 px-4">Thời Gian Thực Hiện</th>
                  <th className="py-3.5 px-4 text-center">Số Lượng Xe</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500 animate-pulse font-semibold">
                      Đang tải dữ liệu đợt sửa chữa từ Firestore...
                    </td>
                  </tr>
                ) : filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Không tìm thấy đợt sửa chữa nào thỏa mãn điều kiện.
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-bold text-red-900 whitespace-nowrap">
                        {c.campaignCode}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900 max-w-xs">
                        <div>{c.campaignName}</div>
                        {c.description && (
                          <div className="text-xs text-slate-500 font-normal line-clamp-1 mt-0.5">
                            {c.description}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center whitespace-nowrap font-medium text-slate-700">
                        {c.year} - Đợt {c.round || 1}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.startDate || 'N/A'}</span>
                          <span>→</span>
                          <span>{c.endDate || 'Chưa định ngày'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          {c.vehicleCount} xe
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(c.status)}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCampaign(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" /> Xem
                          </button>

                          {canEdit && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(c)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer"
                                title="Chỉnh sửa đợt sửa chữa"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Sửa
                              </button>

                              {c.status === 'CLOSED' ? (
                                <button
                                  onClick={() => handleOpenCampaignStatus(c)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                                  title="Mở lại đợt sửa chữa"
                                >
                                  <Unlock className="w-3.5 h-3.5 text-emerald-700" /> Mở
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleCloseCampaign(c)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors cursor-pointer"
                                  title="Đóng đợt sửa chữa"
                                >
                                  <Lock className="w-3.5 h-3.5 text-slate-600" /> Đóng
                                </button>
                              )}

                              <button
                                onClick={() => setDeletingCampaign(c)}
                                className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                title="Xóa đợt sửa chữa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Chi Tiết Đợt Sửa Chữa</h3>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="space-y-2.5 text-sm text-slate-700">
              <p>
                <strong>Mã đợt:</strong>{' '}
                <span className="font-mono font-bold text-red-900">{selectedCampaign.campaignCode}</span>
              </p>
              <p>
                <strong>Tên đợt:</strong>{' '}
                <span className="font-semibold text-slate-900">{selectedCampaign.campaignName}</span>
              </p>
              <p>
                <strong>Năm / Đợt:</strong> {selectedCampaign.year} - Đợt {selectedCampaign.round}
              </p>
              <p>
                <strong>Trạng thái:</strong> {getStatusBadge(selectedCampaign.status)}
              </p>
              <p>
                <strong>Mô tả:</strong> {selectedCampaign.description || 'Chưa có mô tả'}
              </p>
              <p>
                <strong>Thời gian:</strong> {selectedCampaign.startDate} đến{' '}
                {selectedCampaign.endDate || 'Chưa định ngày'}
              </p>
              <p>
                <strong>Số lượng xe tham gia:</strong>{' '}
                <span className="font-bold text-blue-800">{selectedCampaign.vehicleCount} xe</span>
              </p>
              <p>
                <strong>Người tạo:</strong> {selectedCampaign.createdBy || 'N/A'}
              </p>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <div className="flex gap-2">
                {canEdit && (
                  <>
                    <button
                      onClick={() => {
                        const target = selectedCampaign;
                        setSelectedCampaign(null);
                        handleOpenEdit(target);
                      }}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold rounded-lg border border-blue-200 cursor-pointer"
                    >
                      Sửa đợt
                    </button>
                    {selectedCampaign.status === 'CLOSED' ? (
                      <button
                        onClick={() => handleOpenCampaignStatus(selectedCampaign)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 cursor-pointer"
                      >
                        Mở lại đợt
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCloseCampaign(selectedCampaign)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 cursor-pointer"
                      >
                        Đóng đợt
                      </button>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-semibold rounded-lg cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(showCreateModal || editingCampaign) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form
            onSubmit={handleSaveCampaign}
            className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCampaign ? 'Chỉnh Sửa Đợt Sửa Chữa' : 'Tạo Đợt Sửa Chữa Mới'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCampaign(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                {formError}
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã đợt sửa chữa <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: DSC-2026-01"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-red-800/20 focus:border-red-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as CampaignStatus)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-800/20 focus:border-red-800 bg-white"
                  >
                    <option value="OPEN">Đang mở (OPEN)</option>
                    <option value="PLANNING">Kế hoạch (PLANNING)</option>
                    <option value="CLOSED">Đã đóng (CLOSED)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên đợt sửa chữa <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên đợt sửa chữa tập trung..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-800/20 focus:border-red-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Năm thực hiện</label>
                  <input
                    type="number"
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-800/20 focus:border-red-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thứ tự Đợt</label>
                  <input
                    type="number"
                    min={1}
                    value={formRound}
                    onChange={(e) => setFormRound(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-800/20 focus:border-red-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-800/20 focus:border-red-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-800/20 focus:border-red-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả / Ghi chú</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả nội dung, mục tiêu hoặc phạm vi trang bị của đợt sửa chữa..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-800/20 focus:border-red-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCampaign(null);
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white text-sm font-semibold rounded-lg shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Đang lưu...' : editingCampaign ? 'Cập Nhật' : 'Tạo Đợt Sửa Chữa'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingCampaign && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold">Xác Nhận Xóa Đợt Sửa Chữa</h3>
            </div>
            <p className="text-sm text-slate-600">
              Bạn có chắc chắn muốn xóa đợt sửa chữa{' '}
              <strong className="text-slate-900">{deletingCampaign.campaignName}</strong> (
              <span className="font-mono">{deletingCampaign.campaignCode}</span>)?
            </p>
            <p className="text-xs text-slate-500 bg-slate-100 p-2.5 rounded-lg border border-slate-200">
              Lưu ý: Dữ liệu sẽ được chuyển sang trạng thái đã xóa (Soft Delete) theo quy định lưu trữ Firestore.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingCampaign(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white text-sm font-semibold rounded-lg cursor-pointer"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairCampaignManagement;
