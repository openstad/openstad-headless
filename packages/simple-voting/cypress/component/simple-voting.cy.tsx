import { SimpleVoting } from '../../src/simple-voting';

describe('<SimpleVoting />', () => {
  it('renders without crashing', () => {
    cy.mount(<SimpleVoting {...({} as any)} />);
  });
});
