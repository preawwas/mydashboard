import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    closeOnBackdropClick?: boolean;
    closeOnEscape?: boolean;
    className?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnBackdropClick = false,
    closeOnEscape = false,
    className,
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape' && closeOnEscape) {
                onClose();
            }
        },
        [onClose, closeOnEscape]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleEscape]);

    if (!isOpen || !mounted) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4',
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden" role="dialog" aria-modal="true">
            {/* Backdrop with fade animation */}
            <div
                className="fixed inset-0 bg-black/70 animate-in fade-in duration-200"
                onClick={() => {
                    if (closeOnBackdropClick) onClose();
                }}
            />

            {/* Modal with scale and slide animation */}
            <div
                className={cn(
                    'relative w-full border border-border rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col',
                    'animate-in zoom-in-95 fade-in duration-300',
                    'motion-reduce:animate-none max-h-[90vh]',
                    sizes[size],
                    className
                )}
                style={{
                    backgroundColor: 'var(--background)',
                    opacity: 1,
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-start justify-between p-4 sm:p-6 border-b border-border relative flex-shrink-0">
                        {/* Subtle golden gradient line at bottom */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        <div className="pr-8">
                            {title && (
                                <h2 className="text-lg sm:text-xl font-bold text-foreground uppercase tracking-wide truncate">{title}</h2>
                            )}
                            {description && (
                                <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">{description}</p>
                            )}
                        </div>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-lg transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content - Scrollable area */}
                <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">{children}</div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
