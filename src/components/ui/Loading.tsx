import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { LoadingOverlay } from './LoadingOverlay';

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
        <div className="flex flex-col items-center justify-center gap-3" role="status">
            <Loader2 className={cn('animate-spin text-primary motion-reduce:animate-none', sizes[size])} aria-hidden="true" />
            {text && <p className="text-sm text-muted-foreground animate-pulse motion-reduce:animate-none">{text}</p>}
            <span className="sr-only">{text || 'Loading'}</span>
        </div>
    );

    if (fullScreen) {
        return <LoadingOverlay isVisible={true} isLoading={true} text={text || 'fluffy-ty'} />;
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
                'animate-pulse bg-[#2E2C24]',
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
