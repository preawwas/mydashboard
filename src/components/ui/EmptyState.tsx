import React from 'react';
import { cn } from '@/lib/utils';
import { Inbox, Plus } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    className,
}) => {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-16 px-6 text-center',
                className
            )}
        >
            <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {icon || <Inbox className="w-10 h-10 text-gray-400" />}
            </div>
            <h3 className="text-lg font-semibold text-[#FAFAFA] mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
            )}
            {action && (
                <Button onClick={action.onClick} leftIcon={<Plus className="w-4 h-4" />}>
                    {action.label}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
