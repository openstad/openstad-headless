import { DateCountdownBar } from '../../src/date-countdown-bar';

describe('<DateCountdownBar />', () => {
  it('renders without crashing', () => {
    cy.mount(<DateCountdownBar {...({} as any)} />);
  });
});
