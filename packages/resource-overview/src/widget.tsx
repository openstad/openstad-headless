import './widget.css';
import React from 'react';
import { Banner, Icon } from '@openstad-headless/ui/src';
import { Spacer } from '@openstad-headless/ui/src';
import { Image } from '@openstad-headless/ui/src';

type Props = {
  title?: string;
  renderHeader?: (resources?: Array<any>) => React.JSX.Element;
  renderItem?: (resource: any) => React.JSX.Element;
  onItemClick?: (resource: any) => void;
  allowFiltering?: boolean;
  resources: Array<any>;
};

//Temp
const defaultHeaderRenderer = (resources?: any) => {
  return (
    <>
      <Banner>
        <Spacer size={24} />
      </Banner>
    </>
  );
};

const defaultItemRenderer = (resource: any) => {
  return (
    <article>
      <Image />
      <div>
        <Spacer size={1} />
        <h6>Zwemles voor mannen van 50+ in Aletta Jacobsbuurt</h6>
        <p>
          Veel mannen in de Aletta Jacobsbuurt van 50 jaar en ouder kunnen niet
          zwemmen.
        </p>
      </div>
      <div>
        <Icon icon="ri-thumb-down-line" text="0" />
      </div>
    </article>
  );
};

const defaultOnItemClick = (resource: any) => {
  console.log(resource);
};

function Widget({
  title = 'Plannen',
  renderHeader = defaultHeaderRenderer,
  renderItem = defaultItemRenderer,
  onItemClick = defaultOnItemClick,
  allowFiltering,
  resources = ['', '', '', ''],
}: Props) {
  return (
    <>
      {renderHeader()}
      <section className="osc2-resource-overview-title-container">
        <Spacer size={2} />
        <h4>{title}</h4>
      </section>

      <Spacer size={2} />

      <section className="osc2-resource-overview-content">
        <section className="osc2-resource-overview-filters">
          <h1>dsf</h1>
        </section>
        <section className="osc2-resource-overview-resource-collection">
          {resources.map((resource) => {
            return renderItem(resource);
          })}
        </section>
      </section>
    </>
  );
}

export default Widget;
