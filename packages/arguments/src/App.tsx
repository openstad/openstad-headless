import 'remixicon/fonts/remixicon.css';

import './index.css';
import { Toaster } from 'react-hot-toast';
import ArgumentsCollection from './parts/argument-collection';
import { Reaction } from './types';
import React from 'react';

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
      id: '1',
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
          userId: '2',
        },
      ],
      userId: '1',
    },
  ];

  return (
    <div className="openstad-widget">
      <h3 className="arguments-title">Argumenten</h3>
      <hr />

      <div className="arguments-container">
        <ArgumentsCollection
          title="Argumenten voor"
          arguments={reactions}
          onReactionAdded={(reaction, existingId) =>
            console.log({ reaction, existingId })
          }
        />
        <ArgumentsCollection
          title="Argumenten tegen"
          arguments={reactions}
          onReactionAdded={(reaction, existingId) =>
            console.log({ reaction, existingId })
          }
        />
      </div>
    </div>
  );
}

export default App;
