import 'remixicon/fonts/remixicon.css';
import { ProgressBar } from '@openstad-headless/ui/src';
import { SessionStorage } from '@openstad-headless/lib/session-storage';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { hasRole } from '@openstad-headless/lib';
import DataStore from '@openstad-headless/data-store/src';
import React, { useState, useEffect } from 'react';
import './likes.css';
import type { BaseProps } from '../../types/base-props.js';
import type { ProjectSettingProps } from '../../types/project-setting-props.js';

export type LikeWidgetProps = BaseProps &
  LikeProps &
  ProjectSettingProps & {
    resourceId?: string;
  };

export type LikeProps = {
  title?: string;
  variant?: 'small' | 'medium' | 'large';
  yesLabel?: string;
  noLabel?: string;
  hideCounters?: boolean;
};

function Likes({
  title = 'Likes',
  variant = 'large',
  hideCounters,
  yesLabel = 'Voor',
  noLabel = 'Tegen',
  ...props
}: LikeWidgetProps) {
  const urlParams = new URLSearchParams(window.location.search);
  const resourceId =
    urlParams.get('openstadResourceId') || props.resourceId || '';
  const necessaryVotes = props.resources.minimumYesVotes || 50;

  // Pass explicitely because datastore is not ts, we will not get a hint if the props have changed

  const datastore: any = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const session = new SessionStorage({ projectId: props.projectId });

  const [currentUser] = datastore.useCurrentUser(props);
  const [resource] = datastore.useResource({
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

    if (
      (!currentUser.role ||
        !hasRole(currentUser, props.votes.requiredUserRole)) &&
      props.login
    ) {
      // login
      session.set('osc-resource-vote-pending', { [resource.id]: value });
      return (document.location.href = props?.login?.url);
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
        {title ? <h5 className="like-widget-title">{title}</h5> : null}

        <div className={`like-option-container`}>
          {supportedLikeTypes.map((likeVariant, index) => (
            <div
              key={`${likeVariant.type}-${index}`}
              className={`like-option ${
                resource?.userVote?.opinion === likeVariant.type
                  ? 'selected'
                  : ''
              } ${hideCounters ? 'osc-no-counter' : ''}`}>
              <section
                className="like-kind"
                onClick={(e) => doVote(e, likeVariant.type)}>
                <i className={likeVariant.icon}></i>
                {variant === 'small' ? null : (
                  <h6 className="osc-like-variant-label">
                    {likeVariant.label}
                  </h6>
                )}
              </section>

              {!hideCounters ? (
                <section className="like-counter">
                  <p>
                    {resource[likeVariant.type] &&
                    resource[likeVariant.type] < 10
                      ? resource[likeVariant.type].toString().padStart(2, '0')
                      : resource[likeVariant.type] ||
                        (0).toString().padStart(2, '0')}
                  </p>
                </section>
              ) : null}
            </div>
          ))}
        </div>

        {!props?.resources?.minimumYesVotes ? null : (
          <div className="progressbar-container">
            <ProgressBar progress={(resource.yes / necessaryVotes) * 100} />
            <p className="progressbar-counter">
              {resource.yes || 0} /{necessaryVotes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

Likes.loadWidget = loadWidget;

export { Likes };
