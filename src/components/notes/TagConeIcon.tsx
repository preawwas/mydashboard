'use client';

import React from 'react';

const TAG_ICON_FACE_COLOR = '#FCDD9D';

interface TagConeIconProps {
    size?: number;
    className?: string;
}

const TagConeIcon: React.FC<TagConeIconProps> = ({ size = 18, className }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 36 36"
            className={className}
            aria-hidden="true"
        >
            <g>
                {/* Left Ear */}
                <path
                    d="M 8.5 14 C 6 10.5 10 8.5 12.5 10 C 14.5 11.2 14.5 14 13 15"
                    fill={TAG_ICON_FACE_COLOR}
                    stroke="#231F20"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Right Ear */}
                <path
                    d="M 27.5 14 C 30 10.5 26 8.5 23.5 10 C 21.5 11.2 21.5 14 23 15"
                    fill={TAG_ICON_FACE_COLOR}
                    stroke="#231F20"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                
                {/* Inner Ears */}
                <circle cx="10.8" cy="12.2" r="1.8" fill="#231F20" />
                <circle cx="25.2" cy="12.2" r="1.8" fill="#231F20" />
                
                {/* Face */}
                <path
                    d="M 13 15.5
                       C 10 16.2 7.2 19 7 22
                       C 6.8 25.5 9.5 28.5 12 29.8
                       C 15 31.2 21 31.2 24 29.8
                       C 26.5 28.5 29.2 25.5 29 22
                       C 28.8 19 26 16.2 23 15.5
                       C 19.5 14.5 16.5 14.5 13 15.5 Z" 
                    fill={TAG_ICON_FACE_COLOR}
                    stroke="#231F20"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                
                {/* Eyes */}
                <circle cx="14" cy="21.5" r="1.2" fill="#231F20" />
                <circle cx="22" cy="21.5" r="1.2" fill="#231F20" />
                
                {/* Nose/Mouth */}
                <ellipse cx="18" cy="23" rx="1.5" ry="1.1" fill="#231F20" />
                <path
                    d="M 16.8 24.2 C 17.2 25 18.8 25 19.2 24.2"
                    fill="none"
                    stroke="#231F20"
                    strokeWidth="1"
                    strokeLinecap="round"
                />
                
                {/* Cheeks */}
                <ellipse cx="11.2" cy="23.2" rx="2.2" ry="1.6" fill="#E08E97" opacity="0.85" />
                <ellipse cx="24.8" cy="23.2" rx="2.2" ry="1.6" fill="#E08E97" opacity="0.85" />
            </g>
        </svg>
    );
};

export default TagConeIcon;