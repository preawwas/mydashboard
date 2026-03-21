'use client';

import React from 'react';

interface TagConeIconProps {
    circleColor: string;
    size?: number;
    className?: string;
}

const TagConeIcon: React.FC<TagConeIconProps> = ({ circleColor, size = 18, className }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 36 36"
            className={className}
            aria-hidden="true"
        >
            <g>
                <circle cx="18" cy="25.2" r="8.9" fill={circleColor} stroke="#231F20" strokeWidth="1.8" />
                <circle cx="14.7" cy="24.2" r="1.1" fill="#231F20" />
                <circle cx="18.5" cy="24.6" r="1.1" fill="#231F20" />

                <path
                    d="M17.2 4.6C17.6 3.3 19.4 3.3 19.8 4.6L24.8 17.5C25.1 18.3 24.5 19.1 23.7 19.1H13.3C12.5 19.1 11.9 18.3 12.2 17.5L17.2 4.6Z"
                    fill="#FF846B"
                    stroke="#231F20"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
                <path
                    d="M14.1 11.2H22.9L21.7 14.5H15.3L14.1 11.2Z"
                    fill="#F7F4F0"
                />
                <path
                    d="M4.5 19.4L18 14.4L31.5 19.4C32.4 19.7 32.8 20.7 32.3 21.5C32.1 22 31.5 22.2 30.9 22.2H5.1C4.5 22.2 3.9 22 3.7 21.5C3.2 20.7 3.6 19.7 4.5 19.4Z"
                    fill="#FF846B"
                    stroke="#231F20"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
            </g>
        </svg>
    );
};

export default TagConeIcon;