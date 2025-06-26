//components/buttons.tsx
import React from 'react';

interface ButtonProps {
    text: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    color?: 'blue' | 'red' | 'green' | 'gray';
    type?: 'button' | 'submit' | 'reset';
    fullWidth?: boolean;
}

const colorMap: Record<string, string> = {
    blue: `from-blue-500 to-blue-700 hover:from-blue-600 
            hover:to-blue-800 focus:ring-blue-400 rounded-xl cursor-pointer`,
    red: `from-red-500 to-red-700 hover:from-red-600 
            hover:to-red-800 focus:ring-red-400 rounded-xl cursor-pointer`,
    green: `from-green-500 to-green-700 hover:from-green-600 
            hover:to-green-800 focus:ring-green-400 rounded-xl cursor-pointer`,
    gray: `from-gray-500 to-gray-700 hover:from-gray-600 
            hover:to-gray-800 focus:ring-gray-400 rounded-xl cursor-pointer`,
};

export const AppButton: React.FC<ButtonProps> = ({
    text, onClick, icon, color = 'blue',
    type = 'button', fullWidth = true }) => {
    return (
        <button
            type={type} onClick={onClick}
            className={`${fullWidth ? 'w-64' : ''} 
                px-4 py-2 text-white rounded flex shadow items-center 
                bg-gradient-to-r ${colorMap[color]} justify-center gap-2 duration-200
                hover:scale-105 focus:ring-2`}
        >
            {text}{icon}
        </button>
    );
};
