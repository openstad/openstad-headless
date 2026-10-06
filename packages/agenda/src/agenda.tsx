//@ts-ignore D.type def missing, will disappear when datastore is ts
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { sanitizeUrl } from '@openstad-headless/lib/sanitize-url';
import {
  formatDutchDate,
  getTimelineItemStatus,
} from '@openstad-headless/lib/timeline-dates';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import { Spacer, getFileFormat } from '@openstad-headless/ui/src';
import { Accordion } from '@openstad-headless/ui/src/accordion';
import '@utrecht/component-library-css';
import {
  Heading3,
  Heading4,
  LinkList,
  LinkListLink,
  Paragraph,
} from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React from 'react';

import './agenda.css';

export type AgendaWidgetProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
    resourceId?: string;
  } & {
    displayTitle?: boolean;
    title?: string;
    useActiveDates?: boolean;
    items?: Array<{
      trigger: string;
      title?: string;
      description: string;
      active: boolean;
      highlighted?: boolean;
      activeFrom?: string;
      activeTo?: string;
      links?: Array<{
        trigger: string;
        title: string;
        url: string;
        openInNewWindow: boolean;
        kind?: string;
        soort?: string;
        fileFormat?: string;
        fileSize?: string;
      }>;
    }>;
    displayToggle?: boolean;
    toggleDefaultClosed?: boolean;
    toggleShowText?: string;
    toggleHideText?: string;
    toggleType?: string;
    toggleStart?: string;
    toggleEnd?: string;
    defaultClosedFromBreakpoint?: 'not' | '480' | '640' | '768' | '1024';
  };

type AgendaItem = NonNullable<AgendaWidgetProps['items']>[number] & {
  passed?: boolean;
};

function Agenda({
  displayToggle = false,
  toggleDefaultClosed = false,
  toggleShowText = 'Lees meer',
  toggleHideText = 'Lees minder',
  defaultClosedFromBreakpoint = 'not',
  toggleType = 'full',
  toggleStart = '',
  toggleEnd = '',
  ...props
}: AgendaWidgetProps) {
  const isClosedByDefault = () => {
    if (toggleDefaultClosed) return true;
    if (defaultClosedFromBreakpoint === 'not') return false;

    const width = window.innerWidth;
    const breakpoint = parseInt(defaultClosedFromBreakpoint);
    if (width <= breakpoint) return true;
    return false;
  };

  const now = props.useActiveDates
    ? new Date(props.serverTime || Date.now())
    : null;
  const todayKey = now ? now.toISOString().slice(0, 10) : null;
  const itemsSorted: AgendaItem[] = [...(props.items ?? [])]
    .sort((a, b) => parseInt(a.trigger) - parseInt(b.trigger))
    .map((item) => {
      // Without active dates the editor marks items by hand.
      if (!todayKey) return { ...item, passed: !!item.active };
      // Every item whose start date has been reached keeps a filled marker;
      // only the item whose range contains today is the current one.
      const { passed, current } = getTimelineItemStatus(item, todayKey);
      return { ...item, active: current, passed };
    });

  let startIdx = isNaN(parseInt(toggleStart)) ? 0 : parseInt(toggleStart);
  let endIdx = isNaN(parseInt(toggleEnd))
    ? itemsSorted.length - 1
    : parseInt(toggleEnd);

  if (endIdx < startIdx) endIdx = startIdx;

  const beforeItems = itemsSorted.slice(0, startIdx);
  const collapsibleItems = itemsSorted.slice(startIdx, endIdx + 1);
  const afterItems = itemsSorted.slice(endIdx + 1);

  const renderItems = (items: AgendaItem[]) => (
    <>
      {items.map((item, index) => (
        <div
          key={item.trigger}
          className={`osc-agenda-item${item.passed ? ' --passed-item' : ''}${item.active ? ' --active-item' : ''}${item.highlighted ? ' --highlighted-item' : ''}`}
          aria-current={item.active ? 'true' : undefined}>
          <div className="osc-date-circle"></div>
          <div className="osc-agenda-content">
            {(() => {
              const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
              const dateLabel =
                item.activeFrom && isoRegex.test(item.activeFrom)
                  ? formatDutchDate(item.activeFrom)
                  : null;
              const titleIsDate = !!item.title && isoRegex.test(item.title);
              const customTitle = titleIsDate ? null : item.title || null;
              // One heading per item: "date – title", or whichever is set.
              return (
                <Heading4>
                  {dateLabel ? (
                    <time dateTime={item.activeFrom}>{dateLabel}</time>
                  ) : titleIsDate ? (
                    <time dateTime={item.title as string}>
                      {formatDutchDate(item.title as string)}
                    </time>
                  ) : null}
                  {dateLabel && customTitle ? ' – ' : null}
                  {customTitle}
                </Heading4>
              );
            })()}
            {item.description && <Paragraph>{item.description}</Paragraph>}
            {/* ponytail: één link hoort geen lijst te zijn -> losse <a>; pas bij ≥2 een lijst (1.3.1) */}
            {item.links && item.links.length > 1 && (
              <LinkList className="osc-agenda-list">
                {item.links?.map((link, index) => {
                  const linkKind = link.kind ?? link.soort;
                  const fmt =
                    link.fileFormat ||
                    (linkKind === 'document'
                      ? getFileFormat(link.url)
                      : undefined);
                  const size = link.fileSize;
                  const meta =
                    fmt && size ? ` (${fmt}, ${size})` : fmt ? ` (${fmt})` : '';
                  return (
                    <LinkListLink
                      key={index}
                      href={sanitizeUrl(link.url)}
                      target={link.openInNewWindow ? '_blank' : '_self'}
                      rel={
                        link.openInNewWindow ? 'noopener noreferrer' : undefined
                      }>
                      {link.title || link.url}
                      {meta}
                      {link.openInNewWindow && (
                        <span className="sr-only">
                          {' '}
                          (opent in nieuw tabblad)
                        </span>
                      )}
                    </LinkListLink>
                  );
                })}
              </LinkList>
            )}
            {item.links && item.links.length === 1 && (
              <a
                className="osc-agenda-single-link"
                href={sanitizeUrl(item.links[0].url)}
                target={item.links[0].openInNewWindow ? '_blank' : '_self'}
                rel={
                  item.links[0].openInNewWindow
                    ? 'noopener noreferrer'
                    : undefined
                }>
                {item.links[0].title}
                {item.links[0].openInNewWindow && (
                  <span className="sr-only"> (opent in nieuw tabblad)</span>
                )}
              </a>
            )}
          </div>
        </div>
      ))}
    </>
  );

  const ItemsSection = (
    <section className="osc-agenda" aria-label="Agenda">
      {displayToggle && toggleType === 'items' ? (
        <>
          {renderItems(beforeItems)}
          {collapsibleItems.length > 0 ? (
            <Accordion
              content={renderItems(collapsibleItems)}
              closeLabel={toggleHideText}
              openLabel={toggleShowText}
              headingLevel={3}
              expanded={!isClosedByDefault()}
            />
          ) : null}
          {renderItems(afterItems)}
        </>
      ) : (
        <>
          {displayToggle && toggleType === 'full' ? (
            <Accordion
              content={renderItems(itemsSorted)}
              closeLabel={toggleHideText}
              openLabel={toggleShowText}
              headingLevel={3}
              expanded={!isClosedByDefault()}
            />
          ) : (
            renderItems(itemsSorted)
          )}
        </>
      )}
    </section>
  );

  return (
    <div className="osc">
      <Spacer size={2} />
      {props.displayTitle && props.title && <Heading3>{props.title}</Heading3>}
      {ItemsSection}
    </div>
  );
}

Agenda.loadWidget = loadWidget;
export { Agenda };
