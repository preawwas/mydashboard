import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'accent';
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
            'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

        const variants = {
            primary:
                'btn-primary-gradient shadow-md shadow-[#2E7D7F]/20 focus:ring-[#2E7D7F]',
            accent:
                'btn-accent-gradient shadow-md shadow-[#FF7A6B]/20 focus:ring-[#FF7A6B]',
            secondary:
                'bg-white hover:bg-[#F5F7F8] text-[#1F2937] border border-[#E5E7EB] hover:border-[#2E7D7F]/40 focus:ring-[#2E7D7F] shadow-sm',
            danger:
                'bg-error hover:bg-error/90 text-white shadow-md shadow-error/20 focus:ring-error',
            ghost:
                'bg-transparent hover:bg-[#EAF4F4] text-muted-foreground hover:text-[#1F4E50] focus:ring-[#2E7D7F]',
            outline:
                'border border-[#2E7D7F]/40 hover:border-[#2E7D7F] bg-transparent text-[#2E7D7F] hover:bg-[#EAF4F4] focus:ring-[#2E7D7F]',
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

