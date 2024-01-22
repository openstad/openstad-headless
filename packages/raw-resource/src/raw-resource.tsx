import './raw-resource.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { Spacer } from '@openstad-headless/ui/src';
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
  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });
  let stylingClasses =
    props.stylingClasses?.map((stylingClass) => stylingClass.value).join(' ') ||
    '';

  return (
    <div className="osc">
      <Spacer size={2} />
      <section className="osc-resource-detail-content osc-resource-detail-content--span-2">
        <article className="osc-resource-detail-content-items">
          {props.stylingClasses && (
            <div className={stylingClasses}>
              {props?.rawInput || 'Ingevulde tekst komt hier'}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

RawResource.loadWidget = loadWidget;
export { RawResource };
