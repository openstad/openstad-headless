import './agenda.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { Spacer } from '@openstad-headless/ui/src';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
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
      <section className="osc-agenda-content">
        {props.displayTitle && props.title && <h3>{props.title}</h3>}
        {props?.items &&
          props?.items?.length > 0 &&
          props.items
            ?.sort((a, b) => parseInt(a.trigger) - parseInt(b.trigger))
            .map((item) => (
              <div key={item.trigger} className="osc-agenda-item">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                {item.links && item.links?.length > 0 && (
                  <ul className="osc-agenda-list">
                    {item.links?.map((link) => (
                      <li className="osc-agenda-link">
                        <a
                          key={link.title}
                          href={link.url}
                          target={link.openInNewWindow ? '_blank' : '_self'}>
                          {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
      </section>
    </div>
  );
}

Agenda.loadWidget = loadWidget;
export { Agenda };
