import { useEffect } from "react"
import { useSWRConfig } from "swr"
import useSWR from 'swr';
import API from './api';
import useIdea from './use-idea.js';
import useComments from './use-comments.js';
import useUser from './use-user.js';

import SessionStorage from '../lib/session-storage.js';

window.OpenStadSWRKeys = {};

export default function DataStore(props = { config: {} }) {
  
  let self = this;

  self.api = new API(props);

  self.useIdea = useIdea.bind(self);
  self.useComments = useComments.bind(self);
  self.useUser = useUser.bind(self);

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
  self.mutate = function(props, fetcherAsString, newData) { // TODO: meesturen mutate options
    let fetcher = eval(`self.api.${fetcherAsString}`);
    let key = self.createKey(props, fetcherAsString);
    mutate(key, fetcher(key, newData), {
      populateCache: (newData, oldData) => {

        console.log('POPULATE', oldData);
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
      optimisticData: currentData => { console.log('CURRENTDATA', currentData); return currentData; },
      rollbackOnError: true,
    })
  }

  self.unvalidate = function() {
    
  }

  self.apiUrl = props?.apiUrl || props?.config?.api?.url || null;
  self.projectId = props.projectId || props.config?.projectId;
  
  const { data, error, isLoading } = useSWR({ type: 'current-user', projectId: self.projectId }, getCurrentUser);
  self.currentUser = data
  self.api.currentUserJWT;

  async function getCurrentUser() {

    console.log('GETCURRENTUSER', self.currentUser);
    if (self.currentUser) { // just once TODO: ik denk dat het jkan met useSWRmutaion,: als ik het goedlees update die alleen met de hand
      return self.currentUser
    }
    
    const session = new SessionStorage(props)

    // get user from props
    let initialUser = props.openStadUser || props.config.openStadUser || {};
    if (initialUser.id && initialUser.projectId == self.projectId) {
      return initialUser;
    }
    
    const cmsUser = props.cmsUser || props.config.cmsUser || {};

    // get cmsUser from session data - this is a fix for badly written cms logouts
    let sessionCmsUser = session.get('cmsUser') || {};
    if (sessionCmsUser && cmsUser) {
      // compare with current cmsUser
      if (sessionCmsUser.access_token != cmsUser.access_token) {
        // delete exising session cache
        session.remove('cmsUser');
        session.remove('openStadUser');
      }
    }
    session.set('cmsUser', cmsUser);

    // get openStad user from session data
    let sessionUser = session.get('openStadUser') || {};
    
    // use existing jwt
    let jwt = initialUser.jwt || sessionUser.jwt;

    // or get jwt for cmsUser
    if (!jwt && cmsUser && cmsUser.access_token && cmsUser.iss) {

      let data = {
        access_token: cmsUser.access_token,
        iss: `${cmsUser.iss}`,
      }

      let response = await fetch(`${self.apiUrl}/auth/project/${self.projectId}/connect-user?useAuth=oidc`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(data)
      });

      let json = await response.json()
      
      jwt = json.jwt;

    }

    if (jwt) {

      self.api.currentUserJWT = jwt;

      
      console.log('REFRESH');

      mutate(
        key => Object.keys(window.OpenStadSWRKeys).indexOf( JSON.stringify(key, null, 2) ) != -1,
        async data => data, // optimistic ui as fetcher
        {
          revalidate: true,
          rollbackOnError: true,
        })

      let url = `${self.apiUrl}/auth/project/${self.projectId}/me`;
      let headers = { 'X-Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' };

      let response = await fetch(url, { headers })
      let json = await response.json()

      let openStadUser = json;
      if (openStadUser && openStadUser.id) openStadUser = { ...openStadUser, jwt };
      session.set('openStadUser', openStadUser);

      // TODO: delete jwt on error

      return openStadUser;

    } else {
      // self.setCurrentUserId( null );
      return {};
    }

  }

  
}

