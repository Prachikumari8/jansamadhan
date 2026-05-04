
import React from 'react';

interface CustomPinProps {
  className?: string;
  color?: string;
  size?: number;
}

export const CustomPin: React.FC<CustomPinProps> = ({ 
  className = "", 
  color = "currentColor", 
  size = 24 
}) => {
  return (
    <svg 
      width={size} 
      height={size * 1.16} 
      viewBox="0 0 24 28" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Circle */}
      <circle 
        cx="12" 
        cy="10" 
        r="9" 
        stroke={color} 
        strokeWidth="2.5" 
      />
      {/* Inner Circle */}
      <circle 
        cx="12" 
        cy="10" 
        r="4.5" 
        stroke={color} 
        strokeWidth="2.5" 
      />
      {/* Triangular Tail - Precise tip at 12,28 */}
      <path 
        d="M12 28L6.5 17.5H17.5L12 28Z" 
        fill={color} 
      />
    </svg>
  );
};

export const getPinSvgString = (color: string) => `
  <svg width="40" height="48" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="10" r="9" stroke="${color}" stroke-width="2.5" />
    <circle cx="12" cy="10" r="4.5" stroke="${color}" stroke-width="2.5" />
    <path d="M12 28L6.5 17.5H17.5L12 28Z" fill="${color}" />
  </svg>
`;
