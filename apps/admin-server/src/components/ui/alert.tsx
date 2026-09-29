import React, { ReactNode } from 'react';

type AlertProps = {
  variant?: string;
  className?: string;
  children?: ReactNode;
};

export function Alert({
  variant = 'info',
  className = '',
  children,
}: AlertProps) {
  const color =
    variant === 'warning'
      ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
      : variant === 'error'
        ? 'bg-red-100 border-red-400 text-red-800'
        : 'bg-blue-100 border-blue-400 text-blue-800';
  return (
    <div className={`border-l-4 p-4 mb-4 ${color} ${className}`}>
      {children}
    </div>
  );
}

// Known issue: callers pass className, but it is not applied.
type AlertPartProps = { children?: ReactNode; className?: string };

export function AlertTitle({ children }: AlertPartProps) {
  return <div className="font-bold mb-1">{children}</div>;
}

export function AlertDescription({ children }: AlertPartProps) {
  return <div>{children}</div>;
}
