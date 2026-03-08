import React, { useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            type = 'text',
            ...props
        },
        ref
    ) => {
        const generatedId = useId();
        const inputId = props.id || generatedId;
        const errorId = `${inputId}-error`;

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-muted-foreground mb-1.5">
                        {label} {props.required && <span className="text-destructive">*</span>}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground" aria-hidden="true">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        type={type}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? errorId : undefined}
                        className={cn(
                            'w-full px-4 py-2.5 border rounded-lg text-foreground placeholder-muted-foreground',
                            'bg-background',
                            'transition-all duration-200 ease-out',
                            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:shadow-[0_0_12px_rgba(var(--primary-rgb),0.15)]',
                            'disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
                            error
                                ? 'border-destructive focus:ring-destructive'
                                : 'border-border hover:border-primary/50',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p id={errorId} className="mt-1.5 text-sm text-destructive flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-muted-foreground">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
