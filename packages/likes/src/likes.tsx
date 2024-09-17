import 'remixicon/fonts/remixicon.css';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import {
  Heading5,
  Paragraph,
  Button,
  Heading4,
  Heading6,
} from '@utrecht/component-library-react';
import { ProgressBar } from '@openstad-headless/ui/src';
import { SessionStorage } from '@openstad-headless/lib/session-storage';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { getResourceId } from '@openstad-headless/lib/get-resource-id';
import { hasRole } from '@openstad-headless/lib';
import DataStore from '@openstad-headless/data-store/src';
import React, { useState, useEffect } from 'react';
import './likes.css';
import type { BaseProps, ProjectSettingProps } from '@openstad-headless/types';

export type LikeWidgetProps = BaseProps &
  LikeProps &
  ProjectSettingProps & {
    resourceId?: string;
    resourceIdRelativePath?: string;
  };

export type LikeProps = {
  title?: string;
  variant?: 'small' | 'medium' | 'large';
  yesLabel?: string;
  noLabel?: string;
  displayDislike?: boolean;
  hideCounters?: boolean;
  showProgressBar?: boolean;
  progressBarDescription?: string;
};

function Likes({
  title = '',
  variant = 'large',
  hideCounters,
  yesLabel = 'Voor',
  noLabel = 'Tegen',
  displayDislike = false,
  showProgressBar = true,
  ...props
}: LikeWidgetProps) {

  let resourceId = String(getResourceId({
    resourceId: parseInt(props.resourceId || ''),
    url: document.location.href,
    targetUrl: props.resourceIdRelativePath,
  })); // todo: make it a number throughout the code

  const necessaryVotes = props.resources?.minimumYesVotes || 50;

  // Pass explicitely because datastore is not ts, we will not get a hint if the props have changed

  const datastore: any = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const session = new SessionStorage({ projectId: props.projectId });

  const { data: currentUser } = datastore.useCurrentUser(props);
  const { data: resource } = datastore.useResource({
    projectId: props.projectId,
    resourceId,
  });

  const [isBusy, setIsBusy] = useState(false);
  const supportedLikeTypes: Array<{
    type: 'yes' | 'no';
    label: string;
    icon: string;
  }> = [
    { type: 'yes', label: yesLabel, icon: 'ri-thumb-up-line' },
    { type: 'no', label: noLabel, icon: 'ri-thumb-down-line' },
  ];

  if (!displayDislike) {
      supportedLikeTypes.pop();
  }


  useEffect(() => {
    let pending = session.get('osc-resource-vote-pending');
    if (pending && pending[resource.id]) {
      if (currentUser && currentUser.role) {
        doVote(null, pending[resource.id]);
        session.remove('osc-resource-vote-pending');
      }
    }
  }, [resource, currentUser]);

  async function doVote(
    e: React.MouseEvent<HTMLElement, MouseEvent> | null,
    value: string
  ) {
    if (e) e.stopPropagation();

    if (isBusy) return;
    setIsBusy(true);

    if (!props.votes.isActive) {
      return;
    }

    if (!hasRole(currentUser, props.votes.requiredUserRole)) {
      let loginUrl = props.login?.url || '';
      if (props.votes.requiredUserRole == 'anonymous') {
        loginUrl = props.login?.anonymous?.url || '';
      }
      if (!loginUrl) {
        console.log('Config error: no login url defined');
        return;
      }
      // login
      session.set('osc-resource-vote-pending', { [resource.id]: value });
      return (document.location.href = loginUrl);
    }

    let change: { [key: string]: any } = {};
    if (resource.userVote) change[resource.userVote.opinion] = -1;

    await resource.submitLike({
      opinion: value,
    });

    setIsBusy(false);
  }

  return (
    <div className="osc">
      <div className={`like-widget-container ${variant}`}>
        {title ? (
          <Heading4 className="like-widget-title">{title}</Heading4>
        ) : null}

        <div className={`like-option-container`}>
          {supportedLikeTypes.map((likeVariant, index) => (
            <Button
              appearance="primary-action-button"
              key={`${likeVariant.type}-${index}`}
              onClick={(e) => doVote(e, likeVariant.type)}
              className={`like-option ${
                resource?.userVote?.opinion === likeVariant.type
                  ? 'selected'
                  : ''
              } ${hideCounters ? 'osc-no-counter' : ''}`}>
              <section className="like-kind">
                <i className={likeVariant.icon}></i>
                {variant === 'small' ? null : likeVariant.label}
              </section>

              {!hideCounters ? (
                <section className="like-counter">
                  {resource[likeVariant.type] && resource[likeVariant.type] < 10
                    ? resource[likeVariant.type].toString().padStart(2, '0')
                    : resource[likeVariant.type] ||
                      (0).toString().padStart(2, '0')}
                </section>
              ) : null}
            </Button>
          ))}
        </div>

        {props?.resources?.minimumYesVotes && showProgressBar ? (
          <div className="progressbar-container">
            <ProgressBar progress={(resource.yes / necessaryVotes) * 100} />
            <Paragraph className="progressbar-counter">
              {resource.yes || 0} /{necessaryVotes}
            </Paragraph>
          </div>
        ) : null}

        <div>
          {props?.resources?.minimumYesVotes &&
            showProgressBar &&
            props.progressBarDescription && (
              <Heading6 style={{ textAlign: 'start' }}>
                {props.progressBarDescription}
              </Heading6>
            )}
        </div>
      </div>
    </div>
  );
}

Likes.loadWidget = loadWidget;

export { Likes };
