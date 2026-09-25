import DataStore from '@openstad-headless/data-store/src';
import { Heading, Paragraph } from '@utrecht/component-library-react';
import React, { useEffect, useState } from 'react';

import {
  type ExternalItem,
  externalIdsBySource,
  toRelatedItems,
} from './links-helpers';
import './related-resources.css';

export type RelatedResourcesProps = {
  display?: boolean;
  title?: string;
  layout?: 'default' | 'compact';
  displayTitle?: boolean;
  displayImage?: boolean;
  displaySummary?: boolean;
  linkToDetail?: boolean;
  itemLink?: string;
  tagIds?: string;
};

type Props = RelatedResourcesProps & {
  projectId?: string;
  resourceId?: string;
  api?: any;
  headingLevel: number;
  itemHeadingLevel: number;
};

export function RelatedResources({
  projectId,
  resourceId,
  api,
  headingLevel,
  itemHeadingLevel,
  title = 'Gerelateerde inzendingen',
  layout = 'default',
  displayTitle = true,
  displayImage = true,
  displaySummary = true,
  linkToDetail = true,
  itemLink,
  tagIds,
}: Props) {
  const datastore: any = new DataStore({ projectId, api });
  const { data: links } = datastore.useResourceLinks({
    projectId,
    resourceId,
  });
  const [externalItems, setExternalItems] = useState<
    Record<string, ExternalItem>
  >({});

  const externalIds = externalIdsBySource(links);
  const externalKey = JSON.stringify(externalIds);

  useEffect(() => {
    const sources = Object.entries(externalIds);
    if (!sources.length) return;
    let cancelled = false;
    Promise.all(
      sources.map(([source, ids]) =>
        datastore.api.links
          .fetchItems({ projectId, source, ids })
          .then((items: ExternalItem[]) =>
            (items || []).map((item) => [`${source}:${item.id}`, item])
          )
      )
    )
      .then((entries) => {
        if (!cancelled) setExternalItems(Object.fromEntries(entries.flat()));
      })
      .catch((error: Error) => {
        console.error(
          `[resource-detail] loading linked items failed: resourceId=${resourceId} error=${error?.message}`
        );
      });
    return () => {
      cancelled = true;
    };
  }, [externalKey, projectId]);

  const items = toRelatedItems(links, {
    tagIds,
    itemLink: linkToDetail ? itemLink : undefined,
    externalItems,
  });

  if (!items.length) return null;

  return (
    <section
      className={`osc-related-resources --${layout}`}
      aria-label={displayTitle ? undefined : title}>
      {displayTitle ? (
        <Heading level={headingLevel} appearance="utrecht-heading-2">
          {title}
        </Heading>
      ) : null}
      <ul className="osc-related-resources-list">
        {items.map((item) => (
          <li key={item.key} className="osc-related-resources-item">
            {displayImage && item.image ? (
              <img
                className="osc-related-resources-image"
                src={item.image}
                alt=""
              />
            ) : null}
            <Heading
              level={itemHeadingLevel}
              appearance="utrecht-heading-5"
              className="osc-related-resources-title">
              {item.url ? <a href={item.url}>{item.title}</a> : item.title}
            </Heading>
            {displaySummary && item.summary && layout !== 'compact' ? (
              <Paragraph className="osc-related-resources-summary">
                {item.summary}
              </Paragraph>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
