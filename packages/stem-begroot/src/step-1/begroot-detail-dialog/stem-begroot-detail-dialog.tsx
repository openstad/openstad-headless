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

          return (
            <>
              <div className="osc-begrootmodule-resource-detail">
                <section className="osc-begrootmodule-resource-detail-photo">

                  <Carousel
                    items={(Array.isArray(resource.images) && resource.images.length > 0) ? resource.images : [{ url: 'https://dummyimage.com/600x400/f4f4f4/f4f4f4' }]}
                    itemRenderer={(i) => (
                      <Image src={i.url} />
                    )}
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
                        <Heading1>{resource.title}</Heading1>
                        <Paragraph className="strong">{resource.summary}</Paragraph>
                        <Paragraph>{resource.description}</Paragraph>
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
