import { Activity } from '../../src/activity';

describe('<Activity />', () => {
  it('renders without crashing', () => {
    cy.mount(<Activity {...({ projectId: '1' } as any)} />);
  });
});
