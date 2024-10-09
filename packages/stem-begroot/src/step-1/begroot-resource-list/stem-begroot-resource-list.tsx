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
  header
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
}) => {
  return (
    <List
      id='stem-begroot-resource-selections-list'
      columns={resourceListColumns}
      items={resources || []}
      renderHeader={() => header || <></>}
      renderItem={(resource, index) => {
        const primaryBtnText = resourceBtnTextHandler(resource);
        const primaryBtnDisabled = !resourceBtnEnabled(resource);
        const originalUrl = defineOriginalUrl(resource);

        const theme = resource.tags
          ?.filter((t: any) => t.type === 'theme')
          ?.at(0);
        const area = resource.tags
          ?.filter((t: any) => t.type === 'area')
          ?.at(0);

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
                <Button
                  appearance='secondary-action-button'
                  className="osc-stem-begroot-item-action-btn"
                  onClick={(e) => {
                    onResourcePlainClicked(resource, index);
                    e.currentTarget.classList.add('active-resource');
                  }}>
                  Lees meer
                </Button>
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
