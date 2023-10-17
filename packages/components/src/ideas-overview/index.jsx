import loadWidget from '../lib/load-widget';
import IdeasOverview from './ideas-overview';

import './css/default.less'; // add css to result - TODO: dit moet beter

IdeasOverview.loadWidget = loadWidget;

export {
  IdeasOverview as default,
  IdeasOverview,
};
