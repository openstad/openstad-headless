import { RawResource } from '../../src/raw-resource';

describe('<RawResource />', () => {
  it('renders without crashing', () => {
    cy.mount(<RawResource {...({} as any)} />);
  });
});
