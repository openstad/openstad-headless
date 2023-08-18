// import 'whatwg-fetch'; // polyfill - todo: moet dit nog?
import './css/default.less'; // add css to result
import loadWidget from '../lib/load-widget';
import { useState, useEffect, useCallback } from 'react';

const Button = function( props ) {

  // todo: default config

  // const [ xxx, setXxx ] = useState( props.config?.xxx );

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
  let label = props.label || props.config?.label;
  if (label) {
    labelHTML = <div className="osc-button-label"><div className="osc-elipsis">{label}</div></div>
  }

  let url = props.url || props.config?.url;
  let onClick = props.onClick;
  if (url) {
    onClick = () => document.location.href = url;
  }
  if (onClick) className += ' osc-button-clickable'

  let disabled = props.disabled;
  if (disabled) className += ' osc-disabled';

  // console.log('----------');
  // console.log(onClick);
  
  return (
    <div id={props.config?.divId} onClick={onClick} className={className} role="link" tabIndex="0">
      {numberplatesHTML}
      {iconHTML}
      {labelHTML}
    </div>
  );

}

Button.loadWidget = loadWidget;

export {
  Button as default,
  Button,
};
