import { ResourceOverview } from '../../src/resource-overview';

describe('<ResourceOverview />', () => {
  it('renders without crashing', () => {
    cy.mount(<ResourceOverview {...({} as any)} />);
  });
});
