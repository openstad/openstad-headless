import '../index.css';
import { Fragment, useState } from 'react';
import { GhostButton } from '@openstad-headless/ui/src';
import { Reaction } from '../types/index.js';
import ReactionInput from './reaction-input.js';
import { DropDownMenu } from '@openstad-headless/ui/src';

export default function ReactionItem({
  resourceId,
  argument,
  canEdit,
}: {
  resourceId: string;
  argument: Reaction;
  canEdit?: (arg: Reaction) => boolean;
}) {
  const [showInputFieldOnArgument, setShowing] = useState<boolean>();

  return (
    <Fragment>
      <section className="argument-item-header">
        <h6 className="reaction-name">{argument.name}</h6>
        {canEdit && canEdit(argument) ? (
          <DropDownMenu
            items={[
              { label: 'Verwijderen', onClick: () => console.log('test') },
            ]}>
            <GhostButton icon="ri-more-fill"></GhostButton>
          </DropDownMenu>
        ) : null}
      </section>
      <p>{argument.description}</p>
      <section className="argument-item-footer">
        <p className="strong">23 mei 1993 11:01</p>
        <GhostButton icon="ri-thumb-up-line">Mee eens</GhostButton>
        <GhostButton onClick={() => setShowing(!showInputFieldOnArgument)}>
          Reageren
        </GhostButton>
      </section>
      {showInputFieldOnArgument ? (
        <ReactionInput resourceId={resourceId} parentCommentId={argument.id} />
      ) : null}

      {argument.reactionsOnArgument.map((a) => {
        return (
          <div className="reaction-container">
            <section className="argument-item-header">
              <h6 className="reaction-name">{a.name}</h6>
              {canEdit && canEdit(a) ? (
                <GhostButton icon="ri-more-fill"></GhostButton>
              ) : null}
            </section>
            <p>{a.description}</p>
            <section className="argument-item-footer">
              <p className="strong">23 mei 1993 11:01</p>
            </section>
          </div>
        );
      })}
    </Fragment>
  );
}
