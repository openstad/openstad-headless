import './stem-begroot-detail-dialog.css';

import React from 'react';
import {
  Icon,
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
  onPrimaryButtonClick,
  resourceBtnTextHandler,
  resourceBtnEnabled,
  defineOriginalUrl,
  displayPriceLabel,
  displayRanking,
  showVoteCount,
  showOriginalResource,
  originalResourceUrl,
}: {
  openDetailDialog: boolean;
  setOpenDetailDialog: (condition: boolean) => void;
  resources: Array<any>;
  onPrimaryButtonClick: (resource: any) => void;
  resourceDetailIndex: number;
  defineOriginalUrl: (resource: any) => string | null;
  resourceBtnTextHandler: (resource: any) => string;
  resourceBtnEnabled: (resource: any) => boolean;
  displayPriceLabel: boolean;
  displayRanking: boolean;
  showVoteCount: boolean;
  showOriginalResource: boolean;
  originalResourceUrl?: string;
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

          const canUseButton = resourceBtnEnabled(resource);
          const primaryButtonText = resourceBtnTextHandler(resource);
          const originalUrl = defineOriginalUrl(resource);

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
                      {displayPriceLabel ? (
                        <h5>&euro; {resource.budget || 0}</h5>
                      ) : null}

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

                      <Spacer size={1} />

                      {originalUrl ? (
                        <>
                          <p className="strong">
                            Dit een vervolg op het volgende plan:&nbsp;
                            <a target="_blank" href={originalUrl}>
                            {originalUrl}
                          </a>
                          </p>
                         
                        </>
                      ) : null}

                      <div className="osc-stem-begroot-content-item-footer">
                        {showVoteCount ? (
                          <>
                            <Icon
                              icon="ri-thumb-up-line"
                              variant="regular"
                              text={resource.yes}
                            />
                            <Icon
                              icon="ri-thumb-down-line"
                              variant="regular"
                              text={resource.no}
                            />
                          </>
                        ) : null}

                        {displayRanking ? (
                          <Icon
                            icon="ri-trophy-line"
                            variant="regular"
                            text={resource.extraData?.ranking || 0}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <Spacer size={1}/>
                  <div className="osc-begrootmodule-resource-detail-actions">
                    <SecondaryButton
                      disabled={!canUseButton}
                      onClick={() => {
                        onPrimaryButtonClick;
                        onPrimaryButtonClick && onPrimaryButtonClick(resource);
                      }}>
                      {primaryButtonText}
                    </SecondaryButton>
                    {/* <div className="osc-begrootmodule-resource-detail-share-actions">
                      <p className="strong">Deel dit:</p>
                      <IconButton className="plain" icon="ri-facebook-fill" />
                      <IconButton className="plain" icon="ri-whatsapp-fill" />
                      <IconButton className="plain" icon="ri-mail-fill" />
                      <IconButton className="plain" icon="ri-twitter-x-fill" />
                    </div> */}
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
