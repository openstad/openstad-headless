//@ts-ignore D.type def missing, will disappear when datastore is ts
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import { Spacer } from '@openstad-headless/ui/src';
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
      activeFrom?: string;
      activeTo?: string;
      links?: Array<{
        trigger: string;
        title: string;
        url: string;
        openInNewWindow: boolean;
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
  const itemsSorted = [...(props.items ?? [])]
    .sort((a, b) => parseInt(a.trigger) - parseInt(b.trigger))
    .map((item) => {
      if (!now) return item;
      const from = item.activeFrom ? new Date(item.activeFrom) : null;
      const to = item.activeTo ? new Date(item.activeTo) : null;
      const isActive = (!from || now >= from) && (!to || now <= to);
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
          className={`osc-agenda-item${item.active ? ' --active-item' : ''}`}
          aria-current={item.active ? 'true' : undefined}>
          <div className="osc-date-circle"></div>
          <div className="osc-agenda-content">
            <Heading4>{item.title}</Heading4>
            <Paragraph>{item.description}</Paragraph>
            {item.links && item.links?.length > 0 && (
              <LinkList className="osc-agenda-list">
                {item.links?.map((link, index) => (
                  <LinkListLink
                    href={link.url}
                    target={link.openInNewWindow ? '_blank' : '_self'}>
                    {link.title}
                  </LinkListLink>
                ))}
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
