import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary:
                'bg-gradient-to-r from-[#F5C542] to-[#FFC83D] hover:from-[#FFC83D] hover:to-[#FFD54F] text-[#15140F] shadow-lg shadow-[#F5C542]/20 hover:shadow-[#F5C542]/30 focus:ring-[#F5C542] border border-[#F5C542]/50',
            secondary:
                'bg-[#2E2C24] hover:bg-[#3E3C32] text-[#FAFAFA] border border-[#3E3C32] hover:border-[#F5C542]/30 focus:ring-[#F5C542]',
            danger:
                'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/20 focus:ring-red-500',
            ghost:
                'bg-transparent hover:bg-[#2E2C24] text-[#A1A1AA] hover:text-[#FAFAFA] focus:ring-[#F5C542]',
            outline:
                'border border-[#3E3C32] hover:border-[#F5C542]/50 bg-transparent text-[#A1A1AA] hover:text-[#FAFAFA] focus:ring-[#F5C542]',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm gap-1.5',
            md: 'px-4 py-2 text-sm gap-2',
            lg: 'px-6 py-3 text-base gap-2',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    leftIcon
                )}
                {children}
                {!isLoading && rightIcon}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
