// Button.stories.ts|tsx

// Replace your-framework with the name of your framework
import type { Meta, StoryObj } from '@storybook/react';

import LikeButtons from '../../voting/like-buttons';

const meta: Meta<typeof LikeButtons> = {
  component: LikeButtons,
};

export default meta;
type Story = StoryObj<typeof LikeButtons>;

//👇 Throws a type error it the args don't match the component props
export const Primary: Story = {
  name: 'Like widget',
  args: {
    projectId: 2,
    config: { api: { url: 'https://api.demo.openstad.dev' } },
  },
};
