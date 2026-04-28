import Form from '../../src/form';

describe('<Form />', () => {
  it('renders without crashing', () => {
    cy.mount(<Form {...({} as any)} />);
  });
});
