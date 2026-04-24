import { canLikeResource } from '@openstad-headless/lib';
import { elipsizeHTML } from '@openstad-headless/lib/ui-helpers';
import {
  Carousel,
  Icon,
  Image,
  List,
  Pill,
  Spacer,
} from '@openstad-headless/ui/src';
import '@utrecht/component-library-css';
import {
  Button,
  Heading,
  Heading5,
  Link,
  Paragraph,
} from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React, { useEffect, useMemo, useRef } from 'react';

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
  activeTagTab = '',
  voteType = 'likes',
  typeSelector = 'tag',
  setFilteredResources,
  filteredResources = [],
  hideTagsForResources = false,
  hideReadMore = false,
  showOriginalResource = true,
  displayTitle = true,
  displaySummary = true,
  header,
}: {
  resourceListColumns?: number;
  resources: Array<any>;
  selectedResources: Array<any>;
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
  header?: React.JSX.Element;
  activeTagTab?: string;
  typeSelector?: string;
  voteType?: string;
  setFilteredResources?: (resources: Array<any>) => void;
  filteredResources?: Array<any>;
  hideTagsForResources?: boolean;
  hideReadMore?: boolean;
  displayTitle?: boolean;
  displaySummary?: boolean;
}) => {
  const filtered = useMemo(() => {
    if (!resources) return [];
    return resources.filter((resource: any) => {
      if (voteType === 'countPerTag' || voteType === 'budgetingPerTag') {
        if (typeSelector === 'tag') {
          return resource?.tags?.some(
            (tag: { name: string }) => tag.name === activeTagTab
          );
        } else {
          return resource?.tags?.some(
            (tag: { type: string }) => tag.type === activeTagTab
          );
        }
      }
      return true;
    });
  }, [resources, activeTagTab, voteType, typeSelector]);

  // Use ref to track previous filtered value to avoid infinite loops
  const prevFilteredRef = useRef<string>('');

  // Update filtered resources in useEffect to avoid infinite loops
  useEffect(() => {
    if (setFilteredResources && filtered) {
      const currentFilteredString = JSON.stringify(filtered);
      if (currentFilteredString !== prevFilteredRef.current) {
        prevFilteredRef.current = currentFilteredString;
        setFilteredResources(filtered);
      }
    }
  }, [filtered, setFilteredResources]);

  return (
    <List
      id="stem-begroot-resource-selections-list"
      columns={resourceListColumns}
      items={filtered || []}
      renderHeader={() => header || <></>}
      renderItem={(resource, index) => {
        const primaryBtnText = resourceBtnTextHandler(resource);
        const primaryBtnDisabled = !resourceBtnEnabled(resource);
        const canVoteByStatus = canLikeResource(resource);
        const originalUrl = defineOriginalUrl(resource);

        let defaultImage = '';

        interface Tag {
          name: string;
          defaultResourceImage?: string;
        }

        if (Array.isArray(resource?.tags)) {
          const sortedTags = resource.tags.sort((a: Tag, b: Tag) =>
            a.name.localeCompare(b.name)
          );
          const tagWithImage = sortedTags.find(
            (tag: Tag) => tag.defaultResourceImage
          );
          defaultImage = tagWithImage?.defaultResourceImage || '';
        }

        const resourceImages =
          Array.isArray(resource.images) && resource.images.length > 0
            ? resource.images
            : [{ url: defaultImage }];
        const hasImages =
          Array.isArray(resourceImages) &&
          resourceImages.length > 0 &&
          resourceImages[0].url !== ''
            ? ''
            : 'resource-has-no-images';

        return (
          <>
            <article
              className={`stem-begroot--container ${hasImages} ${
                !canVoteByStatus ? 'resource-vote-disabled' : ''
              }`.trim()}>
              <Carousel
                items={resourceImages}
                buttonText={{
                  next: 'Volgende afbeelding',
                  previous: 'Vorige afbeelding',
                }}
                itemRenderer={(i) => <Image src={i.url} />}
              />
              {!hideTagsForResources && (
                <section className="stembegroot-content-item-header">
                  <div className="stembegroot-content-item-header-taglist">
                    <Heading level={2} appearance="utrecht-heading-6">
                      Tags
                    </Heading>
                    <div className="pill-grid stembegroot">
                      {(
                        resource.tags as Array<{
                          type: string;
                          name: string;
                          seqnr?: number;
                        }>
                      )
                        ?.filter((t) => t.type !== 'status')
                        ?.sort(
                          (a: { seqnr?: number }, b: { seqnr?: number }) => {
                            if (a.seqnr === undefined || a.seqnr === null)
                              return 1;
                            if (b.seqnr === undefined || b.seqnr === null)
                              return -1;
                            return a.seqnr - b.seqnr;
                          }
                        )
                        ?.map((t) => (
                          <span>{t.name || 'Geen thema'}</span>
                        ))}
                    </div>
                  </div>
                </section>
              )}
              {displayTitle ? (
                <Heading
                  level={2}
                  appearance="utrecht-heading-4"
                  dangerouslySetInnerHTML={{ __html: resource.title }}
                />
              ) : null}
              {displaySummary ? (
                <Paragraph
                  dangerouslySetInnerHTML={{
                    __html: elipsizeHTML(resource.summary, 100),
                  }}
                />
              ) : null}
              <Paragraph
                dangerouslySetInnerHTML={{
                  __html: elipsizeHTML(resource.description, 200),
                }}
              />

              <div className="stembegroot--infolabels">
                {displayPriceLabel ? (
                  <div className="price">
                    <Heading level={3} appearance="utrecht-heading-5">
                      &euro;{resource.budget?.toLocaleString('nl-NL') || 0}
                    </Heading>
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
                <Spacer size={0.5} />
              </div>

              <div className="osc-stem-begroot-content-item-footer">
                {!hideReadMore && (
                  <Button
                    appearance="secondary-action-button"
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
                  appearance="primary-action-button">
                  {primaryBtnText}
                </Button>
              </div>
            </article>
          </>
        );
      }}
    />
  );
};
