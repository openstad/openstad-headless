import React from 'react';

import '../index.css';
import './index.css';

type Props<T> = {
  items: Array<T>;
  renderHeader?: () => React.JSX.Element;
  renderItem: (item: T, index:number) => React.JSX.Element;
  columns?: number;
  emptyListText?:string;
} & React.HTMLAttributes<HTMLDivElement>;

export const List = <T extends { [key: string]: any }>({
  items,
  renderItem,
  renderHeader,
  columns = 1,
  emptyListText = 'Geen resultaten gevonden',
  ...props
}: Props<T>) => {
  return (
    <section id={props.id}>
      {renderHeader && renderHeader()}

      {items.length === 0 ? <p>{emptyListText}</p> : null}
      <div className={`osc-listview osc-listview-template-columns-${columns}`}>
        {items.map((item, index) => (
          <React.Fragment key={`list-item-${index}`}>
            {renderItem(item, index)}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};
