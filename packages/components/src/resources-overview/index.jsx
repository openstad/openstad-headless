import loadWidget from '../lib/load-widget';
import ResourcesOverview from './resources-overview';

import './css/default.less'; // add css to result - TODO: dit moet beter

ResourcesOverview.loadWidget = loadWidget;

export {
  ResourcesOverview as default,
  ResourcesOverview,
};
