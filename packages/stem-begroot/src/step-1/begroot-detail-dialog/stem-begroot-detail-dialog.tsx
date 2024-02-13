import './stem-begroot-detail-dialog.css';

import React from 'react';
import {
  IconButton,
  Image,
  SecondaryButton,
  Spacer,
} from '@openstad-headless/ui/src';

import { Carousel } from '@openstad-headless/ui/src';

import { Dialog } from '@openstad-headless/ui/src';

export const StemBegrootResourceDetailDialog = ({
  openDetailDialog,
  setOpenDetailDialog,
  resourceDetailIndex,
  resources,
  selectedResources,
  onPrimaryButtonClick,
  maxBudget,
  budgetUsed,
}: {
  openDetailDialog: boolean;
  setOpenDetailDialog: (condition:boolean) => void;
  resources: Array<any>;
  selectedResources: Array<any>;
  onPrimaryButtonClick: (resource: any) => void;
  maxBudget: number;
  budgetUsed: number;
  resourceDetailIndex: number;
}) => (
  <Dialog
    open={openDetailDialog}
    onOpenChange={setOpenDetailDialog}
    children={
      <Carousel
        startIndex={resourceDetailIndex}
        items={resources && resources.length > 0 ? resources : []}
        itemRenderer={(resource) => {
          const theme = resource.tags
            ?.filter((t: any) => t.type === 'theme')
            ?.at(0);
          const area = resource.tags
            ?.filter((t: any) => t.type === 'area')
            ?.at(0);

          const itemIsInSelectedList = selectedResources.find(
            (r) => r.id === resource.id
          );

          const canUseButton =
            itemIsInSelectedList ||
            (!selectedResources.find((r) => r.id === resource.id) &&
              resource.budget < maxBudget - budgetUsed);

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
                      disabled={!canUseButton}
                      onClick={() => {
                        onPrimaryButtonClick;
                        onPrimaryButtonClick && onPrimaryButtonClick(resource);
                      }}>
                      {itemIsInSelectedList
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
        }}></Carousel>
    }
  />
);