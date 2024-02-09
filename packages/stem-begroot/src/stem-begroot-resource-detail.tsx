import './stem-begroot-resource-detail.css';

import React from 'react';
import {
  IconButton,
  Image,
  SecondaryButton,
  Spacer,
} from '@openstad-headless/ui/src';

export const StemBegrootResourceDetail = ({
  resource,
  onPrimaryButtonClick,
  canAddItem = false,
  isInSelectedResources = false,
}: {
  resource: any;
  onPrimaryButtonClick?: (resource: any) => void;
  isModerator?: boolean;
  loginUrl?: string;
  isInSelectedResources?: boolean;
  canAddItem?: boolean;
}) => {
  // When resource is correctly typed the we will not need :any
  const theme = resource.tags?.filter((t: any) => t.type === 'theme')?.at(0);
  const area = resource.tags?.filter((t: any) => t.type === 'area')?.at(0);

  return (
    <>
      <div className="osc-begrootmodule-resource-detail">
        <section className="osc-begrootmodule-resource-detail-photo">
          <Image
            src={resource.images?.at(0)?.src || ''}
            style={{ aspectRatio: 16 / 9 }}
          />
          <div>
            <button className="osc-begrootmodule-load-map-button"></button>
          </div>
        </section>

        <section className="osc-begrootmodule-resource-detail-texts-and-actions-container">
          <div>
            <div className="osc-begrootmodule-resource-detail-budget-theme-bar">
              <h5>&euro; {resource.budget || 0}</h5>
              <div>
                <p className="strong">Thema:</p>
                <p>{theme?.name || 'Geen thema'}</p>
                <p className="strong">Gebied:</p>
                <p> {area?.name || 'Geen gebied'}</p>
              </div>
            </div>

            <div>
              <h4>{resource.title}</h4>
              <Spacer size={1} />
              <p className="strong">{resource.summary}</p>
              <Spacer size={1} />
              <p>{resource.description}</p>
            </div>
          </div>
          <div className="osc-begrootmodule-resource-detail-actions">
            <SecondaryButton
              disabled={
                !canAddItem && !isInSelectedResources
              }
              onClick={() => {
                onPrimaryButtonClick && onPrimaryButtonClick(resource);
              }}>
              {isInSelectedResources
                ? 'Verwijderen uit budget lijst'
                : 'Toevoegen'}
            </SecondaryButton>
            <div className="osc-begrootmodule-resource-detail-share-actions">
              <p className="strong">Deel dit:</p>
              <IconButton className="plain" icon="ri-facebook-fill" />
              <IconButton className="plain" icon="ri-whatsapp-fill" />
              <IconButton className="plain" icon="ri-mail-fill" />
              <IconButton className="plain" icon="ri-twitter-x-fill" />
            </div>
          </div>
        </section>
      </div>

      <Spacer size={2} />
    </>
  );
};
