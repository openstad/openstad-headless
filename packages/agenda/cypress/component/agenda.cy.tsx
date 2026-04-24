import { Agenda } from '../../src/agenda';

describe('<Agenda />', () => {
  it('renders without crashing', () => {
    cy.mount(<Agenda {...({} as any)} />);
  });
});
