import React from 'react';
import './index.css';
export declare function Icon({ text, description, icon, variant, iconOnly, onClick, className, }: {
    text?: string;
    icon: string;
    description?: string;
    variant?: 'small' | 'regular' | 'big';
    iconOnly?: boolean;
    onClick?: () => void;
    className?: string;
}): React.JSX.Element;
