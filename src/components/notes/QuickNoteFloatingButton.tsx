'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToastStore } from '@/lib/store';

export default function QuickNoteFloatingButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                // Keep the text, just close the modal
                setIsModalOpen(false);
            }
        }
        if (isModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen]);

    const handleSave = async () => {
        if (!noteText.trim() || isSaving) return;
        
        setIsSaving(true);
        try {
            await apiClient.fetch('/api/short-notes', {
                method: 'POST',
                body: JSON.stringify({
                    title: "Quick Note",
                    content: noteText
                })
            });
            
            setNoteText('');
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save quick note', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-[100] flex flex-col items-end">
            {/* Note Modal */}
            {isModalOpen && (
                <div 
                    ref={modalRef} 
                    className="absolute right-0 bottom-[120%] w-64 h-64 bg-white rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col border border-gray-100 origin-bottom-right animate-in fade-in zoom-in-95 duration-200 mb-2"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-[#8a6a2c]" />
                        <h4 className="text-sm font-extrabold text-[#0D3B38]">Quick Note</h4>
                    </div>
                    <textarea 
                        className="flex-1 w-full bg-gray-50 border border-gray-100 rounded-2xl p-3 text-xs text-[#0D3B38] resize-none focus:outline-none focus:ring-1 focus:ring-[#0D3B38] custom-scrollbar mb-3"
                        placeholder="Type your note here..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving || !noteText.trim()}
                            className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-[#fbdbad] text-[#5c4a16] hover:bg-[#fcdca0] border border-[#e4c07b] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            )}

            {/* Floating button */}
            <button 
                onClick={() => setIsModalOpen(!isModalOpen)}
                className="group flex items-center gap-3 bg-[#fbdbad] hover:bg-[#fcdca0] pl-5 pr-2 py-2 rounded-full shadow-[0_8px_24px_rgba(12,57,53,0.15)] transition-all duration-200 border-2 border-white/50"
            >
                <span className="text-[10px] font-extrabold tracking-widest text-[#5c4a16] uppercase hidden sm:block">
                    Quick Note
                </span>
                <div className="w-10 h-10 bg-[#0c3935] rounded-full flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                    <Plus className={`w-5 h-5 text-emerald-50 transition-transform duration-300 ${isModalOpen ? 'rotate-45' : ''}`} />
                </div>
            </button>
        </div>
    );
}
