//@ts-ignore D.type def missing, will disappear when datastore is ts
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { sanitizeUrl } from '@openstad-headless/lib/sanitize-url';
import { formatDutchDate } from '@openstad-headless/lib/timeline-dates';
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
  const toDateKey = (value: string | undefined) => {
    if (!value) return null;
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const date = new Date(trimmed);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
  };

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
  const itemsSorted = [...(props.items ?? [])]
    .sort((a, b) => parseInt(a.trigger) - parseInt(b.trigger))
    .map((item) => {
      if (!todayKey) return item;
      const fromKey = toDateKey(item.activeFrom);
      const toKey = toDateKey(item.activeTo);
      const isActive =
        (!fromKey || todayKey >= fromKey) && (!toKey || todayKey <= toKey);
      return { ...item, active: isActive };
    });

  let startIdx = isNaN(parseInt(toggleStart)) ? 0 : parseInt(toggleStart);
  let endIdx = isNaN(parseInt(toggleEnd))
    ? itemsSorted.length - 1
    : parseInt(toggleEnd);

  if (endIdx < startIdx) endIdx = startIdx;

  const beforeItems = itemsSorted.slice(0, startIdx);
  const collapsibleItems = itemsSorted.slice(startIdx, endIdx + 1);
  const afterItems = itemsSorted.slice(endIdx + 1);

  const renderItems = (items: NonNullable<typeof props.items>) => (
    <>
      {items.map((item, index) => (
        <div
          key={item.trigger}
          className={`osc-agenda-item${item.active ? ' --active-item' : ''}${item.highlighted ? ' --highlighted-item' : ''}`}
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
              if (customTitle) {
                return (
                  <>
                    {dateLabel && (
                      <Paragraph className="osc-agenda-date-label">
                        {dateLabel}
                      </Paragraph>
                    )}
                    <Heading4>{customTitle}</Heading4>
                  </>
                );
              }
              return (
                <Heading4>
                  {dateLabel ||
                    (titleIsDate
                      ? formatDutchDate(item.title as string)
                      : item.title)}
                </Heading4>
              );
            })()}
            <Paragraph>{item.description}</Paragraph>
            {item.links && item.links?.length > 0 && (
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
                      {link.title}
                      {meta}
                    </LinkListLink>
                  );
                })}
              </LinkList>
            )}
          </div>
        </div>
      ))}
    </>
  );

  const ItemsSection = (
    <section className="osc-agenda">
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
