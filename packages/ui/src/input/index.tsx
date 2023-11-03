import '../index.css';
import './index.css';
import React from 'react';

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { errors?: string }
) {
  return (
    <input type="text" {...props} className={`input ${props.className}`} />
  );
}
