import loadWidget from '../lib/load-widget';
import Error from './error';

import './css/default.less'; // add css to result - TODO: dit moet beter

Error.loadWidget = loadWidget;

export {
  Error as default,
  Error,
};

