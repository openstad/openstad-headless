import React from 'react';

import '../index.css';
import './index.css';

type Props<T> = {
  items: Array<T>;
  renderHeader?: () => React.JSX.Element;
  renderItem: (item: T, index:number) => React.JSX.Element;
  columns?: number;
} & React.HTMLAttributes<HTMLDivElement>;

export const List = <T extends { [key: string]: any }>({
  items,
  renderItem,
  renderHeader,
  columns = 1,
  ...props
}: Props<T>) => {
  return (
    <section id={props.id}>
      {renderHeader && renderHeader()}

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
