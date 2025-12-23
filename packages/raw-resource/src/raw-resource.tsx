import './raw-resource.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { getResourceId } from '@openstad-headless/lib/get-resource-id';
import { Spacer } from '@openstad-headless/ui/src';
import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';
import { renderRawTemplate } from '../includes/template-render';


export type RawResourceWidgetProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
  } & {
    resourceId?: string;
    resourceIdRelativePath?: string;
    rawInput?: string;
    stylingClasses?: { label: string; value: string }[];
  };

function RawResource(props: RawResourceWidgetProps) {
  const urlParams = new URLSearchParams(window.location.search);

  let resourceId: string | undefined = String(getResourceId({
    resourceId: parseInt(props.resourceId || ''),
    url: document.location.href,
    targetUrl: props.resourceIdRelativePath,
  })); // todo: make it a number throughout the code

  const updatedProps = { ...props, resourceId };

  const datastore = new DataStore({
    projectId: updatedProps.projectId,
    resourceId: resourceId,
    api: updatedProps.api,
  });

  const { data: resource } = resourceId ? datastore.useResource(updatedProps) : { data: null };

  const stylingClasses =
    updatedProps.stylingClasses?.map((stylingClass) => stylingClass.value).join(' ') ||
    '';

  let render = renderRawTemplate(updatedProps, resource, resourceId, true);
  render = render.replace(/&amp;amp;/g, '&');

  return (
    <div className="osc">
      <Spacer size={2} />
      <section className="osc-raw-resource-container">
        {render && (
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
