import React, { useEffect } from 'react';
import { CheckCircleIcon, XIcon, AlertTriangleIcon } from './icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  show: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircleIcon : AlertTriangleIcon;

  return (
    <div
      className={`fixed top-5 right-5 z-[100] flex items-center p-4 rounded-lg text-white shadow-lg transition-transform duration-300 ${bgColor} ${
        show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      role="alert"
    >
      <Icon className="w-6 h-6 mr-3" />
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 -mr-1 p-1 rounded-full hover:bg-white/20">
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
