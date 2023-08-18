// ik denk dat er wat asyncs weg kunnen: hij retrund promises en dat is ok

import fetch from './fetch';
import idea from './idea';
import comments from './comments';
import user from './user';

window.OpenStadAPI = null;
export default function singelton(props = { config: {} }) {
  return window.OpenStadAPI = window.OpenStadAPI || new API(props);
}

function API(props = { config: {} }) {

  let self = this;

  self.apiUrl = props.apiUrl || props.config.api?.url || null;
  self.projectId = props.projectId || props.config.projectId || 0;

  self.fetch = fetch;
    
  self.idea = {
    fetch: idea.fetch.bind(self),
    update: idea.update.bind(self),
  }

  self.comments = {
    fetch: comments.fetch.bind(self),
    update: comments.update.bind(self),
    delete: comments.delete.bind(self),
  }

  self.user = {
    fetch:  user.fetch.bind(self),
  }
  
};

