import loadWidget from '../lib/load-widget';
import Form from './form';

import './css/default.less'; // add css to result - TODO: dit moet beter

Form.loadWidget = loadWidget;

export {
  Form as default,
  Form,
};
