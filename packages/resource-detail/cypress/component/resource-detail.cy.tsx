import { ResourceDetail } from '../../src/resource-detail';

describe('<ResourceDetail />', () => {
  it('renders without crashing', () => {
    cy.mount(<ResourceDetail {...({} as any)} />);
  });
});
