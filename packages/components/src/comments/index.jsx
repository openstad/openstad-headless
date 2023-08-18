import loadWidget from '../lib/load-widget';
import Comments from './comments';

// import '../css/default.less'; // add css to result - TODO: dit moet beter

Comments.loadWidget = loadWidget;

export {
  Comments as default,
  Comments,
};
