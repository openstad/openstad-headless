import SwipeField from '../../src/swipe';

describe('<SwipeField />', () => {
  it('renders without crashing', () => {
    cy.mount(<SwipeField {...({ fieldKey: 'test' } as any)} />);
  });
});
