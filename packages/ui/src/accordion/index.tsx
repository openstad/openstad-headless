import React, { useState } from 'react';
import { AccordionSection } from '@utrecht/component-library-react';
import './index.css';

function Accordion({ content, closeLabel, openLabel, headingLevel = 2, expanded = false }: any) {
  const [open, setOpen] = useState(expanded as boolean);

  const handleActivate = () => {
    setOpen((prev: boolean) => !prev);
  };

  return (
    <AccordionSection
      headingLevel={headingLevel}
      body={''} // Body is not used when children are provided, but required by type
      expanded={open}
      label={open ? closeLabel : openLabel}
      onActivate={handleActivate}
      className="osc-accordion-section"
    >
      {content}
    </AccordionSection>
  );
}

export { Accordion };