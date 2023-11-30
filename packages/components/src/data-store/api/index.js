import fetchx from './fetch';
import resource from './resource';
import comments from './comments';
import resources from './resources';
import tags from './tags';
import user from './user';
import userVote from './user-vote';

window.OpenStadAPI = null;
export default function singelton(props = { config: {} }) {
  return window.OpenStadAPI = window.OpenStadAPI || new API(props);
}

function API(props = { config: {} }) {

  let self = this;

  self.apiUrl = props.apiUrl || props.config.api?.url || null;
  self.projectId = props.projectId || props.config.projectId || 0;

  self.fetch = fetchx.bind(self);

  self.comments = {
    fetch: comments.fetch.bind(self),
    create: comments.create.bind(self),
    update: comments.update.bind(self),
    delete: comments.delete.bind(self),
    submitLike: comments.submitLike.bind(self),
  }
    
  self.resource = {
    fetch: resource.fetch.bind(self),
    update: resource.update.bind(self),
    submitLike: resource.submitLike.bind(self),
  }

  self.resources = {
    fetch: resources.fetch.bind(self),
  }

  self.tags = {
    fetch: tags.fetch.bind(self),
    create: tags.create.bind(self),
    update: tags.update.bind(self),
    delete: tags.delete.bind(self),
  }

  self.user = {
    fetch: user.fetch.bind(self),
    fetchMe: user.fetchMe.bind(self),
    connectUser: user.connectUser.bind(self),
  }

  self.userVote = {
    fetch: userVote.fetch.bind(self),
    submitVote: userVote.submitVote.bind(self),
  }
  
};

