import '../index.css';
import { Reaction } from '../types/index.js';
import { useState } from 'react';
import { Button, Spacer } from '@openstad-headless/ui/src';
import { Banner } from '@openstad-headless/ui/src';
import ReactionItem from './reaction.js';
import ReactionInput from './reaction-input.js';

type Props = {
  title: string;
  arguments: Array<Reaction>;
  onReactionAdded: (reaction: Reaction, id?: string) => void;
};

function ArgumentsCollection(props: Props) {
  const [reactionOpen, setReactionOpen] = useState<boolean>(true);
  const [loggedIn, setLoggedIn] = useState<boolean>(true);
  const userId = '2'; // get from logged in user
  const resourceId = '1'; // get from config

  return (
    <section>
      <h4 className="arguments-title">{props.title}</h4>

      {reactionOpen && !loggedIn ? (
        <Banner big>
          <p>Inloggen om deel te nemen aan de discussie</p>
          <Button>Inloggen</Button>
        </Banner>
      ) : null}

      {!reactionOpen && loggedIn ? (
        <Banner>
          <p>De reactiemogelijkheid is gesloten, u kunt niet meer reageren</p>
        </Banner>
      ) : null}

      {reactionOpen && loggedIn ? (
        <div className="input-container">
          <ReactionInput resourceId={resourceId} />
          <Spacer size={1} />
        </div>
      ) : null}

      <Spacer size={1} />

      {(props.arguments || []).map((argument, index) => (
        <ReactionItem
          resourceId={resourceId}
          canEdit={(arg) => userId !== arg.userId}
          argument={argument}
          key={index}
        />
      ))}
    </section>
  );
}

export default ArgumentsCollection;
