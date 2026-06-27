'use client';

import React from 'react';
import styles from './VocabularyNotebookShell.module.css';

interface VocabularyNotebookShellProps {
    title: string;
    subtitle?: string;
    toolbar?: React.ReactNode;
    children: React.ReactNode;
}

export default function VocabularyNotebookShell({
    title,
    subtitle,
    toolbar,
    children,
}: VocabularyNotebookShellProps) {
    return (
        <div className={styles.scene}>
            <div className={styles.sceneBackdrop} aria-hidden="true" />

            <div className={styles.stampFrame}>
                <div className={styles.stampEdge} aria-hidden="true" />

                <div className={styles.notebook}>
                    <section className={styles.leftPage} aria-label="Notebook cover page">
                        <div className={styles.leftContent}>
                            <h2 className={styles.handTitle}>{title}</h2>
                            <div className={styles.handUnderline} />
                            {subtitle ? <p className={styles.handSubtitle}>{subtitle}</p> : null}
                        </div>
                    </section>

                    <section className={styles.rightPage} aria-label="Notebook lesson page">
                        <div className={styles.rightContent}>
                            {toolbar ? <div className="mb-4">{toolbar}</div> : null}
                            {children}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
