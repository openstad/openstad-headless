import React from 'react';
import 'remixicon/fonts/remixicon.css';

export function Icon({ text, icon }: { text?: string; icon: string }) {
  return (
    <section className="osc-2-icon">
      <i className={icon}></i>
      <p>{text}</p>
    </section>
  );
}
