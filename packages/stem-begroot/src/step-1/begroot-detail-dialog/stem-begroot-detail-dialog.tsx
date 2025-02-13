import './stem-begroot-detail-dialog.css';

import React, { useState } from 'react';
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
  areaId,
  statusIdsToLimitResourcesTo = [],
  sort = '',
  allTags = [],
  tags = [],
  activeTagTab = '',
  voteType = 'likes',
  typeSelector = 'tag',
  setFilteredResources,
  filteredResources = [],
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
  statusIdsToLimitResourcesTo?: Array<any>;
  tagIdsToLimitResourcesTo?: Array<any>;
  sort?: string;
  allTags?: Array<any>;
  tags?: Array<any>;
  activeTagTab?: string;
  typeSelector?: string;
  voteType?: string;
  setFilteredResources?: (resources: Array<any>) => void;
  filteredResources?: Array<any>;
}) => {
  // @ts-ignore
  const intTags = tags.map(tag => parseInt(tag, 10));
  const [carouselIndexSetter, setCarouselIndexSetter] = useState<((index: number) => void) | null>(null);

  const groupedTags: { [key: string]: number[] } = {};

  intTags.forEach((tagId: any) => {
    // @ts-ignore
    const tag = allTags.find(tag => tag.id === tagId);
    if (tag) {
      const tagType = tag.type;
      if (!groupedTags[tagType]) {
        groupedTags[tagType] = [];
      }
      groupedTags[tagType].push(tagId);
    }
  });

  const filtered = resources && (
    Object.keys(groupedTags).length === 0
      ? resources
      : resources.filter((resource: any) => {
        return Object.keys(groupedTags).every(tagType => {
          return groupedTags[tagType].some(tagId =>
            resource.tags && Array.isArray(resource.tags) && resource.tags.some((o: { id: number }) => o.id === tagId)
          );
        });
      })
  )
    ?.filter((resource: any) => {
      if (voteType === 'countPerTag' || voteType === 'budgetingPerTag') {
        if (typeSelector === 'tag') {
          return resource.tags.some((tag: { name: string }) => tag.name === activeTagTab);
        } else {
          return resource.tags.some((tag: { type: string }) => tag.type === activeTagTab);
        }
      }
      return true;
    })
    ?.filter((resource: any) =>
      (!statusIdsToLimitResourcesTo || statusIdsToLimitResourcesTo.length === 0) || statusIdsToLimitResourcesTo.some((statusId) => resource.statuses && Array.isArray(resource.statuses) && resource.statuses.some((o: { id: number }) => o.id === statusId))
    )
    ?.sort((a: any, b: any) => {
      if (sort === 'createdAt_desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sort === 'createdAt_asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sort === 'votes_desc' || sort === 'ranking') {
        return (b.yes || 0) - (a.yes || 0);
      }
      if (sort === 'votes_asc') {
        return (a.yes || 0) - (b.yes || 0);
      }
      if (sort === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  if ( (voteType === 'countPerTag' || voteType === 'budgetingPerTag') && setFilteredResources) {
    if (JSON.stringify(filtered) !== JSON.stringify(filteredResources)) {
      setFilteredResources(filtered);
    }
  }

  const handleBeforeIndexChange = () => {
    if (carouselIndexSetter) {
      carouselIndexSetter(0);
    }
  };

  return (
    <Dialog
      open={openDetailDialog}
      onOpenChange={setOpenDetailDialog}
      className="begrootmodule-dialog"
      children={
        <Carousel
          startIndex={resourceDetailIndex}
          buttonText={{next: 'Volgende inzending', previous: 'Vorige inzending'}}
          items={filtered || []}
          beforeIndexChange={handleBeforeIndexChange}
          itemRenderer={(resource) => {
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

            if (resource?.location) {
              resourceImages.push({location: resource?.location});
            }

            if (Array.isArray(resource?.images) && resource?.images.length > 0) {
              resourceImages = [...resource?.images, ...resourceImages];
            }

            let hasImages = '';

            if (resourceImages.length === 0) {
              resourceImages = [{url: defaultImage || ''}];

              if (!defaultImage) {
                hasImages = 'resource-has-no-images';
              }
            }

            return (
              <>
                <div className="osc-begrootmodule-resource-detail">
                  <section className={`osc-begrootmodule-resource-detail-photo ${hasImages}`}>

                    <Carousel
                      items={resourceImages}
                      buttonText={{next: 'Volgende afbeelding', previous: 'Vorige afbeelding'}}
                      setIndexInParent={setCarouselIndexSetter}
                      itemRenderer={(i) => {
                        if (i.url) {
                          return <Image src={i.url}/>
                        } else if (resource?.location) {
                          return <ResourceDetailMap
                            resourceId={resource?.id}
                            {...resource}
                            center={resource?.location}
                            map={{'areaId': areaId}}
                          />
                        } else {
                          return <></>;
                        }
                      }}

                    />
                    {/* <div>
                    <Button className="osc-begrootmodule-load-map-button"></Button>
                  </div> */}
                    {isSimpleView === false && (
                      <div className="osc-gridder-resource-detail-budget-theme-bar">
                        <Heading4>Budget</Heading4>
                        <Paragraph>&euro; {resource?.budget > 0 ? resource?.budget?.toLocaleString('nl-NL') : 0}</Paragraph>
                        <Spacer size={1}/>
                        <Heading4>Tags</Heading4>
                        <Spacer size={.5}/>
                        <div className="pill-grid">
                          {(resource?.tags as Array<{ type: string; name: string }>)
                            ?.filter((t) => t.type !== 'status')
                            ?.map((t) => <Pill text={t.name || 'Geen thema'}/>)}
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="osc-begrootmodule-resource-detail-texts-and-actions-container">
                    <div>

                      <div>
                        <div>
                          <Heading1 dangerouslySetInnerHTML={{__html: resource?.title}}/>
                          <Paragraph className="strong" dangerouslySetInnerHTML={{__html: resource?.summary}}/>
                          <Paragraph dangerouslySetInnerHTML={{__html: resource?.description}}/>
                        </div>
                      </div>

                      <Spacer size={2}/>

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
                              text={resource?.yes}
                            />
                            <Icon
                              icon="ri-thumb-down-line"
                              variant="regular"
                              text={resource?.no}
                            />
                          </>
                        ) : null}

                        {displayRanking ? (
                          <Icon
                            icon="ri-trophy-line"
                            variant="regular"
                            text={resource?.extraData?.ranking || 0}
                          />
                        ) : null}
                      </div>
                    </div>
                    <Spacer size={1}/>
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
  )
};
