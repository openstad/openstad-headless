import 'remixicon/fonts/remixicon.css';

import './index.css';
import ArgumentsForm from './parts/argument-form';
import { Reaction } from './types';

type Props = {
  // projectId?: string;
  // ideaId?: string;
  // apiUrl?: string;
  // config: {
  //   projectId?: string;
  //   ideaId?: string;
  //   api?: {
  //     url: string;
  //   };
  //   votesNeeded?: number;
  // };
};

function App(props: Props) {
  const reactions: Array<Reaction> = [
    {
      name: 'Name',
      description:
        'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.',
      date: new Date(),
      reactionsOnArgument: [
        {
          name: 'Name',
          description:
            'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.',
          date: new Date(),
          reactionsOnArgument: [],
        },
      ],
    },
  ];

  return (
    <>
      <h3 className="arguments-title">Argumenten</h3>
      <hr />

      <div className="arguments-container">
        <ArgumentsForm title="Argumenten voor" arguments={reactions} />
        <ArgumentsForm title="Argumenten tegen" arguments={reactions} />
      </div>
    </>
  );
}

export default App;
