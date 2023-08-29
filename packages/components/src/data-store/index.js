import { useEffect } from "react"
import { useSWRConfig } from "swr"
import useSWR from 'swr';
import API from './api';
import useIdea from './hooks/use-idea.js';
import useComments from './hooks/use-comments.js';
import useUser from './hooks/use-user.js';

window.OpenStadSWRKeys = window.OpenStadSWRKeys || {}; // keys used, for forced updates

export default function DataStore(props = { config: {} }) {
  
  let self = this;
  self.api = new API(props);
  self.projectId = props.projectId || props.config?.projectId;

  // hooks
  self.useIdea = useIdea.bind(self);
  self.useComments = useComments.bind(self);
  self.useUser = useUser.bind(self);

  // current user
  const [ user, setuser, commentsError, commentsIsLoading ] = self.useUser({ ...props, projectId: self.projectId });
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

    window.OpenStadSWRKeys[ JSON.stringify(key, null, 2) ] = true;
    
    return useSWR(key, fetcher);
  }

  const { mutate } = useSWRConfig();
  self.mutate = function(props, fetcherAsString, newData, options) { // TODO: meesturen mutate options

    let fetcher = eval(`self.api.${fetcherAsString}`);
    let key = self.createKey(props, fetcherAsString);

    let defaultOptions = {
      optimisticData: currentData => currentData, // todo: merge newData; dat moet net asls in populate
      populateCache: (newData, oldData) => {

        console.log('POPULATE', newData, oldData);

        if (Array.isArray(oldData)) { // dit is nogal ruk geschreven en moet ovendien, zoals hierboven gemeld, in de use-comments

          console.log(newData);

          if (newData.created) {
            let result = [ ...oldData ];
            result.push(newData.created);
            return result
          }

          if (newData.deleted) {
            let index = oldData.findIndex( elem => elem.id == newData.deleted.id );
            let result = [ ...oldData ];
            if (index != -1) result.splice(index,1)
            console.log('===', index, result);
            return result;
          }

          if (newData.updated) {
            let index = oldData.findIndex( elem => elem.id == newData.updated.id );
            let result = [ ...oldData ];
            if (index != -1) result[index] = newData.updated
            return result
          }
          
        } else {
          // todo: crud zoals hierboven
          return { ...oldData, ...newData }; // gebruik merge?
        }
      },
      revalidate: false,
      rollbackOnError: true,
    }
    
    mutate(key, fetcher(key, newData), { ...defaultOptions, ...options });

  }

  self.refresh = function() {
    mutate(
      key => Object.keys(window.OpenStadSWRKeys).indexOf( JSON.stringify(key, null, 2) ) != -1,
      async data => data, // optimistic ui as fetcher
      {
        revalidate: true,
        rollbackOnError: true,
      })
  }
  

}

