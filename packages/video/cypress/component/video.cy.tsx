import VideoField from '../../src/video';

describe('<VideoField />', () => {
  it('renders without crashing', () => {
    cy.mount(<VideoField {...({} as any)} />);
  });
});
