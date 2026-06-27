'use client';

import React from 'react';

const STROKE = '#1E293B';

interface NoteCategoryIconProps {
    categoryName: string;
    size?: number;
    className?: string;
}

const svgProps = {
    fill: 'none' as const,
    stroke: STROKE,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    Work: (
        <>
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </>
    ),
    Study: (
        <>
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </>
    ),
    Personal: (
        <>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </>
    ),
    Finance: (
        <>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </>
    ),
    'Ideas/Brainstorm': (
        <>
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M15.09 14a5 5 0 0 0 .91-2.91V10a6 6 0 1 0-12 0v1.09c0 .9.3 1.7.9 2.41 1.2 1.41 1.6 3.1 1.6 4.6V18h8v-1.9c0-1.5.4-3.19 1.6-4.6z" />
        </>
    ),
    'Draft/Writing': (
        <>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </>
    ),
    'Resources/Knowledge': (
        <>
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </>
    ),
    'Archive/Reference': (
        <>
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
        </>
    ),
};

const NoteCategoryIcon: React.FC<NoteCategoryIconProps> = ({ categoryName, size = 18, className }) => {
    const icon = CATEGORY_ICONS[categoryName];

    if (!icon) {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...svgProps}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
            </svg>
        );
    }

    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...svgProps}>
            {icon}
        </svg>
    );
};

export default NoteCategoryIcon;
