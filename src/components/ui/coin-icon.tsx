
import React from 'react';

interface CoinIconProps {
  className?: string;
}

export const CoinIcon: React.FC<CoinIconProps> = ({ className = "h-4 w-4" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        fill="currentColor" 
        className="text-yellow-500"
      />
      <circle 
        cx="12" 
        cy="12" 
        r="8" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        className="text-yellow-600"
      />
      <path 
        d="M9 12h6M12 9v6" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        className="text-yellow-800"
      />
    </svg>
  );
};
