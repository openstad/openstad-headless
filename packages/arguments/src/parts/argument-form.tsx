import { Formik } from 'formik';

import '../index.css';
import { Reaction } from '../types';
import { Fragment, useState } from 'react';
import { GhostButton, Button, Spacer } from '@openstad-headless/ui/src';
import { Banner } from '@openstad-headless/ui/src';
import { Input } from '@openstad-headless/ui/src';

type Props = {
  title: string;
  arguments: Array<Reaction>;
};

function ArgumentsForm(props: Props) {
  const [reactionOpen, setReactionOpen] = useState<boolean>(true);
  const [loggedIn, setLoggedIn] = useState<boolean>(true);

  return (
    <>
      <section>
        <h4 className="arguments-title">{props.title}</h4>
        <Formik
          initialValues={{ reaction: '' }}
          onSubmit={({ reaction }) => {
            console.log({ reaction });
          }}>
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            /* and other goodies */
          }) => (
            <form onSubmit={handleSubmit}>
              {reactionOpen && !loggedIn ? (
                <Banner big>
                  <p>Inloggen om deel te nemen aan de discussie</p>
                  <Button>Inloggen</Button>
                </Banner>
              ) : null}

              {!reactionOpen && loggedIn ? (
                <Banner>
                  <p>
                    De reactiemogelijkheid is gesloten, u kunt niet meer
                    reageren
                  </p>
                </Banner>
              ) : null}

              {reactionOpen && loggedIn ? (
                <div className="input-container">
                  <Input
                    disabled
                    name="reaction"
                    placeholder="Type hier uw reactie"
                    onChange={handleChange}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter' || e.code === 'Enter') {
                        handleSubmit();
                      }
                    }}
                    onBlur={handleBlur}
                    value={values.reaction}
                  />

                  {errors.reaction && touched.reaction && errors.reaction}

                  <Spacer size={1} />
                </div>
              ) : null}
            </form>
          )}
        </Formik>

        <Spacer size={1} />

        {(props.arguments || []).map((argument, index) => (
          <Fragment key={index}>
            <section className="argument-item-header">
              <h6 className="reaction-name">{argument.name}</h6>
              <GhostButton icon="ri-more-fill"></GhostButton>
            </section>
            <p>{argument.description}</p>
            <section className="argument-item-footer">
              <p className="strong">23 mei 1993 11:01</p>
              <GhostButton icon="ri-thumb-up-line">Mee eens</GhostButton>
              <GhostButton>Reageren</GhostButton>
            </section>
            {argument.reactionsOnArgument.map((a) => {
              return (
                <div className="reaction-container">
                  <section className="argument-item-header">
                    <h6 className="reaction-name">{a.name}</h6>
                  </section>
                  <p>{a.description}</p>
                  <section className="argument-item-footer">
                    <p className="strong">23 mei 1993 11:01</p>
                  </section>
                </div>
              );
            })}
          </Fragment>
        ))}
      </section>
    </>
  );
}

export default ArgumentsForm;
