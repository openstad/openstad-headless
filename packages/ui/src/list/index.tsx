import React, { forwardRef, useEffect } from 'react';

import '../index.css';
import './index.css';

type Props<T> = {
  items: Array<T>;
  renderHeader?: () => React.JSX.Element;
  renderItem: (item: T) => React.JSX.Element;
  columns?: 1 | 2 | 3;
};

export const List = <T extends { [key: string]: any }>({
  items,
  renderItem,
  renderHeader,
  columns = 1,
}: Props<T>) => {
  return (
    <>
      {renderHeader && renderHeader()}

      <div className={`osc-listview osc-listview-template-columns-${columns}`}>
        {items.map((item, index) => (
          <React.Fragment key={`list-item-${index}`}>
            {renderItem(item)}
          </React.Fragment>
        ))}
      </div>
    </>
  );
};
