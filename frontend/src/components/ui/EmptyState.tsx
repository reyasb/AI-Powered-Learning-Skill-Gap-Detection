import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-[#111426] border border-[#252A40] rounded-2xl ${className}`}>
      {icon && <div className="p-4 rounded-2xl bg-[#181D33] text-gray-400 mb-4">{icon}</div>}
      <h3 className="text-base sm:text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const LoadingSkeleton: React.FC<{ count?: number; height?: string; className?: string }> = ({
  count = 3,
  height = 'h-24',
  className = '',
}) => {
  return (
    <div className="space-y-4 w-full">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`w-full bg-[#111426] border border-[#252A40] rounded-2xl animate-pulse ${height} ${className}`}
        />
      ))}
    </div>
  );
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Dialog content */}
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} bg-[#111426] border border-[#252A40] rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col`}
      >
        <div className="px-6 py-4 border-b border-[#252A40] flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#181D33] transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
