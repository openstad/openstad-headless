import 'remixicon/fonts/remixicon.css';
import { ProgressBar } from '@openstad-headless/ui/src';
import { SessionStorage } from '@openstad-headless/lib/session-storage';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { hasRole } from '@openstad-headless/lib/has-role';
import DataStore from '@openstad-headless/data-store/src';
import React, { useState } from 'react';
import './likes.css';

type Props = {
  projectId?: string;
  ideaId?: string;
  apiUrl?: string;
  config: {
    projectId?: string;
    ideaId?: string;
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
  const [idea] = datastore.useIdea(props);
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
      session.set('osc-idea-vote-pending', { [idea.id]: value });
      return (document.location.href = props.config.login.url);
    }

    let change = {};
    if (idea.userVote) change[idea.userVote.opinion] = -1;

    await idea.submitLike({
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
                    {idea[likeVariant.type] && idea[likeVariant.type] < 10
                      ? idea[likeVariant.type].toString().padStart(2, '0')
                      : idea[likeVariant.type] ||
                        (0).toString().padStart(2, '0')}
                  </p>
                </section>
              ) : null}
            </div>
          ))}
        </div>

        {!props?.config?.votesNeeded ? null : (
          <div className="progressbar-container">
            <ProgressBar progress={(idea.yes / necessaryVotes) * 100} />
            <p className="progressbar-counter">
              {idea.yes || 0} /{necessaryVotes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

Likes.loadWidget = loadWidget;

export { Likes as default, Likes };
