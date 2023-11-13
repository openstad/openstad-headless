import loadWidget from '../lib/load-widget';
import ParticipativeBudgeting from './participative-budgeting';

import './css/default.less'; // add css to result - TODO: dit moet beter

ParticipativeBudgeting.loadWidget = loadWidget;

export {
  ParticipativeBudgeting as default,
  ParticipativeBudgeting,
};
