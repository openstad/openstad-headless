import merge from 'merge';
import { useState, useEffect } from 'react';

// TODO: op verzoek van Daan; gaan we dat gebruiken?
// TODO: dit moet, sort of, passen op NLDS
import { cva } from "class-variance-authority";
const commentVariants = cva(
  "osc-error-component osc-error inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        icon: "w-10 hover:bg-foreground/10",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-12 py-4 px-4",
        sm: "h-10 px-2",
        lg: "h-14 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Error = function(props) {

  props = merge.recursive({}, {
    message: '',
  }, props.config || {config: {}},  props);

  const [ message, setMessage ] = useState(props.message);

  let errorHTML = null;
  if (message) {
    console.log(message);
    errorHTML = <div className="osc-error-block">{message}</div>
  }

  // listen to events
  useEffect(() => {
    let errorListener = function(event) {
      console.log(event.detail);
      setMessage(event.detail.message)
    }
    document.addEventListener('osc-error', errorListener);
    return () => {
      document.removeEventListener('osc-error', errorListener);
    };
  }, []);
  
  return (
    <div id={props.config.divId} className={commentVariants({ variant: props.variant, size: props.size, className: props.className })}>
      {errorHTML}
    </div>
  );

}

export default Error;
