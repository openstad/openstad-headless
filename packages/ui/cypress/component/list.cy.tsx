import React from 'react';

import { List } from '../../src/list';

describe('<List />', () => {
  it('renders a list', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <List
        items={[
          { id: '1', label: 'Item 1' },
          { id: '2', label: 'Item 2' },
          { id: '3', label: 'Item 3' },
        ]}
        renderItem={(item) => (
          <div key={item.id} className="list-item">
            {item.label}
          </div>
        )}
      />
    );

    cy.get('.list-item').should('have.length', 3);
  });
});
