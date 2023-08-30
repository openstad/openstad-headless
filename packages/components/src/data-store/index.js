import mergeData from './merge-data';
import { useEffect } from "react"
import { useSWRConfig } from "swr"
import useSWR from 'swr';
import API from './api';
import useIdea from './hooks/use-idea.js';
import useComments from './hooks/use-comments.js';
import useUser from './hooks/use-user.js';

window.OpenStadSWR = window.OpenStadSWR || {}; // keys used, for forced updates

export default function DataStore(props = { config: {} }) {
  
  let self = this;
  self.api = new API(props);
  self.projectId = props.projectId || props.config?.projectId;

  // hooks
  self.useIdea = useIdea.bind(self);
  self.useComments = useComments.bind(self);
  self.useUser = useUser.bind(self);

  // current user
  const [ user, userError, userIsLoading ] = self.useUser({ ...props, projectId: self.projectId });
  self.currentUser = user;

  // swr
  self.createKey = function(props, fetcherAsString) {
    let type = fetcherAsString;
    type = type.replace(/^([^.]*).*$/, '$1');
    return { type, ...props };
  }

  self.useSWR = function(props, fetcherAsString) {

    let fetcher = eval(`self.api.${fetcherAsString}`);
    let key = self.createKey(props, fetcherAsString);

    window.OpenStadSWR[ JSON.stringify(key, null, 2) ] = true;

    return useSWR(key, fetcher, {
      keepPreviousData: true,
    });

  }

  const { mutate } = useSWRConfig();
  self.mutate = async function(props, fetcherAsString, newData, options) { // TODO: meesturen mutate options

    let fetcher = eval(`self.api.${fetcherAsString}`);
    let key = self.createKey(props, fetcherAsString);

    let defaultOptions = {
      optimisticData: currentData => mergeData(currentData, newData, options.action),
      populateCache: (newData, currentData) => mergeData(currentData, newData, options.action),
      revalidate: false,
      rollbackOnError: true,
    }

    await mutate(key, fetcher(key, newData), { ...defaultOptions, ...options });

    return mutate( // mutate other caches; idea taken from https://koba04.medium.com/organize-swr-cache-with-tag-33d5b1aac3bd
      cacheKey => cacheKey != key && cacheKey.type == key.type,
      currentData => mergeData(currentData, newData),
      { revalidate: false } // meybe true? or option?
    );


  }

  self.refresh = function() {
    mutate(
      cacheKey => Object.keys(window.OpenStadSWR).indexOf( JSON.stringify(cacheKey, null, 2) ) != -1,
      async currentData => currentData, // optimistic ui as fetcher
      {
        revalidate: true,
        rollbackOnError: true,
      }
    );
  }
  

}



