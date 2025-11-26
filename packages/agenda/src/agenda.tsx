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
  defaultClosedFromBreakpoint?: 'not' | '480' | '640' | '768' | '1024';
};

function Agenda({
  displayToggle = false,
  toggleDefaultClosed = false,
  toggleShowText = 'Lees meer',
  toggleHideText = 'Lees minder',
  defaultClosedFromBreakpoint = 'not',
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

  const AgendaContent = (
    <>
      {props.displayTitle && props.title && <Heading3>{props.title}</Heading3>}
      <section className="osc-agenda">
        {props?.items && props?.items?.length > 0 && props.items
          ?.sort((a, b) => parseInt(a.trigger) - parseInt(b.trigger))
          .map((item) => (
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
          ))
        }
      </section>
    </>
  );

  return (
    <div className="osc">
      <Spacer size={2} />

      {displayToggle ? (
        <Accordion
          content={ AgendaContent }
          closeLabel={ toggleHideText }
          openLabel={  toggleShowText }
          headingLevel={ 3 }
          expanded={ !isClosedByDefault() }
        />
      ) : (
        AgendaContent
      )}

    </div>
  );
}

Agenda.loadWidget = loadWidget;
export { Agenda };
