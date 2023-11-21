import './index.css';
import '../index.css';
import React from 'react';

export function Banner(
  props: React.HTMLAttributes<HTMLDivElement> & { big?: boolean }
) {
  return (
    <div
      {...props}
      className={`osc osc-banner ${props.big ? 'big' : ''} ${props.className}`}>
      {props.children}
    </div>
  );
}
