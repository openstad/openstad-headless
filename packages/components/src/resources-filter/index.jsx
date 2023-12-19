import loadWidget from '../lib/load-widget';
import ResourcesFilter from './resources-filter';

import './css/default.less'; // add css to result - TODO: dit moet beter

ResourcesFilter.loadWidget = loadWidget;

export {
  ResourcesFilter as default,
  ResourcesFilter,
};
