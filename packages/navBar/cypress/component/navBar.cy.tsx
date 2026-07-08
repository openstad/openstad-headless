import { NavBar } from '../../src/navBar';

describe('<NavBar />', () => {
  it('renders without crashing', () => {
    cy.mount(<NavBar {...({ home: '', content: [] } as any)} />);
  });
});
