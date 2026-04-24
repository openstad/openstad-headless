import { ChoiceGuide } from '../../src/choiceguide';

describe('<ChoiceGuide />', () => {
  it('renders without crashing', () => {
    cy.mount(<ChoiceGuide {...({} as any)} />);
  });
});
