import React from 'react';
import {
  Carousel,
  Icon,
  Image,
  List,
  Pill,
  Spacer,
} from '@openstad-headless/ui/src';

import {elipsizeHTML} from '@openstad-headless/lib/ui-helpers';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Button, Paragraph, Link, Heading5, Heading } from "@utrecht/component-library-react";

export const StemBegrootResourceList = ({
  resources,
  onResourcePlainClicked,
  onResourcePrimaryClicked,
  resourceBtnEnabled,
  resourceBtnTextHandler,
  defineOriginalUrl,
  displayPriceLabel = true,
  displayRanking = true,
  showVoteCount = true,
  resourceListColumns = 3,
  statusIdsToLimitResourcesTo = [],
  sort = '',
  allTags = [],
  tags = [],
  activeTagTab = '',
  voteType = 'likes',
  typeSelector = 'tag',
  setFilteredResources,
  filteredResources = [],
  hideTagsForResources = false,
  hideReadMore = false,
  header
}: {
  resourceListColumns?: number;
  resources: Array<any>;
  selectedResources: Array<any>;
  statusIdsToLimitResourcesTo?: Array<any>;
  tagIdsToLimitResourcesTo?: Array<any>;
  sort?: string;
  onResourcePlainClicked: (resource: any, index: number) => void;
  onResourcePrimaryClicked: (resource: any) => void;
  resourceBtnTextHandler: (resource: any) => string;
  resourceBtnEnabled: (resource: any) => boolean;
  defineOriginalUrl: (resource: any) => string | null;
  displayPriceLabel?: boolean;
  displayRanking?: boolean;
  showVoteCount?: boolean;
  showOriginalResource?: boolean;
  originalResourceUrl?: string;
  allTags?: Array<any>;
  tags?: Array<any>;
  header?: React.JSX.Element;
  activeTagTab?: string;
  typeSelector?: string;
  voteType?: string;
  setFilteredResources?: (resources: Array<any>) => void;
  filteredResources?: Array<any>;
  hideTagsForResources?: boolean;
  hideReadMore?: boolean;
}) => {
  // @ts-ignore
  const intTags = tags.map(tag => parseInt(tag, 10));

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

  return (
    <List
      id='stem-begroot-resource-selections-list'
      columns={resourceListColumns}
      items={filtered || []}
      renderHeader={() => header || <></>}
      renderItem={(resource, index) => {
        const primaryBtnText = resourceBtnTextHandler(resource);
        const primaryBtnDisabled = !resourceBtnEnabled(resource);
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

        const resourceImages = (Array.isArray(resource.images) && resource.images.length > 0) ? resource.images : [{ url: defaultImage }];
        const hasImages = (Array.isArray(resourceImages) && resourceImages.length > 0 && resourceImages[0].url !== '') ? '' : 'resource-has-no-images';

        return (
          <>
            <article className={`stem-begroot--container ${hasImages}`}>

              <Carousel
                items={resourceImages}
                buttonText={{ next: 'Volgende afbeelding', previous: 'Vorige afbeelding' }}
                itemRenderer={(i) => (
                  <Image src={i.url} />
                )}
              />
              {!hideTagsForResources && (
                <section className="stembegroot-content-item-header">
                  <div className="stembegroot-content-item-header-taglist">
                    <Heading level={2} appearance="utrecht-heading-6">Tags</Heading>
                    <div className="pill-grid stembegroot">
                      {(resource.tags as Array<{ type: string; name: string }>)
                        ?.filter((t) => t.type !== 'status')
                        ?.map((t) => <span>{t.name || 'Geen thema'}</span>)}
                    </div>
                  </div>
                </section>
              )}
              <Heading level={2} appearance="utrecht-heading-4" dangerouslySetInnerHTML={{__html: resource.title}}/>
              <Paragraph dangerouslySetInnerHTML={{__html: elipsizeHTML(resource.summary, 100)}}/>
              <Paragraph dangerouslySetInnerHTML={{__html: elipsizeHTML(resource.description, 200)}}/>

              {
                originalUrl ? (
                  <>
                    <Paragraph className="strong">
                      Dit een vervolg op plan:&nbsp;
                      <Link target="_blank" href={originalUrl}>
                        {originalUrl}
                      </Link>
                    </Paragraph>
                  </>
                ) : null}
              <div className="stembegroot--infolabels">
                {displayPriceLabel ? (
                  <div className="price">
                    <Heading level={3} appearance='utrecht-heading-5'>&euro;{resource.budget?.toLocaleString('nl-NL') || 0}</Heading>
                  </div>
                ) : null}
                {showVoteCount ? (

                  <div className="osc-stem-begroot-content-item-footer">
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
                      {displayRanking && resource.extraData?.ranking ? (
                        <Icon
                          icon="ri-trophy-line"
                          variant="regular"
                          text={resource.extraData?.ranking}
                        />
                      ) : null}
                    </>
                  </div>
                ) : null}
                < Spacer size={.5} />
              </div>

              <div className="osc-stem-begroot-content-item-footer">
                {!hideReadMore && (
                  <Button
                    appearance='secondary-action-button'
                    className="osc-stem-begroot-item-action-btn"
                    onClick={(e) => {
                      onResourcePlainClicked(resource, index);
                      e.currentTarget.classList.add('active-resource');
                    }}>
                    Lees meer
                  </Button>
                )}
                <Button
                  disabled={primaryBtnDisabled}
                  className="osc-stem-begroot-item-action-btn"
                  onClick={() => {
                    onResourcePrimaryClicked(resource);
                  }}
                  appearance='primary-action-button'
                >
                  {primaryBtnText}
                </Button>
              </div>
            </article >
          </>
        );
      }}
    />
  );
};
