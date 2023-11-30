import 'remixicon/fonts/remixicon.css';
import { ProgressBar } from '@openstad-headless/ui/src';
import SessionStorage from '../../lib/session-storage.js';
import DataStore from '@openstad-headless/data-store/src';
import React, { useState } from 'react';
import './likes.css';
import loadWidget from '../../lib/load-widget.js';
import hasRole from '../../lib/has-role';

type Props = {
  projectId?: string;
  resourceId?: string;
  apiUrl?: string;
  config: {
    projectId?: string;
    resourceId?: string;
    api?: {
      url: string;
    };
    votesNeeded?: number;
    votes: {
      isActive: boolean;
      requiredUserRole: string;
      voteType: string;
      voteValues: Array<{
        label: string;
        value: string;
      }>;
    };
    login: {
      url: string;
    };
  };
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
}: Props) {
  const necessaryVotes = props?.config?.votesNeeded || 50;

  const datastore = new DataStore(props);
  const session = new SessionStorage(props);

  const [currentUser] = datastore.useCurrentUser(props);
  const [resource] = datastore.useResource(props);
  const [isBusy, setIsBusy] = useState(false);
  const supportedLikeTypes: Array<{
    type: 'yes' | 'no';
    label: string;
    icon: string;
  }> = [
    { type: 'yes', label: yesLabel, icon: 'ri-thumb-up-line' },
    { type: 'no', label: noLabel, icon: 'ri-thumb-down-line' },
  ];

  async function doVote(e, value) {
    if (e) e.stopPropagation();

    if (isBusy) return;
    setIsBusy(true);

    if (!props.config.votes.isActive) {
      return;
    }

    if (
      !currentUser.role ||
      !hasRole(currentUser, props.config.votes.requiredUserRole)
    ) {
      // login
      session.set('osc-resource-vote-pending', { [resource.id]: value });
      return (document.location.href = props.config.login.url);
    }

    let change = {};
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
              className={`like-option  ${
                hideCounters ? 'osc-no-counter' : ''
              }`}>
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
                    {resource[likeVariant.type] && resource[likeVariant.type] < 10
                      ? resource[likeVariant.type].toString().padStart(2, '0')
                      : resource[likeVariant.type] ||
                        (0).toString().padStart(2, '0')}
                  </p>
                </section>
              ) : null}
            </div>
          ))}
        </div>

        {!props?.config?.votesNeeded ? null : (
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

export { Likes as default, Likes };
