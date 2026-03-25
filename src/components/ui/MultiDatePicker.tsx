'use client';

import React, { useState } from 'react';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    addMonths, 
    subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiDatePickerProps {
    selectedDates: string[]; // ['YYYY-MM-DD', ...]
    onChange: (dates: string[]) => void;
    onDone?: () => void;
    className?: string;
}

const MultiDatePicker: React.FC<MultiDatePickerProps> = ({ selectedDates, onChange, onDone, className }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const toggleDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        if (selectedDates.includes(dateStr)) {
            onChange(selectedDates.filter(d => d !== dateStr));
        } else {
            onChange([...selectedDates, dateStr].sort());
        }
    };

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex flex-col">
                    <span className="text-sm font-black text-foreground tracking-tight">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                </div>
                <div className="flex gap-1.5">
                    <button
                        type="button"
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-all border border-transparent hover:border-border/50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date())}
                        className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-all border border-transparent hover:border-border/50"
                        title="Today"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-all border border-transparent hover:border-border/50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map(day => (
                    <div key={day} className="text-center text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">
                        {day[0]}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const calendarDays = eachDayOfInterval({
            start: startDate,
            end: endDate,
        });

        const rows: React.ReactNode[] = [];
        let days: React.ReactNode[] = [];

        calendarDays.forEach((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isSelected = selectedDates.includes(dateStr);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            
            days.push(
                <button
                    key={dateStr}
                    type="button"
                    onClick={() => toggleDate(day)}
                    className={cn(
                        "relative h-11 w-full flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200",
                        !isCurrentMonth && "text-muted-foreground/20 pointer-events-none opacity-0",
                        isCurrentMonth && !isSelected && "hover:bg-primary/10 text-foreground/80 hover:text-primary",
                        isSelected && "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105 z-10",
                        isToday && !isSelected && "border border-primary/30 text-primary"
                    )}
                >
                    {format(day, 'd')}
                    {isToday && !isSelected && (
                        <span className="absolute bottom-2 w-1 h-1 rounded-full bg-primary" />
                    )}
                </button>
            );

            if ((i + 1) % 7 === 0) {
                rows.push(
                    <div className="grid grid-cols-7 gap-1" key={dateStr}>
                        {days}
                    </div>
                );
                days = [];
            }
        });

        return <div className="space-y-1">{rows}</div>;
    };

    return (
        <div className={cn("bg-card/30 border border-border/50 rounded-2xl p-5 transition-all", className)}>
            {renderHeader()}
            {renderDays()}
            {renderCells()}
            
            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className={cn(
                        "text-xs font-black uppercase tracking-widest pl-1",
                        selectedDates.length > 0 ? "text-primary" : "text-muted-foreground/60"
                    )}>
                        {selectedDates.length} selected
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {selectedDates.length > 0 && (
                        <button 
                            type="button" 
                            onClick={() => onChange([])}
                            className="text-[10px] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-wider bg-rose-500/10 px-2 py-1 rounded-md"
                        >
                            Clear
                        </button>
                    )}
                    {onDone && (
                        <button 
                            type="button" 
                            onClick={onDone}
                            className="text-[10px] font-black text-primary hover:text-primary-foreground hover:bg-primary transition-all uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-md border border-primary/20"
                        >
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MultiDatePicker;
