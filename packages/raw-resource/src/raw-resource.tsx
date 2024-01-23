import './raw-resource.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { Spacer } from '@openstad-headless/ui/src';
//@ts-ignore nunjucks def missing, will disappear when datastore is ts
import nunjucks from 'nunjucks';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';

export type RawResourceWidgetProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
  } & {
    rawInput?: string;
    stylingClasses?: { label: string; value: string }[];
  };

function RawResource(props: RawResourceWidgetProps) {
  const stylingClasses =
    props.stylingClasses?.map((stylingClass) => stylingClass.value).join(' ') ||
    '';

  const render = (() => {
    if (props.rawInput) {
      return nunjucks.renderString(props.rawInput, {
        // here you can add variables that are available in the template
        projectId: props.projectId,
      });
    }
    return '';
  })();

  return (
    <div className="osc">
      <Spacer size={2} />
      <section className="osc-raw-resource-container">
        {props.stylingClasses && render && (
          // this sets innerHTML, input is sanitized in widget.js
          <div
            className={stylingClasses}
            dangerouslySetInnerHTML={{
              __html: render,
            }}></div>
        )}
      </section>
    </div>
  );
}

RawResource.loadWidget = loadWidget;
export { RawResource };
