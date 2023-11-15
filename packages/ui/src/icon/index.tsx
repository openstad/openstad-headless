import React from 'react';
import 'remixicon/fonts/remixicon.css';
import './index.css';

export function Icon({ text, icon }: { text?: string; icon: string }) {
  return (
    <div className="osc-2-icon">
      <i className={icon}></i>
      <p>{text}</p>
    </div>
  );
}
