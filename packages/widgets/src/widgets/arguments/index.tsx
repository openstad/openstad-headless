import 'remixicon/fonts/remixicon.css';

import './index.css';
import ArgumentsForm from './argument-form';
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

function Arguments(props: Props) {
  const reactions: Array<Reaction> = [
    {
      name: 'name',
      description:
        'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.',
      date: new Date(),
      reactionsOnArgument: [],
    },
  ];

  return (
    <>
      <h2 className="arguments-title">Argumenten</h2>
      <hr />

      <div className="arguments-container">
        <ArgumentsForm title="Argumenten voor" arguments={reactions} />
        <ArgumentsForm title="Argumenten tegen" arguments={reactions} />
      </div>
    </>
  );
}

export default Arguments;
