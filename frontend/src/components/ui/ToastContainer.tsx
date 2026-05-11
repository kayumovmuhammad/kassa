import { useEffect, useState } from 'react';
import { useToastStore, type Toast as ToastType } from '@/contexts/ToastContext';
import { X, AlertTriangle, Info, CheckCircle2, AlertCircle } from 'lucide-react';

const icons = {
  info: <Info className="w-5 h-5 text-blue-500" />,
  success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-orange-500" />,
  danger: <AlertCircle className="w-5 h-5 text-red-500" />,
};

const bgColors = {
  info: 'bg-white border-blue-100 text-blue-900',
  success: 'bg-white border-green-100 text-green-900',
  warning: 'bg-white border-orange-100 text-orange-900',
  danger: 'bg-rose-50 border-rose-200 text-rose-900',
};

const ToastItem = ({ toast, removeToast }: { toast: ToastType; removeToast: (id: string) => void }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
  };

  const handleAnimationEnd = () => {
    if (isExiting) {
      removeToast(toast.id);
    }
  };

  return (
    <div
      onAnimationEnd={handleAnimationEnd}
      className={`relative flex items-start gap-3 w-80 sm:w-96 p-4 mb-3 rounded-2xl shadow-lg border ${bgColors[toast.type]} 
        ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}
        transition-all duration-300 ease-in-out`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[toast.type]}
      </div>
      <div className="flex-1 mr-2 flex items-center min-h-[1.25rem]">
        <p className="text-[15px] font-medium leading-snug">{toast.message}</p>
      </div>
      <button 
        onClick={handleClose} 
        className="flex-shrink-0 p-1.5 -m-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-full hover:bg-black/5"
      >
         <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-end">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </div>
    </div>
  );
};
