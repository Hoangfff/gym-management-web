import { AlertTriangle, Trash2, X } from 'lucide-react';
import './ConfirmModal.css';

export type ConfirmModalVariant = 'danger' | 'warning' | 'info';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
  isLoading?: boolean;
}

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <Trash2 size={24} />;
      case 'warning':
      case 'info':
      default:
        return <AlertTriangle size={24} />;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <div className="confirm-modal__backdrop" onClick={handleBackdropClick}>
      <div className="confirm-modal">
        <button 
          className="confirm-modal__close" 
          onClick={onClose}
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <div className={`confirm-modal__icon confirm-modal__icon--${variant}`}>
          {getIcon()}
        </div>

        <h2 className="confirm-modal__title">{title}</h2>
        <p className="confirm-modal__message">{message}</p>

        <div className="confirm-modal__actions">
          <button
            className="confirm-modal__btn confirm-modal__btn--secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={`confirm-modal__btn confirm-modal__btn--${variant}`}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="confirm-modal__spinner" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
