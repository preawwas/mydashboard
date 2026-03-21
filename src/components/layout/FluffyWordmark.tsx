'use client';

import React from 'react';

interface FluffyWordmarkProps {
    className?: string;
}

const FluffyWordmark: React.FC<FluffyWordmarkProps> = ({ className }) => {
    return (
        <svg
            viewBox="0 0 210 68"
            className={className}
            aria-hidden="true"
        >
            <rect x="1" y="1" width="208" height="66" rx="16" fill="#F6E0AE" />

            <text
                x="13"
                y="57"
                fill="#176D3D"
                fontSize="10"
                fontWeight="700"
                letterSpacing="3"
                style={{ fontFamily: '"Bolder Loopless", "Noto Sans Thai", sans-serif' }}
                transform="rotate(-90 13 57)"
            >
                THE FLUFFY
            </text>

            <text
                x="33"
                y="31"
                fill="#176D3D"
                fontSize="34"
                fontWeight="700"
                style={{ fontFamily: '"Strong Bodoni", "Libre Bodoni", serif' }}
            >
                the
            </text>

            <text
                x="92"
                y="41"
                fill="#176D3D"
                fontSize="28"
                fontWeight="900"
                style={{ fontFamily: '"Strong Bodoni", "Libre Bodoni", serif' }}
            >
                *
            </text>

            <text
                x="32"
                y="59"
                fill="#176D3D"
                fontSize="38"
                fontWeight="700"
                letterSpacing="0.5"
                style={{ fontFamily: '"Strong Bodoni", "Libre Bodoni", serif' }}
            >
                Fluffy
            </text>
        </svg>
    );
};

export default FluffyWordmark;