import { DocumentMap } from '../../src/document-map';

describe('<DocumentMap />', () => {
  it('renders without crashing', () => {
    cy.mount(<DocumentMap {...({} as any)} />);
  });
});
