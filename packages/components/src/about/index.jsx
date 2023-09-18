import loadWidget from '../lib/load-widget';
import About from './about';

import './css/default.less'; // add css to result - TODO: dit moet beter

About.loadWidget = loadWidget;

export {
  About as default,
  About
  ,
};
