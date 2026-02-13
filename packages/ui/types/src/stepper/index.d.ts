import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import React from 'react';

import '../index.css';
import './index.css';

type Props = {
  steps: Array<string>;
  currentStep?: number;
  isSimpleView?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;
declare const Stepper: (props: Props) => React.JSX.Element;
export { Stepper };
