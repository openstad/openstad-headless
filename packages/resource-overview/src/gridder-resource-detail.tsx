import React from 'react';
import {
  IconButton,
  Image,
  Pill,
  SecondaryButton,
  Spacer,
} from '@openstad-headless/ui/src';
import './gridder-resource-detail.css';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Button, Heading1, Heading4, Heading5, Paragraph } from "@utrecht/component-library-react";
export const GridderResourceDetail = ({
  resource,
  onRemoveClick,
  isModerator = false,
  loginUrl = '',
}: {
  resource: any;
  onRemoveClick?: (resource: any) => void;
  isModerator?: boolean;
  loginUrl?: string;
}) => {
  // When resource is correctly typed the we will not need :any
  const theme = resource.tags?.filter((t: any) => t.type === 'theme')?.at(0);
  const area = resource.tags?.filter((t: any) => t.type === 'area')?.at(0);
  let defaultImage = '';

  if (Array.isArray(resource?.tags)) {
    const sortedTags = resource.tags.sort((a, b) => a.name.localeCompare(b.name));
    const tagWithImage = sortedTags.find(tag => tag.defaultResourceImage);
    defaultImage = tagWithImage?.defaultResourceImage || '';
  }

  return (
    <>
      <div className="osc-gridder-resource-detail">
        <section className="osc-gridder-resource-detail-photo">
          <Image
            src={resource.images?.at(0)?.url || defaultImage}
            style={{ aspectRatio: 16 / 9 }}
          />
          {/* <div>
            <button className="osc-load-map-button"></button>
          </div> */}

          <div className="osc-gridder-resource-detail-budget-theme-bar">
            <Heading4>Budget</Heading4>
            <Paragraph>&euro; {resource.budget > 0 ? resource.budget.toLocaleString('nl-NL') : 0}</Paragraph>
            <Spacer size={1} />
            <Heading4>Tags</Heading4>
            <Spacer size={.5} />
            <div className="pill-grid">
                  {(resource.tags as Array<{ type: string; name: string }>)
                    ?.filter((t) => t.type !== 'status')
                    ?.map((t) => <Pill text={t.name} />)}
                </div>
          </div>
        </section>

        <section className="osc-gridder-resource-detail-texts-and-actions-container">
          <div>
            <div>
              <Heading1>{resource.title}</Heading1>
              <Paragraph className="strong">{resource.summary}</Paragraph>
              <Paragraph>{resource.description}</Paragraph>
            </div>
          </div>
          <Spacer size={2} />
          <div className="osc-gridder-resource-detail-actions">
            <Button
              appearance="primary-action-button"
              disabled={!isModerator && !loginUrl}
              onClick={() => {
                if (!isModerator) {
                  document.location.href = loginUrl;
                } else {
                  if (confirm("Deze actie verwijderd de resource"))
                    onRemoveClick && onRemoveClick(resource);
                }
              }}>
              {isModerator ? 'Verwijder' : 'Inloggen'}
            </Button>
          </div>
        </section>
      </div>

      <Spacer size={2} />
    </>
  );
};
