import merge from 'merge';

import './css/default.less'; // add css to result - TODO: dit moet beter

const Loading = function( props ) {

  props = merge.recursive({}, {
    title: 'Ideas overview',
  }, props.config,  props);

  return (
    <div className="osc-loading">Loading...</div>
  );

}

export {
  Loading as default,
  Loading,
};
