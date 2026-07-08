import { MultiProjectResourceOverview } from '../../src/multi-project-resource-overview';

describe('<MultiProjectResourceOverview />', () => {
  it('renders without crashing', () => {
    cy.mount(<MultiProjectResourceOverview {...({} as any)} />);
  });
});
