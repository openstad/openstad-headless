import mergeData from './merge-data';
import { useSWRConfig } from 'swr';
import useSWR from 'swr';
import API from './api';
import useResource from './hooks/use-resource.js';
import useChoicesguide from './hooks/use-choicesguide';
import useArea from './hooks/use-area.js';
import useDatalayer from './hooks/use-datalayer.js';
import useAreas from './hooks/use-areas.js';
import useComments from './hooks/use-comments.js';
import useResources from './hooks/use-resources.js';
import useTags from './hooks/use-tags.js';
import useCurrentUser from './hooks/use-current-user.js';
import useUserVote from './hooks/use-user-vote.js';
import useSubmissions from './hooks/use-submissions.js';
import useCommentsByProject from './hooks/use-comments-by-project';
import useChoiceGuideResults from './hooks/use-choiceguide-results';
import useUserActivity from './hooks/use-user-activity';
import useWidget from "./hooks/use-widget";

const windowGlobal = typeof window !== 'undefined' ? window : {};

windowGlobal.OpenStadSWR = windowGlobal.OpenStadSWR || {}; // keys used, for forced updates

function DataStore(props = {}) {
  let self = this;
  self.api = new API(props);
  self.projectId = props.projectId;

  // hooks
  self.useResource = useResource.bind(self);
  self.useChoicesguide = useChoicesguide.bind(self);
  self.useComments = useComments.bind(self);
  self.useResources = useResources.bind(self);
  self.useArea = useArea.bind(self);
  self.useDatalayer = useDatalayer.bind(self);
  self.useAreas = useAreas.bind(self);
  self.useTags = useTags.bind(self);
  self.useCurrentUser = useCurrentUser.bind(self);
  self.useUserVote = useUserVote.bind(self);
  self.useSubmissions = useSubmissions.bind(self);
  self.useCommentsByProject = useCommentsByProject.bind(self);
  self.useChoiceGuideResults = useChoiceGuideResults.bind(self);
  self.useUserActivity = useUserActivity.bind(self);
  self.useWidget = useWidget.bind(self);

  // current user
  const {
    data: currentUser,
    error: currentUserError,
    isLoadingLcurrentUserIsLoading,
  } = self.useCurrentUser({ ...props, projectId: self.projectId });

  self.currentUser = currentUser;

  // swr
  self.createKey = function (props, fetcherAsString) {
    let type = fetcherAsString;
    type = type.replace(/^([^.]*).*$/, '$1');
    return { type, ...props };
  };

  self.useSWR = function (props, fetcherAsString, options = {}) {
    const fetcherPath = fetcherAsString.split('.');
    let fetcher = self.api;
    
    // fetcherAsString can be a path to a fetcher function, e.g. 'resources.fetch'
    // if so, we need to traverse the api object to find the fetcher function
    if (fetcherPath.length > 1) {
      for (let i = 0; i < fetcherPath.length; i++) {
        if (!fetcher[fetcherPath[i]]) {
          throw new Error(`uswSWF: fetcher ${fetcherAsString} not found`);
        }
        fetcher = fetcher[fetcherPath[i]];
      }
    // otherwise, fetcherAsString is the name of the fetcher function and we use that directly
    } else {
      fetcher = self.api[fetcherAsString];
    }
    
    let key = self.createKey(props, fetcherAsString);

    windowGlobal.OpenStadSWR[JSON.stringify(key, null, 2)] = true;

    return useSWR(key, () =>
      fetcher(props, { ...options, keepPreviousData: true })
    );
  };

  const { mutate } = useSWRConfig();
  self.mutate = async function (props, fetcherAsString, newData, options) {
    // TODO: meesturen mutate options

    let fetcher = eval(`self.api.${fetcherAsString}`);
    let key = self.createKey(props, fetcherAsString);

    let defaultOptions = {
      optimisticData: (currentData) =>
        mergeData(currentData, newData, options.action),
      revalidate: false,
      rollbackOnError: true,
    };
    if (options.action != 'fetch' && options.revalidate != true) {
      defaultOptions.populateCache = (newData, currentData) =>
        mergeData(currentData, newData, options.action);
    }

    if (newData?.parentId) {
      // currently for comments: replies are subobjects and SWR can't handle that
      defaultOptions.revalidate = true;
    }

    return await mutate(key, fetcher(key, newData, options), {
      ...defaultOptions,
      ...options,
    });

    // return mutate( // mutate other caches; resource taken from https://koba04.medium.com/organize-swr-cache-with-tag-33d5b1aac3bd
    //   cacheKey => cacheKey != key && cacheKey.type == key.type,
    //   currentData => mergeData(currentData, newData),
    //   { revalidate: false } // meybe true? or option?
    // );
  };

  self.refresh = function () {
    mutate(
      (cacheKey) =>
        Object.keys(windowGlobal.OpenStadSWR).indexOf(
          JSON.stringify(cacheKey, null, 2)
        ) != -1,
      async (currentData) => currentData, // optimistic ui as fetcher
      {
        revalidate: true,
        rollbackOnError: true,
      }
    );
  };
}

export { DataStore as default, DataStore };
