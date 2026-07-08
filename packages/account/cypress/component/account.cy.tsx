import { Account } from '../../src/account';

describe('<Account />', () => {
  it('renders without crashing', () => {
    cy.mount(<Account {...({} as any)} />);
  });
});
