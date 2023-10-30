// oud, voor referentie

'use strict';

import OpenStadComponent from '../../component/index.jsx';

export default class OpenStadComponentNumberplates extends OpenStadComponent {

  constructor(props) {

    super(props, {
      number: 0,
    });

    this.state = {
      number: this.config.number,
    };

  }

  updateNumber(value) {
    this.setState({ number: value });
  }

  render() {

    let self = this;

    let numberHTML = [];

    let number = parseInt(typeof self.props.number != 'undefined' ? self.props.number : self.state.number);
    number = number.toString();

    let len = number.length;
    if (len < 3) len = 3;
    number = ('000' + number).slice(-len);
    
    for (let i = 0; i < number.length; i++) {
      let inverseCount = number.length - i - 1;
      numberHTML.push((
        <div id={'osc-numberplate-'+inverseCount} className="osc-numberplate" key={'osc-numberplate-'+i}>{number.charAt(i)}</div>
      ))
    }

    return (
      <div id={self.divId} className={self.props.className || 'osc-numberplates'} ref={el => self.instance = el} >
        {numberHTML}
      </div>
    );

  }

}
