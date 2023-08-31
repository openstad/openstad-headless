import merge from 'merge';
import { useState, useRef, useEffect } from 'react';
import HTMLArea from './htmlarea';

import './css/input-with-counter.less'; // add css to result - TODO: dit moet beter

// TODO: ik denk dat hij met HTML area niet meer werkt omdat de value niet goed wordt doorgegeven

const InputWithCounter = function( props ) {

  props = merge.recursive({}, {
		name: 'tekst',
		inputType: 'input',
		minLength: 5,
		maxLength: 1024,
    placeholder: '',
  }, props.config,  props);

  const [currentValue, setCurrentValue] = useState(props.value || props.defaultValue || '');
  const [focused, setFocused] = useState(props.focused || false);
  const [valid, setIsValid] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const inputRef = useRef(null);

	function isValid() {
		let state = {};
		state.isValid = true;
		state.warning = null;
		if (currentValue.length < props.minLength) {
// xxx
			state.warning = `De tekst is te kort`;
			state.isValid = false;
		}
		if (currentValue.length > props.maxLength) {
			state.warning = `De tekst is te lang`;
			state.isValid = false;
		}
		this.setState(state)
		return state.isValid;
  }

	function validate() {
		this.setState({ showWarning: true })
		return this.isValid();
	}
  
	function handleOnChange({name, value}) {
    setCurrentValue(value);
		setIsValid(value.length >= props.minLength && value.length <= props.maxLength);
		if (typeof props.onChange == 'function') {
			props.onChange({ name, value });
		}
	}

	function onInputFocus() {
		setFocused(true);
		setShowWarning(false);
	}

	function onInputBlur() {
		setFocused(false);
	}
  
	let counter = null;
	let warning = null;
	if (focused) {
		if (currentValue.length < props.minLength) {
			counter = (<div className="osc-form-counter osc-form-error">Nog minimaal <span className="">{props.minLength - currentValue.length}</span> tekens</div>)
		} else {
			let error = currentValue.length > props.maxLength ? 'osc-form-error' : '';
			counter = (<div className={'osc-form-counter ' + error}>Je hebt nog <span className="">{props.maxLength - currentValue.length}</span> tekens over.</div>)
		}
	}

	if (showWarning && warning) {
		warning = (<div className="osc-form-warning" ref={ el => this['form-warning'] = el  }>{warning}</div>)
	}

  let inputHTML = null;
  switch(props.inputType) {
      
    case 'htmlarea':
      inputHTML = (
        <HTMLArea
          value={currentValue}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          onChange={handleOnChange}
        />
      );
      break;
      
    case 'textarea':
      inputHTML = (
				<textarea ref={inputRef} value={currentValue} disabled={props.disabled} placeholder={props.placeholder} onChange={e => handleOnChange({ name: props.name, value: e.target.value })} onFocus={e => onInputFocus(e)} onBlur={e => onInputBlur(e)}></textarea>
      );
      break;

    case 'input':
    default:
      inputHTML = (
				<input ref={inputRef} value={currentValue} disabled={props.disabled} placeholder={props.placeholder} onChange={e => handleOnChange({ name: props.name, value: e.target.value })} onFocus={e => onInputFocus(e)} onBlur={e => onInputBlur(e)}></input>
      );

  }
	
  return (
		<div id={self.id} ref={el => (self.instance = el)} className="osc-input-with-counter">
      <input type="hidden" name={props.name} value={currentValue}/>
			<div className="osc-form-feedback">
				{inputHTML}
				{counter}
				{warning}
			</div>
		</div>
  );
  
}

export default InputWithCounter;
