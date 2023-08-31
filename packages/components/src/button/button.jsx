import merge from 'merge';
import { useState, useEffect, useCallback } from 'react';

import { cva } from "class-variance-authority";
const commentVariants = cva(
  'osc-button-component',
  {
    variants: {
      variant: {
        default: '',
        clickable: 'osc-button-clickable'
      },
      size: {
        default: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = function( props ) {

  props = merge.recursive({}, {
    button: 'button', 
    disabled: false,
  }, props.config,  props);

  // todo: dit moet passen op NLDS
  let className = 'osc-button-component' + [ props.className ? ` ${props.className}` : '' ];

  let number = parseInt(props.number);
  let numberplatesHTML = null;
  if (number || number === 0) {
    className += ' osc-numberplate-button'
    //numberplatesHTML = (<OpenStadComponentNumberplates number={number} ref={(el) => { self.numberplates = el; }}/>);
  }
  
  let iconHTML = null;
  let icon = props.icon;
  if (icon) {
    className += ' osc-icon-button'
    iconHTML = <div className="osc-icon"><img src={icon.url} style={{ width: icon.width, height: icon.height, marginTop: icon.top, marginLeft: icon.left }}/></div>
  }

  let labelHTML = null;
  let label = props.label || props.children;
  if (label) {
    labelHTML = <div className="osc-button-label"><div className="osc-elipsis">{label}</div></div>
  }
  
  let url = props.url;
  let onClick = props.onClick;
  if (url) {
    onClick = () => document.location.href = url;
  }
  if (onClick) className += ' osc-button-clickable'

  let disabled = props.disabled;
  if (disabled) className += ' osc-disabled'; // todo: cva

  let isClickable = !disabled && !( props.type == 'button' && !onClick );

  return (
    <button type={props.type} onClick={onClick} id={props.divId} className={commentVariants({ variant: props.variant || isClickable ? 'clickable' : 'default', size: props.size, className: props.className })} disabled={disabled} role="link" tabIndex="0">
      {numberplatesHTML}
      {iconHTML}
      {labelHTML}
    </button>
  );

}

export default Button;

