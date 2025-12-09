import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-500',
          icon: '✓',
          iconBg: 'bg-green-500',
          text: 'text-green-800'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-500',
          icon: '✕',
          iconBg: 'bg-red-500',
          text: 'text-red-800'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-500',
          icon: '⚠',
          iconBg: 'bg-yellow-500',
          text: 'text-yellow-800'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-500',
          icon: 'ℹ',
          iconBg: 'bg-blue-500',
          text: 'text-blue-800'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`${styles.bg} border-l-4 rounded-lg shadow-lg p-4 max-w-md flex items-start gap-3`}>
        <div className={`${styles.iconBg} rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-sm font-bold">{styles.icon}</span>
        </div>
        <div className="flex-1">
          <p className={`${styles.text} text-sm font-medium leading-relaxed`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`${styles.text} hover:opacity-70 transition-opacity flex-shrink-0`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;

// ToastContainer component for easy integration
interface ToastContainerProps {
  toast: { message: string; type: ToastType } | null;
  onClose: () => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toast, onClose }) => {
  if (!toast) return null;
  return <Toast message={toast.message} type={toast.type} onClose={onClose} />;
};
