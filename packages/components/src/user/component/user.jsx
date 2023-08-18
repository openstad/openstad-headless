'use strict';

import merge from 'merge';
import OpenStadComponent from '../../component/index.jsx';
import OpenStadComponentLibs from '../../libs/index.jsx';
import OpenStadComponentButton from '../../button/index.jsx';

export default class OpenStadComponentUser extends OpenStadComponent {

  constructor(props) {

    super(props, {
    });

    this.state = {
      user: this.config.user,

      cmsUser: this.config.cmsUser,
      openStadUser: this.config.openStadUser,
      openStadUserProvidedBy: this.config.openStadUser ? 'CMS' : 'None'
    };

  }

  componentDidMount() {

    let self = this;

    //    self.liveUpdateListener = function(event) {
    //      self.liveUpdates(event.detail);
    //    }
    //		document.addEventListener('osc-choices-guide-live-updates', self.liveUpdateListener);

    console.log('++2');
    if (!self.state.openStadUser) {
      OpenStadComponentLibs.user.getUser({ user: self.config.user, jwt: self.config.jwt, projectId: self.config.projectId, api: self.config.api }, (err, user) => {
        console.log(user);
        if (user && user.id) {
          self.setState({
            openStadUser: user,
            openStadUserProvidedBy: 'Libs.user.getUser'
          }, () => {});
        } else {
          self.fetchOpenStadUser();
        }
      });
    }


  }


  async fetchOpenStadUser() {

    console.log('????');

    let self = this;
    if (self.state.openStadUser) return;

    let openStadUser;
    let cmsUser = self.state.cmsUser;

    if (!cmsUser) return;

    let data = {
      access_token: cmsUser.access_token,
      iss: `${cmsUser.iss}`,
    }
    
    try {
      let response = await fetch(`https://api.os20.nlsvgtr.nl/auth/project/${this.config.projectId}/connect-user?useAuth=${cmsUser.provider}`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        console.log(response);
        throw new Error('Fetch failed')
      }
      openStadUser = await response.json();
      
    } catch(err) {
      console.log(err);
    }
    
    if (openStadUser) {
      // haal de openstad user
      let jwt = openStadUser.jwt;
      if (jwt) {
        try {
          let response = await fetch(`https://api.os20.nlsvgtr.nl/auth/project/${self.config.projectId}/me`, { headers: { 'X-Authorization': 'Bearer ' + jwt } });
          openStadUser = merge.recursive( openStadUser, await response.json(), { jwt } );
		      let customEvent = new CustomEvent('osc-openstad-user-updated', { detail: openStadUser });
		      document.dispatchEvent(customEvent);
        } catch(err) {
          console.log(err);
        }
      }
    }

    self.setState({
      openStadUser,
      openStadUserProvidedBy: 'Component'
    });

  }

  logout(e, provider) {
    let self = this;
    OpenStadComponentLibs.user.logout({}, err => {
      document.location.href = `https://api.os20.nlsvgtr.nl/auth/project/${self.config.projectId}/logout?${provider ? 'useAuth='+provider : ''}&redirectUri=https://oude-component-tester.os20.nlsvgtr.nl/${self.config.projectId}?useAuth=${self.state.openStadUser?.idpUser?.provider}`;
    });
  }

  render() {

    let self = this;

    let className = `osc-user ${self.props.className}`;

    let cmsUser = self.state.cmsUser;
    let cmsUserHTML = null;
    if (cmsUser) {
      cmsUser = JSON.stringify(cmsUser, null, 2);
      cmsUserHTML = (
        <>
          <h3>CMS user</h3>
          <pre>
            {cmsUser}
          </pre>
        </>);
    }

    let openStadUser = self.state.openStadUser
    let openstadUserHTML = null;
    if (openStadUser) {
      let provider = openStadUser.provider;
      openStadUser = JSON.stringify(openStadUser, null, 2);
      openstadUserHTML = (
        <>
          <h3>OpenStad user by {self.state.openStadUserProvidedBy}</h3>
          <pre>
            {openStadUser}
          </pre>
          <OpenStadComponentButton config={{ label: 'Logout OpenStad user' }} onClick={(e) => self.logout(e, provider)}/>
        </>);
    }

    return (
      <div id={self.divId} className={className} role="link" tabIndex="0">
        <h3>User Component</h3>
        {cmsUserHTML}
        {openstadUserHTML}
      </div>
    );

  }

}
