import loadWidget from '../lib/load-widget';
import ResourceDetails from './resource-details';

import './css/default.less'; // add css to result - TODO: dit moet beter

ResourceDetails.loadWidget = loadWidget;

export {
  ResourceDetails as default,
  ResourceDetails,
};
