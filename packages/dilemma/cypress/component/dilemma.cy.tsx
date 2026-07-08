import DilemmaField from '../../src/dilemma';

describe('<DilemmaField />', () => {
  it('renders without crashing', () => {
    cy.mount(<DilemmaField {...({} as any)} />);
  });
});
