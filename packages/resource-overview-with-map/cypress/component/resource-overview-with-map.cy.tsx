import { ResourceOverviewWithMap } from '../../src/resourceOverviewWithMap';

describe('<ResourceOverviewWithMap />', () => {
  it('renders without crashing', () => {
    cy.mount(<ResourceOverviewWithMap {...({} as any)} />);
  });
});
