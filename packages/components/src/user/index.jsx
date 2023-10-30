import loadWidget from '../lib/load-widget';
import User from './user';

import './css/default.less'; // add css to result - TODO: dit moet beter

User.loadWidget = loadWidget;

export {
  User as default,
  User,
};
