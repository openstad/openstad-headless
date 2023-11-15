import './widget.css';
import React from 'react';
import { Banner, Icon } from '@openstad-headless/ui/src';
import DataStore from '@openstad-headless/data-store/src';
import { Spacer } from '@openstad-headless/ui/src';
import { Image } from '@openstad-headless/ui/src';
import { BaseConfig } from '../../generic-widget-types';
import { Filters } from './filters/filters';

type Props = {
  title?: string;
  renderHeader?: (resources?: Array<any>) => React.JSX.Element;
  renderItem?: (resource: any) => React.JSX.Element;
  allowFiltering?: boolean;
} & BaseConfig;

//Temp
const defaultHeaderRenderer = (resources?: any) => {
  return (
    <>
      <Banner>
        <Spacer size={12} />
      </Banner>
    </>
  );
};

const defaultItemRenderer = (resource: any) => {
  return (
    <article>
      <Image
        src={resource.images?.at(0)?.src || ''}
        onClick={() => console.log({ resource })}
        imageFooter={
          <div>
            <p className="osc2-resource-overview-content-item-status">
              {resource.status === 'OPEN' ? 'Open' : 'Gesloten'}
            </p>
          </div>
        }
      />
      <div>
        <Spacer size={1} />
        <h6>{resource.title}</h6>
        <p className="osc2-resource-overview-content-item-description">
          {resource.description}
        </p>
      </div>
      <div className="osc2-resource-overview-content-item-footer">
        <Icon icon="ri-thumb-up-line" text={resource.yes} />
        <Icon icon="ri-thumb-down-line" text={resource.yes} />
        <Icon icon="ri-message-line" text="0" />
      </div>
    </article>
  );
};

function Widget({
  title = 'Plannen',
  renderHeader = defaultHeaderRenderer,
  renderItem = defaultItemRenderer,
  allowFiltering = true,
  ...props
}: Props) {
  // const projectId = props.projectId || props.config?.projectId;
  // const ideaId = props.ideaId || props.config?.ideaId;
  // const apiUrl = props.apiUrl || props.config.api?.url;
  const datastore = new DataStore(props);
  const [ideas, error, isLoading] = datastore.useIdeas({ ...props });

  return (
    <>
      {renderHeader()}
      <section className="osc2-resource-overview-title-container">
        <Spacer size={2} />
        <h4>{title}</h4>
      </section>

      <Spacer size={2} />

      <section
        className={`osc2-resource-overview-content ${
          !allowFiltering ? 'full' : ''
        }`}>
        {allowFiltering && datastore ? (
          <Filters
            projectId={props.projectId}
            config={props.config}
            dataStore={datastore}
            ideas={ideas}
            onUpdateFilter={ideas.filter}
          />
        ) : null}

        <section className="osc2-resource-overview-resource-collection">
          {ideas &&
            ideas.map((resource: any) => {
              return renderItem(resource);
            })}
        </section>
      </section>
    </>
  );
}

export default Widget;
