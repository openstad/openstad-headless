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
      <section className="osc-resource-detail-content osc-resource-detail-content--span-2">
        <article className="osc-resource-detail-content-items">
          {props.displayTitle && props.title && (
            <span className="osc-resource-detail-content-item-text">
              {props.title}
            </span>
          )}
        </article>
      </section>
    </div>
  );
}

Agenda.loadWidget = loadWidget;
export { Agenda };
