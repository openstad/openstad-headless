import '../index.css';
import './index.css';
import React from 'react';

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    errors?: string;
    info?: string;
  }
) {
  return (
    <>
      <input
        type="text"
        {...props}
        className={`input ${props.errors ? 'alert' : null} ${props.className}`}
      />

      {props.errors ? (
        <>
          <p className={`helptext error`}>
            <i className="ri-alert-fill" />
            {props.errors}
          </p>
        </>
      ) : null}
      {props.info && !props.errors ? (
        <p className={`helptext`}>
          <i className="ri-error-warning-fill" />
          {props.info}
        </p>
      ) : null}
    </>
  );
}
