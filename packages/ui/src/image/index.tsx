import React, { ReactNode } from 'react';

import '../index.css';
import './index.css';

export function Image({
  imageFooter,
  imageHeader,
  href,
  linkLabel,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  imageFooter?: ReactNode;
  imageHeader?: ReactNode;
  href?: string;
  linkLabel?: string;
}) {
  // ponytail: role=presentation alleen als er geen alt is; anders werd een
  // meegegeven alt door de vaste presentation-rol genegeerd (WCAG 1.1.1)
  const image = (
    <img
      {...props}
      alt={props.alt ? props.alt : ''}
      role={props.alt ? props.role : 'presentation'}
    />
  );

  return (
    <figure
      onClick={props.onClick}
      className={`image-container ${props.className}`}>
      {imageHeader ? (
        <div className="osc-image-header">{imageHeader}</div>
      ) : null}
      {/* ponytail: de link omsluit alleen de afbeelding, niet de figcaption.
          Stond de footer erbinnen, dan werd de statustekst de zichtbare
          linknaam terwijl aria-label iets anders zei (WCAG 2.5.3) */}
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" aria-label={linkLabel}>
          {image}
        </a>
      ) : (
        image
      )}
      {imageFooter && (
        <figcaption className="osc-image-footer">{imageFooter}</figcaption>
      )}
    </figure>
  );
}
