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
  };

function Enquete(props: EnqueteWidgetProps) {
  return (
    <div className="osc">
      <Spacer size={2} />
      {props.displayTitle && props.title && <h3>{props.title}</h3>}
    </div>
  );
}

Enquete.loadWidget = loadWidget;
export { Enquete };
