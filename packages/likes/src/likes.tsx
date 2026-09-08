import DataStore from '@openstad-headless/data-store/src';
import { hasRole } from '@openstad-headless/lib';
import NotificationProvider from '@openstad-headless/lib/NotificationProvider/notification-provider';
import NotificationService from '@openstad-headless/lib/NotificationProvider/notification-service';
import { getResourceId } from '@openstad-headless/lib/get-resource-id';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { LocalStorage } from '@openstad-headless/lib/local-storage';
import { sanitizeHtml } from '@openstad-headless/lib/sanitize';
import type { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import {
  ProgressBar,
  fireConfetti,
  headingLevels,
} from '@openstad-headless/ui/src';
import '@utrecht/component-library-css';
import {
  Button,
  Heading,
  Heading5,
  Paragraph,
} from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React, { useEffect, useState } from 'react';

import './likes.css';

export type LikeWidgetProps = BaseProps &
  LikeProps &
  ProjectSettingProps & {
    resourceId?: string;
    resourceIdRelativePath?: string;
    datastore?: any;
    initialResource?: any; // pre-fetched resource data, skips individual API call
    children?:
      | React.ReactNode
      | ((doVote: (value: string) => void, resource?: any) => React.ReactNode);
  };

export type LikeProps = {
  title?: string;
  variant?: 'micro-score' | 'small' | 'medium' | 'large';
  yesLabel?: string;
  noLabel?: string;
  displayDislike?: boolean;
  hideCounters?: boolean;
  showProgressBar?: boolean;
  progressBarDescription?: string;
  titleHeadingLevel?: number | string;
  disabled?: boolean;
  showConfetti?: boolean;
  refreshResourceLikes?: () => void;
};

function Likes({
  title = '',
  variant = 'large',
  hideCounters,
  yesLabel = 'Ja',
  noLabel = 'Nee',
  displayDislike = false,
  showProgressBar = true,
  showConfetti: showConfettiOnLike = false,
  titleHeadingLevel = 4,
  disabled = false,
  refreshResourceLikes,
  ...props
}: LikeWidgetProps) {
  // ponytail: niveau komt uit de admin of van de omringende widget; clamp naar 2-6
  const [hTitle] = headingLevels(titleHeadingLevel);

  let resourceId = String(
    getResourceId({
      resourceId: parseInt(props.resourceId || ''),
      url: document.location.href,
      targetUrl: props.resourceIdRelativePath,
    })
  ); // todo: make it a number throughout the code

  const necessaryVotes = props.resources?.minimumYesVotes || 50;

  const datastore: any =
    props.datastore ||
    new DataStore({
      projectId: props.projectId,
      api: props.api,
    });

  const storage = new LocalStorage({ projectId: props.projectId });

  const { data: currentUser } = datastore.useCurrentUser(props);
  const { data: resource } = datastore.useResource({
    projectId: props.projectId,
    resourceId,
    initialData: props.initialResource,
  });

  const [isBusy, setIsBusy] = useState(false);
  const supportedLikeTypes: Array<{
    type: 'yes' | 'no';
    label: string;
    icon: 'ri-thumb-up-line' | 'ri-thumb-down-line';
    filledIcon: 'ri-thumb-up-fill' | 'ri-thumb-down-fill';
  }> = [
    {
      type: 'yes',
      label: yesLabel,
      icon: 'ri-thumb-up-line',
      filledIcon: 'ri-thumb-up-fill',
    },
    {
      type: 'no',
      label: noLabel,
      icon: 'ri-thumb-down-line',
      filledIcon: 'ri-thumb-down-fill',
    },
  ];

  if (!displayDislike) {
    supportedLikeTypes.pop();
  }

  useEffect(() => {
    let pending = storage.get('osc-resource-vote-pending');
    if (pending && pending[resource.id]) {
      if (currentUser && currentUser.role) {
        doVote(null, pending[resource.id]);
        storage.remove('osc-resource-vote-pending');
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
      storage.set('osc-resource-vote-pending', { [resource.id]: value });
      return (document.location.href = loginUrl);
    }

    let change: { [key: string]: any } = {};
    if (resource.userVote) change[resource.userVote.opinion] = -1;

    const previousOpinion = resource.userVote?.opinion;

    try {
      await resource.submitLike({ opinion: value });

      if (showConfettiOnLike && value === 'yes' && previousOpinion !== 'yes') {
        fireConfetti();
      }

      if (refreshResourceLikes) {
        await refreshResourceLikes();
      }
    } catch (err: any) {
      if (err?.status === 403) {
        NotificationService.addNotification(
          err.message || 'Stemmen is niet gelukt',
          'error'
        );
      }
    } finally {
      setIsBusy(false);
    }
  }

  if (typeof props.children === 'function') {
    return (
      <>
        {props.children((value: string) => doVote(null, value), resource)}
        <NotificationProvider />
      </>
    );
  }

  return (
    <div className="osc">
      <NotificationProvider />
      {variant !== 'micro-score' ? (
        <div className={`like-widget-container ${variant}`}>
          {title ? (
            <Heading level={hTitle} className="like-widget-title">
              {title}
            </Heading>
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
                } like-option--${likeVariant.type} ${hideCounters ? 'osc-no-counter' : ''}`}
                disabled={disabled}
                aria-pressed={resource?.userVote?.opinion === likeVariant.type}>
                <section className="like-kind">
                  <i
                    className={
                      resource?.userVote?.opinion === likeVariant.type
                        ? likeVariant.filledIcon
                        : likeVariant.icon
                    }
                    aria-hidden="true"></i>
                  {variant === 'small' ? (
                    <span className="sr-only">{likeVariant.label}</span>
                  ) : (
                    likeVariant.label
                  )}
                </section>

                {!hideCounters && props.votes?.isViewable ? (
                  <section className="like-counter">
                    {resource[likeVariant.type] &&
                    resource[likeVariant.type] < 10
                      ? resource[likeVariant.type].toString().padStart(2, '0')
                      : resource[likeVariant.type] ||
                        (0).toString().padStart(2, '0')}
                    <span className="sr-only"> stemmen</span>
                  </section>
                ) : null}
              </Button>
            ))}
          </div>

          {props?.resources?.minimumYesVotes &&
          showProgressBar &&
          props.votes?.isViewable ? (
            <div className="progressbar-container">
              <ProgressBar
                progress={(resource.yes / necessaryVotes) * 100}
                aria-label="Likes nodig voor dit voorstel"
              />
              <Paragraph className="progressbar-counter">
                {resource.yes || 0} /{necessaryVotes}
              </Paragraph>
            </div>
          ) : null}

          <div>
            {props?.resources?.minimumYesVotes &&
              showProgressBar &&
              props.progressBarDescription && (
                <Paragraph
                  className="utrecht-heading-6"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(props.progressBarDescription),
                  }}
                />
              )}
          </div>
        </div>
      ) : (
        <div className={`like-widget-container ${variant}`}>
          {title ? (
            <Heading level={hTitle} className="like-widget-title">
              {title}
            </Heading>
          ) : null}

          <div className={`like-option-container`}>
            {supportedLikeTypes.map((likeVariant, index) => (
              <React.Fragment key={`${likeVariant.type}-${index}`}>
                <Button
                  appearance="primary-action-button"
                  onClick={(e) => doVote(e, likeVariant.type)}
                  className={`like-option ${
                    resource?.userVote?.opinion === likeVariant.type
                      ? 'selected'
                      : ''
                  } like-option--${likeVariant.type} ${hideCounters ? 'osc-no-counter' : ''}`}
                  disabled={disabled}
                  aria-pressed={
                    resource?.userVote?.opinion === likeVariant.type
                  }>
                  <section className="like-kind">
                    <i
                      aria-hidden="true"
                      className={`${
                        resource?.userVote?.opinion === likeVariant.type
                          ? 'ri-triangle-fill'
                          : 'ri-triangle-line'
                      } micro-score-triangle ${
                        likeVariant.type === 'no'
                          ? 'micro-score-triangle-down'
                          : ''
                      }`}></i>{' '}
                    <span className="sr-only">{likeVariant.label}</span>
                  </section>
                </Button>
                {!hideCounters && props.votes?.isViewable && index === 0 ? (
                  <section className="like-counter">
                    <span className="sr-only">Score</span>{' '}
                    {resource['netVotes'] ? resource['netVotes'] : '0'}
                  </section>
                ) : null}
              </React.Fragment>
            ))}
          </div>

          {props?.resources?.minimumYesVotes && showProgressBar ? (
            <div className="progressbar-container">
              <ProgressBar
                progress={(resource.netVotes / necessaryVotes) * 100}
                aria-label="Likes nodig voor dit voorstel"
              />
              <Paragraph className="progressbar-counter">
                {resource.netVotes || 0} /{necessaryVotes}
              </Paragraph>
            </div>
          ) : null}

          <div>
            {props?.resources?.minimumYesVotes &&
              showProgressBar &&
              props.progressBarDescription && (
                <Paragraph
                  className="utrecht-heading-6"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(props.progressBarDescription),
                  }}
                />
              )}
          </div>
        </div>
      )}
    </div>
  );
}

Likes.loadWidget = loadWidget;

export { Likes };
