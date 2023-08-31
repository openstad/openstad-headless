import merge from 'merge';
import { useState, useRef, useEffect } from 'react';

import './css/htmlarea.less'; // add css to result - TODO: dit moet beter

const HTMLArea = function( props ) {

  props = merge.recursive({}, {
  }, props.config,  props);

  const [currentValue, setCurrentValue] = useState(props.value || props.defaultValue || '');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.innerHTML = currentValue;
  }, []);

  function filterHTML(value) {
    value = value.replace(/<(\/?\s*(?:a [^>]+|a|b|i|strong|em|p|div|br|ul|li)\s*\/?)>/g, "[[[$1]]]");
    value = value.replace(/<[^>]+>/g, "");
    value = value.replace(/\[\[\[([^\]]+)\]\]\]/g, "<$1>");
    return value;
  }

  function onKeyUp() {
    let value = inputRef.current.innerHTML;
    value = filterHTML(value);
    setCurrentValue(value)
    if (props.onChange) {
			props.onChange({ name: props.name, value });
    }
  }

  function executeAction(e, command, args) {
    e.preventDefault()
    e.stopPropagation();
    document.execCommand(command,false,args);
    onKeyUp();
  }
  
  function onFocus(e) {
    if (props.onFocus) {
      props.onFocus(e);
    }
  }

  function onBlur(e) {
    if (props.onBlur) {
      props.onBlur(e);
    }
    if (props.onChange) {
			props.onChange({ name: props.name, value: currentValue });
    }
  }

  return (
    <div className="osc-htmlarea">
      <input type="hidden" name={props.name} value={currentValue}/>
      <div className="osc-htmlarea-buttons">
        <div className="osc-htmlarea-button osc-htmlarea-button-bold" onMouseDown={e => executeAction(e, 'bold')}>&nbsp;</div>
        <div className="osc-htmlarea-button osc-htmlarea-button-italic" onMouseDown={e => executeAction(e, 'italic')}>&nbsp;</div>
        <div className="osc-htmlarea-button osc-htmlarea-button-insertunorderedlist" onMouseDown={e => executeAction(e, 'insertunorderedlist')}>&nbsp;</div>
        <div className="osc-htmlarea-button osc-htmlarea-button-createlink" onMouseDown={e => executeAction(e, 'createlink', prompt('Lank naar','http://'))}>&nbsp;</div>
      </div>
      <div className="osc-htmlarea-content" contentEditable={true} onFocus={ e => onFocus(e)} onBlur={ e => onBlur(e)} onKeyUp={ e => onKeyUp(e)} ref={inputRef}/>
    </div>
  );

}

export default HTMLArea;
