import React from 'react';

export function Spacer({ size = 1 }: { size?: number }) {
    return <div style={{ marginBottom: `${size}rem` }}></div>;
}