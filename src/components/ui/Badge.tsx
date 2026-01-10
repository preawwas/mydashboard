import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'custom';
    size?: 'sm' | 'md' | 'lg';
}

const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    className,
    ...props
}) => {
    const variants = {
        default: 'bg-[#2E2C24] text-[#A1A1AA] border border-[#3E3C32]',
        success: 'bg-[#059669]/10 text-[#059669] border border-[#059669]/20',
        warning: 'bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20',
        danger: 'bg-red-900/10 text-red-500 border border-red-900/20',
        info: 'bg-blue-900/10 text-blue-400 border border-blue-900/20',
        custom: '',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center font-medium rounded-full',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;
