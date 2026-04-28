import { Comments } from '../../src/comments';

describe('<Comments />', () => {
  it('renders without crashing', () => {
    cy.mount(<Comments {...({} as any)} />);
  });
});
