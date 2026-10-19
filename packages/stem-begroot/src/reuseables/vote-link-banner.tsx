import { Icon } from '@openstad-headless/ui/src';
import '@utrecht/component-library-css';
import {
  LinkButton,
  Paragraph,
  Strong,
} from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React from 'react';

import { VoteLinkOutcome, voteLinkMessage } from '../utils/resource-vote-link';
import './vote-link-banner.css';

export type VoteLinkResult = {
  outcome: VoteLinkOutcome;
  resource?: { id: number; title?: string } | null;
};

export const VoteLinkBanner = ({
  result,
  voteType,
  onOpenResource,
}: {
  result: VoteLinkResult | null;
  voteType: string;
  onOpenResource?: () => void;
}) => {
  const title = result?.resource?.title || '';
  const showTitle = !!result && result.outcome !== 'notFound' && !!title;

  return (
    // Rendered while empty too: screen readers only announce changes to an
    // existing live region.
    <div className="stem-begroot-vote-link" role="status" aria-live="polite">
      {result ? (
        <div
          className={`stem-begroot-vote-link-banner stem-begroot-vote-link-banner--${result.outcome}`}>
          <Icon
            icon="ri-information-line"
            iconOnly
            className="stem-begroot-vote-link-banner-icon"
          />
          <Paragraph className="stem-begroot-vote-link-banner-text">
            {showTitle ? (
              <>
                Je hebt een stemlink geopend van de inzending{' '}
                {onOpenResource ? (
                  <LinkButton
                    inline
                    className="stem-begroot-vote-link-banner-title"
                    aria-haspopup="dialog"
                    onClick={onOpenResource}>
                    {title}
                  </LinkButton>
                ) : (
                  <Strong>{title}</Strong>
                )}
                . {voteLinkMessage(result.outcome, voteType)}
              </>
            ) : (
              voteLinkMessage('notFound', voteType)
            )}
          </Paragraph>
        </div>
      ) : null}
    </div>
  );
};
