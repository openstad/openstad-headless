import './enquete.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { Spacer } from '@openstad-headless/ui/src';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
export type EnqueteWidgetProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
  } & {
    displayTitle?: boolean;
    title?: string;
    displayDescription?: boolean;
    description?: string;
    items?: Array<{
      trigger: string;
      title?: string;
      description?: string;
      question?: string;
      questionSubtitle?: string;
      options: Array<{
        trigger: string;
        key: string;
        title: string;
        description: string;
      }>;
    }>;
  };

function Enquete(props: EnqueteWidgetProps) {
  return (
    <div className="osc">
      <Spacer size={2} />

      <section className="osc-enquete">
        {props.displayTitle && props.title && <h4>{props.title}</h4>}
        {props.displayDescription && props.description && (
          <p>{props.description}</p>
        )}
        {props?.items &&
          props?.items?.length > 0 &&
          props.items
            ?.sort((a, b) => parseInt(a.trigger) - parseInt(b.trigger))
            .map((item) => (
              <div key={item.trigger} className="osc-enquete-item">
                <div className="osc-enquete-content">
                  <div>
                    <h5>{item.title}</h5>
                    <p>{item.description}</p>
                  </div>
                  <div>
                    <h5>{item.question}</h5>
                    <p>{item.questionSubtitle}</p>
                  </div>
                  {item.options && item.options?.length > 0 && (
                    <ul className="osc-enquete-list">
                      {item.options?.map((option, index) => (
                        <li className="osc-enquete-link" key={index}>
                          <span>{option.title}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
      </section>
    </div>
  );
}

Enquete.loadWidget = loadWidget;
export { Enquete };
