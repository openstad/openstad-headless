import { ResourceDetailWithMap } from '../../src/resourceDetailWithMap';

describe('<ResourceDetailWithMap />', () => {
  it('renders without crashing', () => {
    cy.mount(<ResourceDetailWithMap {...({} as any)} />);
  });
});
