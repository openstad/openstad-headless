import { Likes } from '../../src/likes';

describe('<Likes />', () => {
  it('renders without crashing', () => {
    cy.mount(<Likes {...({} as any)} />);
  });
});
