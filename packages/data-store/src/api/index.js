import fetchx from './fetch';
import resource from './resource';
import comments from './comments';
import resources from './resources';
import choicesguide from "./choicesguide";
import tags from './tags';
import user from './user';
import area from './area';
import datalayer from './datalayer';
import widget from './widget';
import areas from './areas';
import userVote from './user-vote';
import submissions from './submissions';
import commentsByProject from './commentsByProject';
import choiceGuideResults from './choiceGuideResults';
import userActivity from './user-activity';

const windowGlobal = typeof window !== "undefined" ? window : {};

windowGlobal.OpenStadAPI = null;
export default function singelton(props = { config: {} }) {
  return (windowGlobal.OpenStadAPI = windowGlobal.OpenStadAPI || new API(props));
}

export function getApiFetchMethodNames() {
  const apiInstance = new API({ logMethods: true });
  const apiFetchMethodNames = [];

  for (const key of Object.keys(apiInstance)) {
    const value = apiInstance[key];
    if (value && typeof value === 'object' && 'fetch' in value) {
      apiFetchMethodNames.push(key);
    }
  }

  return apiFetchMethodNames;
}

function API(props = {}) {
  let self = this;

  self.apiUrl = props.apiUrl || props.api?.url || null;
  self.projectId = props.projectId || 0;

  self.fetch = fetchx.bind(self);

  self.choiceGuideResults = {
    fetch: choiceGuideResults.fetch.bind(self)
  }

  self.comments = {
    fetch: comments.fetch.bind(self),
    create: comments.create.bind(self),
    update: comments.update.bind(self),
    delete: comments.delete.bind(self),
    submitLike: comments.submitLike.bind(self),
  };

  self.commentsByProject = {
    fetch: commentsByProject.fetch.bind(self)
  }

  self.resource = {
    fetch: resource.fetch.bind(self),
    update: resource.update.bind(self),
    delete: resource.delete.bind(self),
    submitLike: resource.submitLike.bind(self),
  };

  self.resources = {
    fetch: resources.fetch.bind(self),
    delete: resources.delete.bind(self),
    create: resources.create.bind(self),
    submitLike: resources.submitLike.bind(self)
  };

  self.choicesguide = {
    fetch: choicesguide.fetch.bind(self),
    create: choicesguide.create.bind(self)
  };

  self.submissions = {
    fetch: submissions.fetch.bind(self),
    create: submissions.create.bind(self)
  }

  self.tags = {
    fetch: tags.fetch.bind(self),
    create: tags.create.bind(self),
    update: tags.update.bind(self),
    delete: tags.delete.bind(self),
  };

  self.area = {
    fetch: area.fetch.bind(self),
  };

  self.datalayer = {
    fetch: datalayer.fetch.bind(self),
  };

  self.widget = {
    fetch: widget.fetch.bind(self),
  };

  self.areas = {
    fetch: areas.fetch.bind(self),
  };

  self.user = {
    fetch: user.fetch.bind(self),
    fetchMe: user.fetchMe.bind(self),
    connectUser: user.connectUser.bind(self),
    update: user.update.bind(self),
    logout: user.logout.bind(self),
  };

  self.userVote = {
    fetch: userVote.fetch.bind(self),
    submitVote: userVote.submitVote.bind(self),
  };

  self.userActivity = {
    fetch: userActivity.fetch.bind(self),
  };

  if (props.logMethods) {
    return self;
  }
}
