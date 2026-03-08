'use client';
import React, { useState } from 'react';
import { Lock, Key } from 'lucide-react';

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (password: string) => void;
}

export function PasswordModal({ isOpen, onClose, onSubmit }: PasswordModalProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.toLowerCase() === 'pwsn') {
            onSubmit(password);
            setError(false);
        } else {
            setError(true);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm p-8 rounded-2xl bg-card border border-border shadow-xl mx-4">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-foreground">Verification Required</h2>
                        <p className="text-muted-foreground text-sm">Please enter the access key.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        <div className="relative group">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                autoFocus
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter key..."
                                className={`w-full bg-muted/50 border rounded-xl py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans
                                    ${error ? 'border-destructive' : 'border-border focus:border-primary'}
                                `}
                            />
                        </div>

                        {error && (
                            <p className="text-destructive text-xs font-medium">
                                Incorrect password.
                            </p>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all shadow-sm active:scale-95 text-sm"
                        >
                            Unlock Access
                        </button>
                    </form>

                    <button 
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
