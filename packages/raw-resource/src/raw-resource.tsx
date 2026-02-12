import DataStore from '@openstad-headless/data-store/src';
import { getResourceId } from '@openstad-headless/lib/get-resource-id';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import { Spacer } from '@openstad-headless/ui/src';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import { useEffect } from 'react';

import { renderRawTemplate } from '../includes/template-render';
import './raw-resource.css';

export type RawResourceWidgetProps = BaseProps &
  ProjectSettingProps & {
    currentUser?: any;
    projectId?: string;
  } & {
    resourceId?: string;
    resourceIdRelativePath?: string;
    rawInput?: string;
    stylingClasses?: { label: string; value: string }[];
  };

function RawResource(props: RawResourceWidgetProps) {
  const urlParams = new URLSearchParams(window.location.search);

  let resourceId: string | undefined = String(
    getResourceId({
      resourceId: parseInt(props.resourceId || ''),
      url: document.location.href,
      targetUrl: props.resourceIdRelativePath,
    })
  ); // todo: make it a number throughout the code

  const datastore = new DataStore({
    projectId: props.projectId,
    resourceId: resourceId,
    api: props.api,
  });

  const { data: currentUser } = datastore.useCurrentUser({ ...props });

  // Expose logout function globally so it can be called from raw HTML
  useEffect(() => {
    if (currentUser?.logout) {
      (window as any).openstadLogout = () => {
        currentUser.logout({ url: location.href });
      };
    }

    return () => {
      delete (window as any).openstadLogout;
    };
  }, [currentUser]);

  let updatedProps = { ...props, resourceId, currentUser };

  const { data: resource } = resourceId
    ? datastore.useResource(updatedProps)
    : { data: null };

  const stylingClasses =
    updatedProps.stylingClasses
      ?.map((stylingClass) => stylingClass.value)
      .join(' ') || '';

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
