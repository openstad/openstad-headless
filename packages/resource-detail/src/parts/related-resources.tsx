import DataStore from '@openstad-headless/data-store/src';
import { Icon, IconButton } from '@openstad-headless/ui/src';
import { Button, Heading, Paragraph } from '@utrecht/component-library-react';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

import {
  type ExternalItem,
  externalIdsBySource,
  filterByTags,
  relatedTagOptions,
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
  showTagFilter?: boolean;
  filterTagTypes?: string;
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
  showTagFilter = false,
  filterTagTypes,
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

  const allItems = toRelatedItems(links, {
    tagIds,
    itemLink,
    linkToDetail,
    externalItems,
  });

  const filterId = useId();
  const filterToggleRef = useRef<HTMLButtonElement>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const tagOptions = showTagFilter
    ? relatedTagOptions(allItems, filterTagTypes)
    : [];
  const activeTagIds = selectedTagIds.filter((id) =>
    tagOptions.some((tag) => tag.id === id)
  );
  const items = filterByTags(allItems, activeTagIds);

  const toggleTag = (id: string) =>
    setSelectedTagIds((current) =>
      current.includes(id)
        ? current.filter((tagId) => tagId !== id)
        : [...current, id]
    );

  const listRef = useRef<HTMLUListElement>(null);
  const [scroll, setScroll] = useState({ canPrevious: false, canNext: false });

  const updateScroll = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    setScroll({
      canPrevious: list.scrollLeft > 1,
      canNext: list.scrollLeft + list.clientWidth < list.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    updateScroll();
    const observer = new ResizeObserver(updateScroll);
    observer.observe(list);
    return () => observer.disconnect();
  }, [items.length, updateScroll]);

  useEffect(() => {
    listRef.current?.scrollTo({ left: 0 });
    updateScroll();
  }, [activeTagIds.join(','), updateScroll]);

  const scrollBy = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    list.scrollBy({ left: direction * list.clientWidth, behavior: 'smooth' });
  };

  if (!allItems.length) return null;

  const hasOverflow = scroll.canPrevious || scroll.canNext;

  return (
    <section
      className={`osc-related-resources --${layout}`}
      aria-label={displayTitle ? undefined : title}>
      <div className="osc-related-resources-header">
        {displayTitle ? (
          <Heading level={headingLevel} appearance="utrecht-heading-2">
            {title}
          </Heading>
        ) : null}
        {hasOverflow ? (
          <div className="osc-related-resources-nav">
            <IconButton
              type="button"
              className="secondary-action-button"
              icon="ri-arrow-left-line"
              iconOnly={true}
              aria-label="Vorige"
              disabled={!scroll.canPrevious}
              onClick={() => scrollBy(-1)}
            />
            <IconButton
              type="button"
              className="primary-action-button"
              icon="ri-arrow-right-line"
              iconOnly={true}
              aria-label="Volgende"
              disabled={!scroll.canNext}
              onClick={() => scrollBy(1)}
            />
          </div>
        ) : null}
      </div>
      {tagOptions.length ? (
        <div className="osc-related-resources-filter">
          <Button
            ref={filterToggleRef}
            appearance="subtle-button"
            className="osc-related-resources-filter-toggle"
            aria-expanded={filterOpen}
            aria-controls={filterId}
            onClick={() => setFilterOpen((open) => !open)}>
            {activeTagIds.length
              ? `Filter op tag (${activeTagIds.length})`
              : 'Filter op tag'}
            <i
              className={`ri-arrow-${filterOpen ? 'up' : 'down'}-s-line`}
              aria-hidden="true"
            />
          </Button>
          <div
            id={filterId}
            className="osc-related-resources-filter-panel"
            hidden={!filterOpen}>
            <ul className="osc-related-resources-filter-tags">
              {tagOptions.map((tag) => (
                <li key={tag.id}>
                  <Button
                    appearance="secondary-action-button"
                    className="osc-related-resources-filter-tag"
                    pressed={activeTagIds.includes(tag.id)}
                    onClick={() => toggleTag(tag.id)}>
                    {tag.name}
                  </Button>
                </li>
              ))}
            </ul>
            {activeTagIds.length ? (
              <Button
                appearance="subtle-button"
                onClick={() => {
                  setSelectedTagIds([]);
                  filterToggleRef.current?.focus();
                }}>
                Wis filter
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      <p className="sr-only" role="status">
        {activeTagIds.length
          ? `${items.length} van ${allItems.length} inzendingen getoond`
          : ''}
      </p>
      <ul
        ref={listRef}
        className="osc-related-resources-list"
        onScroll={updateScroll}>
        {items.map((item) => (
          <li
            key={item.key}
            className={`osc-related-resources-item${item.url ? ' --link' : ''}`}>
            {displayImage && item.image ? (
              <img
                className="osc-related-resources-image"
                src={item.image}
                alt=""
              />
            ) : null}
            {displayImage && !item.image ? (
              <div className="osc-related-resources-image --placeholder">
                <Icon icon="ri-image-line" iconOnly={true} variant="big" />
              </div>
            ) : null}
            <Heading
              level={itemHeadingLevel}
              appearance="utrecht-heading-4"
              className="osc-related-resources-title">
              {item.url ? (
                <a className="osc-related-resources-link" href={item.url}>
                  {item.title}
                </a>
              ) : (
                item.title
              )}
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
