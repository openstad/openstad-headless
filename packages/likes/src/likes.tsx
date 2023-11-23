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
};

function Likes({ title = 'Likes', variant = 'large', ...props }: Props) {
  const necessaryVotes = props?.config?.votesNeeded || 50;

  const datastore = new DataStore(props);
  const session = new SessionStorage(props);

  const [currentUser] = datastore.useCurrentUser(props);
  const [idea] = datastore.useIdea(props);
  const [isBusy, setIsBusy] = useState(false);

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
    <div
      className={`like-widget-container ${variant}`}
      onClick={(e) => doVote(e, 'yes')}>
      <h5 className="like-widget-title">{title}</h5>
      <div className="like-option-container">
        <div className={`like-option`}>
          <section className="like-kind">
            <i className="ri-thumb-up-line"></i>
            {variant === 'small' ? null : <div>Voor</div>}
          </section>

          <section className="like-counter">
            <p>
              {idea.yes && idea.yes < 10
                ? idea.yes.toString().padStart(2, '0')
                : idea.yes || (0).toString().padStart(2, '0')}
            </p>
          </section>
        </div>
        <div className={`like-option`} onClick={(e) => doVote(e, 'no')}>
          <section className="like-kind">
            <i className="ri-thumb-down-line"></i>
            {variant === 'small' ? null : <div>Tegen</div>}
          </section>

          <section className="like-counter">
            <p>
              {idea.no < 10
                ? idea.no.toString().padStart(2, '0')
                : idea.no || (0).toString().padStart(2, '0')}
            </p>
          </section>
        </div>
      </div>

      <div className="progressbar-container">
        <ProgressBar progress={(idea.yes / necessaryVotes) * 100} />
        <p className="progressbar-counter">
          {idea.yes || 0} /{necessaryVotes}
        </p>
      </div>
    </div>
  );
}

Likes.loadWidget = loadWidget;

export { Likes as default, Likes };
