import loadWidget from '../lib/load-widget';
import IdeasFilter from './ideas-filter';

import './css/default.less'; // add css to result - TODO: dit moet beter

IdeasFilter.loadWidget = loadWidget;

export {
  IdeasFilter as default,
  IdeasFilter,
};
