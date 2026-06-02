import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './index.css';

type LightboxProps = {
  src: string;
  alt?: string;
  onClose: () => void;
};

export const Lightbox = ({ src, alt = '', onClose }: LightboxProps) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return createPortal(
    <div className="osc-lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Afbeelding uitvergroot">
      <button className="osc-lightbox-close" onClick={onClose} aria-label="Sluiten">
        ✕
      </button>
      <img
        className="osc-lightbox-image"
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body
  );
};
