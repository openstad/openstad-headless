import loadWidget from '../lib/load-widget';
import IdeaDetails from './idea-details';

import './css/default.less'; // add css to result - TODO: dit moet beter

IdeaDetails.loadWidget = loadWidget;

export {
  IdeaDetails as default,
  IdeaDetails,
};
