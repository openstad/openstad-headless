import './agenda.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { Spacer } from '@openstad-headless/ui/src';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
import React from 'react';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Heading4, Heading3, Paragraph, LinkListLink, LinkList } from "@utrecht/component-library-react";

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
  };

function Agenda(props: AgendaWidgetProps) {
  return (
    <div className="osc">
      <Spacer size={2} />
      {props.displayTitle && props.title && <Heading3>{props.title}</Heading3>}
      <section className="osc-agenda">
        {props?.items &&
          props?.items?.length > 0 &&
          props.items
            ?.sort((a, b) => parseInt(a.trigger) - parseInt(b.trigger))
            .map((item) => (
              <>
                <div key={item.trigger} className={`osc-agenda-item ${item.active ? '--active-item' : ''}`}>
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
              </>
            ))}
      </section>
    </div>
  );
}

Agenda.loadWidget = loadWidget;
export { Agenda };
