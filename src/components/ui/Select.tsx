import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
    onChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className,
            label,
            error,
            helperText,
            options,
            placeholder = 'เลือก...',
            onChange,
            value,
            ...props
        },
        ref
    ) => {
        const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            onChange?.(e.target.value);
        };

        const generatedId = useId();
        const selectId = props.id || generatedId;

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={selectId} className="block text-sm font-medium text-muted-foreground mb-1.5">
                        {label} {props.required && <span className="text-destructive">*</span>}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        value={value}
                        onChange={handleChange}
                        className={cn(
                            'w-full px-4 py-2.5 border rounded-lg text-foreground appearance-none',
                            'bg-background',
                            'transition-all duration-200 ease-out',
                            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:shadow-[0_0_12px_rgba(var(--primary-rgb),0.15)]',
                            'disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
                            error
                                ? 'border-destructive focus:ring-destructive'
                                : 'border-border hover:border-primary/50',
                            className
                        )}
                        {...props}
                    >

                        {options.map((option) => (
                            <option key={option.value} value={option.value} className="bg-background text-foreground">
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground" aria-hidden="true">
                        <ChevronDown className="w-5 h-5" />
                    </div>
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
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

Select.displayName = 'Select';

export default Select;
