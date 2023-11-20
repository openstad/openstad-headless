import fetchx from './fetch';
import idea from './idea';
import comments from './comments';
import ideas from './ideas';
import tags from './tags';
import user from './user';
import userVote from './user-vote';

window.OpenStadAPI = null;
export default function singelton(props = { config: {} }) {
  return (window.OpenStadAPI = window.OpenStadAPI || new API(props));
}

function API(props = { config: {} }) {
  let self = this;

  self.apiUrl = props.apiUrl || props.config.api?.url || null;
  self.projectId = props.projectId || props.config?.projectId || 0;

  self.fetch = fetchx.bind(self);

  self.comments = {
    fetch: comments.fetch.bind(self),
    create: comments.create.bind(self),
    update: comments.update.bind(self),
    delete: comments.delete.bind(self),
    submitLike: comments.submitLike.bind(self),
  };

  self.idea = {
    fetch: idea.fetch.bind(self),
    update: idea.update.bind(self),
    submitLike: idea.submitLike.bind(self),
  };

  self.ideas = {
    fetch: ideas.fetch.bind(self),
  };

  self.tags = {
    fetch: tags.fetch.bind(self),
    create: tags.create.bind(self),
    update: tags.update.bind(self),
    delete: tags.delete.bind(self),
  };

  self.user = {
    fetch: user.fetch.bind(self),
    fetchMe: user.fetchMe.bind(self),
    connectUser: user.connectUser.bind(self),
  };

  self.userVote = {
    fetch: userVote.fetch.bind(self),
    submitVote: userVote.submitVote.bind(self),
  };
}
