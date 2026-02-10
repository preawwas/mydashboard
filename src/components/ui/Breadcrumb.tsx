'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROUTE_LABELS: Record<string, string> = {
    dashboard: 'Dashboard',
    investments: 'การลงทุน',
    expenses: 'ค่าใช้จ่าย',
    settings: 'ตั้งค่า',
    rent: 'ค่าเช่า',
    memories: 'ความทรงจำ',
};

const Breadcrumb: React.FC = () => {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0) return null;

    const crumbs = segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const label = ROUTE_LABELS[segment] || segment;
        const isLast = index === segments.length - 1;

        return { href, label, isLast };
    });

    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-4">
            <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-primary transition-colors"
            >
                <Home className="w-4 h-4" />
            </Link>

            {crumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.href}>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                    {crumb.isLast ? (
                        <span className={cn(
                            'font-medium text-foreground',
                            'animate-in fade-in slide-in-from-left-1 duration-200'
                        )}>
                            {crumb.label}
                        </span>
                    ) : (
                        <Link
                            href={crumb.href}
                            className="text-muted-foreground hover:text-primary transition-colors"
                        >
                            {crumb.label}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumb;
