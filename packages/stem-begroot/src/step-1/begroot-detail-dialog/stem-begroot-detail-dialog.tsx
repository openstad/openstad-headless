import './stem-begroot-detail-dialog.css';

import React from 'react';
import {
  Icon,
  IconButton,
  Image,
  Pill,
  SecondaryButton,
  Spacer,
} from '@openstad-headless/ui/src';

import { Carousel } from '@openstad-headless/ui/src';
import { Dialog } from '@openstad-headless/ui/src';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Button, Paragraph, Strong, Link, Heading5, Heading4, Heading1 } from "@utrecht/component-library-react";
import { ResourceDetailMap } from '@openstad-headless/leaflet-map/src/resource-detail-map';

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
  isSimpleView,
  areaId
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
  isSimpleView: boolean;
  areaId: string; 
}) => (
  <Dialog
    open={openDetailDialog}
    onOpenChange={setOpenDetailDialog}
    children={
      <Carousel
        startIndex={resourceDetailIndex}
        buttonText={{ next: 'Volgende inzending', previous: 'Vorige inzending' }}
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

          let defaultImage = '';

          interface Tag {
            name: string;
            defaultResourceImage?: string;
          }

          if (Array.isArray(resource?.tags)) {
            const sortedTags = resource.tags.sort((a: Tag, b: Tag) => a.name.localeCompare(b.name));
            const tagWithImage = sortedTags.find((tag: Tag) => tag.defaultResourceImage);
            defaultImage = tagWithImage?.defaultResourceImage || '';
          }

            let resourceImages: any[] = [];

            if (resource.location) {
                resourceImages.push({ location: resource.location });
            }

            if (Array.isArray(resource.images) && resource.images.length > 0) {
                resourceImages = [...resource.images, ...resourceImages];
            }

            let hasImages = '';

            if (resourceImages.length === 0) {
                resourceImages = [{ url: defaultImage || '' }];
                hasImages = 'resource-has-no-images';
            }

          return (
            <>
              <div className="osc-begrootmodule-resource-detail">
                <section className={`osc-begrootmodule-resource-detail-photo ${hasImages}`}>

                  <Carousel
                    items={resourceImages}
                    buttonText={{ next: 'Volgende afbeelding', previous: 'Vorige afbeelding' }}
                    itemRenderer={(i) => {
                      if (i.url) {
                        return <Image src={i.url} />
                      } else {
                        return <ResourceDetailMap
                          resourceId={resource.id}
                          {...resource}
                          center={resource.location}
                          map={{'areaId': areaId}}
                          />
                      }
                    }}

                  />
                  {/* <div>
                    <Button className="osc-begrootmodule-load-map-button"></Button>
                  </div> */}
                  {isSimpleView === false && (
                    <div className="osc-gridder-resource-detail-budget-theme-bar">
                      <Heading4>Budget</Heading4>
                      <Paragraph>&euro; {resource.budget > 0 ? resource.budget?.toLocaleString('nl-NL') : 0}</Paragraph>
                      <Spacer size={1} />
                      <Heading4>Tags</Heading4>
                      <Spacer size={.5} />
                      <div className="pill-grid">
                        {(resource.tags as Array<{ type: string; name: string }>)
                          ?.filter((t) => t.type !== 'status')
                          ?.map((t) => <Pill text={t.name || 'Geen thema'} />)}
                      </div>
                    </div>
                  )}
                </section>

                <section className="osc-begrootmodule-resource-detail-texts-and-actions-container">
                  <div>

                    <div>
                      <div>
                        <Heading1 dangerouslySetInnerHTML={{__html: resource.title}}/>
                        <Paragraph className="strong" dangerouslySetInnerHTML={{__html: resource.summary}}/>
                        <Paragraph dangerouslySetInnerHTML={{__html: resource.description}}/>
                      </div>
                    </div>

                    <Spacer size={2} />

                    {originalUrl ? (
                      <>
                        <Paragraph className="strong">
                          Dit een vervolg op het volgende plan:&nbsp;
                          <Link target="_blank" href={originalUrl}>
                            {originalUrl}
                          </Link>
                        </Paragraph>

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
                  <Spacer size={1} />
                  <div className="osc-begrootmodule-resource-detail-actions">
                    <Button
                      appearance='primary-action-button'
                      disabled={!canUseButton}
                      onClick={() => {
                        onPrimaryButtonClick;
                        onPrimaryButtonClick && onPrimaryButtonClick(resource);
                      }}>
                      {primaryButtonText}
                    </Button>
                  </div>
                </section>
              </div>

            </>
          );
        }}></Carousel>
    }
  />
);
