import './raw-resource.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { getResourceId } from '@openstad-headless/lib/get-resource-id';
import { Spacer } from '@openstad-headless/ui/src';
import nunjucks from 'nunjucks';
import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';
import { applyFilters } from '../includes/nunjucks-filters';

// Initialize Nunjucks environment
const nunjucksEnv = new nunjucks.Environment();
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
applyFilters(nunjucksEnv);

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

  props.resourceId = resourceId

  const datastore = new DataStore({
    projectId: props.projectId,
    resourceId: resourceId,
    api: props.api,
  });

  const { data: resource } = resourceId ? datastore.useResource(props) : { data: null };

  const stylingClasses =
    props.stylingClasses?.map((stylingClass) => stylingClass.value).join(' ') ||
    '';


  let render = (() => {
    if (props.rawInput) {
      if (resourceId) {
        return nunjucksEnv.renderString(props.rawInput, {
          // here you can add variables that are available in the template
          projectId: props.projectId,
          resource: resource,
          user: resource.user,
          startDateHumanized: resource.startDateHumanized,
          status: resource.statuses,
          tags: resource.tags,
          title: resource.title,
          summary: resource.summary,
          description: resource.description,
          images: resource.images,
          budget: resource.budget,
          extraData: resource.extraData,
          location: resource.location,
          modBreak: resource.modBreak,
          modBreakDateHumanized: resource.modBreakDateHumanized,
          progress: resource.progress,
          createDateHumanized: resource.createDateHumanized,
          publishDateHumanized: resource.publishDateHumanized,
          publishDate: resource.publishDate,
        });
      }
      return nunjucksEnv.renderString(props.rawInput, {
        projectId: props.projectId,
      });
    }
    return '';
  })();

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