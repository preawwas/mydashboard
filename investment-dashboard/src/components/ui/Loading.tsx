import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ size = 'md', text, fullScreen = false }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    const content = (
        <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className={cn('animate-spin text-blue-600', sizes[size])} />
            {text && <p className="text-sm text-gray-500 animate-pulse">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                {content}
            </div>
        );
    }

    return content;
};

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'text',
    width,
    height,
    className,
    ...props
}) => {
    const variants = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    return (
        <div
            className={cn(
                'animate-pulse bg-gray-200',
                variants[variant],
                className
            )}
            style={{
                width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
                height: height ? (typeof height === 'number' ? `${height}px` : height) : variant === 'text' ? '1em' : undefined,
            }}
            {...props}
        />
    );
};

export { Loading, Skeleton };
