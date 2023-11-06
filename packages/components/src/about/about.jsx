import merge from 'merge';
import { useState, useEffect, useCallback } from 'react';
import DataStore from '../data-store';

// TODO: op verzoek van Daan; gaan we dat gebruiken?
// TODO: dit moet, sort of, passen op NLDS
import { cva } from "class-variance-authority";
const commentVariants = cva(
  "osc-about-component osc-about inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
    },
    defaultVariants: {
    },
  }
);

const About = function(props) {

  props = merge.recursive({}, {
  }, props.config || {},  props);

  const datastore = new DataStore(props);

  let titleHTML = props.title ? props.title : 'About';

  let propsHTML = JSON.stringify(props, null, 2);
  
  return (
    <div id={props.divId} className={commentVariants({ variant: props.variant, size: props.size, className: props.className })}>
      <h2>{titleHTML}</h2>

      <h4>Props</h4>
      <pre>{propsHTML}</pre>

    </div>
  );

}

export default About;
