import './agenda.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { Spacer } from '@openstad-headless/ui/src';
import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';
import React from 'react';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import {
  Heading4,
  Heading3,
  Paragraph,
  LinkListLink,
  LinkList
} from "@utrecht/component-library-react";
import { Accordion } from '@openstad-headless/ui/src/accordion';

export type AgendaWidgetProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
    resourceId?: string;
  } & {
    displayTitle?: boolean;
    title?: string;
    items?: Array<{
      trigger: string;
      title?: string;
      description: string;
      active: boolean;
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

  const itemsSorted = (props.items ?? [])
    .sort((a, b) => parseInt(a.trigger) - parseInt(b.trigger));

  let startIdx = isNaN(parseInt(toggleStart)) ? 0 : parseInt(toggleStart);
  let endIdx = isNaN(parseInt(toggleEnd)) ? itemsSorted.length - 1 : parseInt(toggleEnd);

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
          aria-current={item.active ? 'true' : undefined}
        >
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
  )

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
