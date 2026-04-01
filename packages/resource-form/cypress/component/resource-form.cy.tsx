import { ResourceFormWidget } from '../../src/resource-form';

describe('<ResourceFormWidget />', () => {
  it('renders without crashing', () => {
    cy.mount(<ResourceFormWidget {...({} as any)} />);
  });
});
