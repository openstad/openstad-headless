import loadWidget from '../lib/load-widget';
import Button from './button';

import './css/default.less'; // add css to result - TODO: dit moet beter

Button.loadWidget = loadWidget;

export {
  Button as default,
  Button,
};

