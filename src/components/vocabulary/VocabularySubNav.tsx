'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VOCABULARY_THEME as T } from '@/lib/vocabulary-theme';
import { cn } from '@/lib/utils';
import { Table2, BarChart3 } from 'lucide-react';

const SUB_NAV = [
    { href: '/vocabulary/summary', label: 'Summary', icon: BarChart3 },
    { href: '/vocabulary/review', label: 'Review', icon: Table2 },
] as const;

export default function VocabularySubNav() {
    const pathname = usePathname();

    return (
        <div className="mb-6 flex flex-wrap gap-2">
            {SUB_NAV.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                            active
                                ? 'text-[#563526] shadow-sm'
                                : 'bg-white/80 text-[#563526] border border-[#E5E7EB]'
                        )}
                        style={
                            active
                                ? { backgroundColor: T.primary }
                                : undefined
                        }
                        onMouseEnter={(e) => {
                            if (!active) e.currentTarget.style.backgroundColor = T.surface;
                        }}
                        onMouseLeave={(e) => {
                            if (!active) e.currentTarget.style.backgroundColor = '';
                        }}
                    >
                        <Icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                );
            })}
        </div>
    );
}
