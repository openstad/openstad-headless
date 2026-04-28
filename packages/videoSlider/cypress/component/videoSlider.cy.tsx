import { VideoSlider } from '../../src/videoSlider';

describe('<VideoSlider />', () => {
  it('renders without crashing', () => {
    cy.mount(<VideoSlider {...({} as any)} />);
  });
});
