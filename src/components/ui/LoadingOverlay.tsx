'use client';
import React, { useEffect, useState } from 'react';
import styles from './LoadingOverlay.module.css';

interface LoadingOverlayProps {
    isVisible?: boolean;
    isLoading?: boolean;
}

export function LoadingOverlay({ isVisible = true, isLoading = true }: LoadingOverlayProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isVisible || !mounted) return null;

    return (
        <div className={styles['fluffy-overlay']}>
            <div className={styles['content']}>
                <span className={`${styles['text']} ${isLoading ? styles['text-loading'] : ''}`}>
                    fluffy-ty
                </span>
                <span className={styles['heart-wrap']}>
                    <svg
                        className={styles['heart-svg']}
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="strokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ff6b9d" />
                                <stop offset="50%" stopColor="#ffffff" />
                                <stop offset="100%" stopColor="#ff6b9d" />
                            </linearGradient>
                        </defs>
                        {/* White filled heart */}
                        <path
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                               2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
                               C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
                               c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                            fill="#ff6b9d"
                        />
                        {/* Animated border stroke */}
                        <path
                            className={isLoading ? styles['heart-stroke'] : ''}
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                               2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
                               C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
                               c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                            fill="none"
                            stroke={isLoading ? "url(#strokeGrad)" : "#ff6b9d"}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                    </svg>
                </span>
            </div>
        </div>
    );
}
