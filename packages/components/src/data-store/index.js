import mergeData from './merge-data';
import { useSWRConfig } from 'swr';
import useSWR from 'swr';
import API from './api';
import useIdea from './hooks/use-idea.ts';
import useComments from './hooks/use-comments.js';
import useIdeas from './hooks/use-ideas.ts';
import useTags from './hooks/use-tags.ts';
import useCurrentUser from './hooks/use-current-user.js';

window.OpenStadSWR = window.OpenStadSWR || {}; // keys used, for forced updates

export default function DataStore(props = { config: {} }) {
  let self = this;
  self.api = API(props);
  self.projectId = props.projectId || props.config?.projectId;

  // hooks
  self.useIdea = useIdea.bind(self);
  self.useComments = useComments.bind(self);
  self.useIdeas = useIdeas.bind(self);
  self.useTags = useTags.bind(self);
  self.useCurrentUser = useCurrentUser.bind(self);

  // current user
  const [currentUser, currentUserError, currentUserIsLoading] =
    self.useCurrentUser({ ...props, projectId: self.projectId });
  self.currentUser = currentUser;

  // swr
  self.createKey = function (props, fetcherAsString) {
    let type = fetcherAsString;
    type = type.replace(/^([^.]*).*$/, '$1');
    return { type, ...props };
  };

  self.useSWR = function (props, fetcherAsString) {
    let fetcher = eval(`self.api.${fetcherAsString}`);
    let key = self.createKey(props, fetcherAsString);

    window.OpenStadSWR[JSON.stringify(key, null, 2)] = true;

    return useSWR(key, fetcher, {
      keepPreviousData: true,
    });
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

    return await mutate(key, fetcher(key, newData, options), {
      ...defaultOptions,
      ...options,
    });

    // return mutate( // mutate other caches; idea taken from https://koba04.medium.com/organize-swr-cache-with-tag-33d5b1aac3bd
    //   cacheKey => cacheKey != key && cacheKey.type == key.type,
    //   currentData => mergeData(currentData, newData),
    //   { revalidate: false } // meybe true? or option?
    // );
  };

  self.refresh = function () {
    mutate(
      (cacheKey) =>
        Object.keys(window.OpenStadSWR).indexOf(
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
