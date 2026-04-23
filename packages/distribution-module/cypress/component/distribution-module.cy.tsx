import { DistributionModule } from '../../src/distribution-module';

describe('<DistributionModule />', () => {
  it('renders without crashing', () => {
    cy.mount(<DistributionModule {...({} as any)} />);
  });
});
