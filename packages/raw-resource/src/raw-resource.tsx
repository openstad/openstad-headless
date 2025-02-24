import './raw-resource.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { getResourceId } from '@openstad-headless/lib/get-resource-id';
import { Spacer } from '@openstad-headless/ui/src';
import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';
import stringFilters from '../includes/nunjucks-filters';


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


  let render = (() => {
    if (updatedProps.rawInput) {

      if (resourceId) {

        let rendered = updatedProps.rawInput;

        const varMapping: { [key: string]: any } = {
          // here you can add variables that are available in the template
          projectId: updatedProps.projectId,
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
        };

        // Get all variables fom the string
        const regex = /\{\{([^}]*)\}\}/g
        const varsInString = Array.from(updatedProps.rawInput.matchAll(regex));


        if (varsInString && varsInString.length) {
          for (const match of varsInString) {

            let newValue = '';
            const cleanMatches = match[1].trim().split('|');
            const varName = cleanMatches[0].trim().split('.')[0];
            const filters = cleanMatches.slice(1).map((filter) => filter.trim());

            newValue = varMapping[varName] ?? '';

            if (cleanMatches[0].indexOf('.') > -1) {
              newValue = varMapping[cleanMatches[0].split('.')[0].trim()] ?? ''

              if (!!newValue && typeof newValue === 'object') {
                newValue = newValue[cleanMatches[0].split('.')[1].trim()];
              }
            }

            if (typeof newValue === 'undefined') {
              newValue = '';
            }

            if (!!newValue && filters && filters.length) {
              for (const filter of filters) {

                // Filter can be in this format: tagGroup('type') or replace('type', 'type2) | cleanArray
                // So we need to split the filter name and the arguments
                const filterParts = filter.split('(');
                const filterName = filterParts[0];
                let filterArgs: string[] = [];
                if (filterParts.length > 1) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  filterArgs = filterParts[1].replace(')', '').split(',').map(f => f.trim().replaceAll("'", "").replaceAll('"', ''));
                }

                // @ts-ignore
                if (stringFilters[filterName]) {
                  if (filterArgs.length) {
                    // @ts-ignore
                    newValue = stringFilters[filterName](newValue, ...filterArgs);
                  } else {
                    // @ts-ignore
                    newValue = stringFilters[filterName](newValue);
                  }
                }
              }
            }

            rendered = rendered.replaceAll(match[0], newValue);

          }
        }

        return rendered;

      }
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
