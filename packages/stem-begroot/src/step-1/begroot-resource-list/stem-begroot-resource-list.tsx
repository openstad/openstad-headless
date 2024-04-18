import React from 'react';
import {
  Icon,
  Image,
  List,
  Spacer,
} from '@openstad-headless/ui/src';

import { elipsize } from '@openstad-headless/lib/ui-helpers';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Button, Paragraph, Strong, Link } from "@utrecht/component-library-react";

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


        return (
          <>
            <article>
              <Image src={resource.images?.at(0)?.url || ''} />

              <div>
                <Spacer size={1} />
                <section className="stembegroot-content-item-header">
                  {displayPriceLabel ? (
                    <h5>&euro;{resource.budget || 0}</h5>
                  ) : null}
                  <div className="stembegroot-content-item-header-taglist">
                    <Paragraph className="strong">Thema:</Paragraph>
                    <Paragraph>{theme?.name || 'Geen thema'}</Paragraph>
                    <Paragraph><Strong>Gebied:</Strong></Paragraph>
                    <Paragraph> {area?.name || 'Geen gebied'}</Paragraph>
                  </div>
                </section>
                <Spacer size={1} />
                <Paragraph>{elipsize(resource.description, 200)}</Paragraph>
                <Spacer size={1} />
              </div>

              {originalUrl ? (
                <>
                  <Paragraph className="strong">
                    Dit een vervolg op plan:&nbsp;
                    <Link target="_blank" href={originalUrl}>
                      {originalUrl}
                    </Link>
                  </Paragraph>
                </>
              ) : null}

              {showVoteCount ? (
                <>
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
                  <Spacer size={.5} />
                </>
              ) : null}

              <div className="osc-stem-begroot-content-item-footer">
                <Button
                  appearance='secondary-action-button'
                  className="osc-stem-begroot-item-action-btn"
                  onClick={() => {
                    onResourcePlainClicked(resource, index);
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
            </article>
          </>
        );
      }}
    />
  );
};
