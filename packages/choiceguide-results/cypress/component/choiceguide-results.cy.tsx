import { ChoiceGuideResults } from '../../src/choiceguide-results';

describe('<ChoiceGuideResults />', () => {
  it('renders without crashing', () => {
    cy.mount(<ChoiceGuideResults {...({} as any)} />);
  });
});
