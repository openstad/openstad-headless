import { StemBegroot } from '../../src/stem-begroot';

describe('<StemBegroot />', () => {
  it('renders without crashing', () => {
    cy.mount(<StemBegroot {...({} as any)} />);
  });
});
