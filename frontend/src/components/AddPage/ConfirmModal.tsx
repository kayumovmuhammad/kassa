import { useState } from "react";
import type { ReactNode } from "react";
import { X, AlertTriangle, KeyRound } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  requirePassword?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  requirePassword = false
}: ConfirmModalProps) {
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const isConfirmDisabled = requirePassword && password.trim() === "";

  const handleConfirm = () => {
    if (isConfirmDisabled) return;
    onConfirm();
    setPassword("");
  };

  const handleCancel = () => {
    onCancel();
    setPassword("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 relative">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={18} strokeWidth={2.5} />
            <h3 className="font-semibold text-gray-900 tracking-tight">{title}</h3>
          </div>
          <button 
            onClick={handleCancel}
            className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full p-1.5 transition-all"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
        <div className="px-5 py-6 space-y-4">
          <p className="text-gray-600 text-[15px] leading-relaxed">
            {message}
          </p>

          {requirePassword && (
            <div className="space-y-1.5 mt-2">
              <label className="text-xs font-semibold text-gray-700 uppercase flex items-center gap-1.5">
                <KeyRound size={13} />
                Пароль администратора
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль..."
                autoFocus
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-mono"
              />
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 text-sm font-semibold transition-all shadow-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`px-4 py-2 text-white rounded-lg text-sm font-semibold border border-transparent shadow-sm flex items-center gap-2 transition-all ${
              isConfirmDisabled 
                ? "bg-red-400 cursor-not-allowed" 
                : "bg-red-600 hover:bg-red-700 hover:shadow-md"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
