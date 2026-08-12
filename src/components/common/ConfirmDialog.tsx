import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title = 'XÁC NHẬN',
  message,
  confirmText = 'Đồng ý',
  cancelText = 'Hủy',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle escape key to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !loading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, loading, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!loading) onCancel();
            }}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Centering container */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-md transform rounded-2xl bg-white p-6 text-left shadow-2xl border border-stone-200 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Warning badge icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                  <AlertTriangle className="h-6 w-6 animate-pulse" />
                </div>

                <div className="flex-1">
                  {/* Dialog title */}
                  <h3 className="text-lg font-bold uppercase tracking-wide text-stone-900 font-sans">
                    {title}
                  </h3>
                  
                  {/* Dialog body message */}
                  <div className="mt-3">
                    <p className="text-sm text-stone-600 leading-relaxed font-sans">
                      {message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons footer */}
              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={onCancel}
                  className="w-full sm:w-auto px-5 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={onConfirm}
                  className="w-full sm:w-auto min-w-[100px] bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <span>{confirmText}</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
