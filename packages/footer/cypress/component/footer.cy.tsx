import { Footer } from '../../src/footer';

describe('<Footer />', () => {
  it('renders without crashing', () => {
    cy.mount(<Footer {...({ content: '' } as any)} />);
  });
});
