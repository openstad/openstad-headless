import 'remixicon/fonts/remixicon.css';
import { Formik } from 'formik';

import './index.css';
import { Reaction } from './types';
import { Fragment } from 'react';
import { Input } from '../../components/input';
import { Heading } from '../../components/text';

type Props = {
  title: string;
  arguments: Array<Reaction>;
};

function ArgumentsForm(props: Props) {
  return (
    <>
      <section>
        <Heading size="sm" className="arguments-title">
          {props.title}
        </Heading>
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
              <div className="input-container">
                <Input
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
              </div>
            </form>
          )}
        </Formik>

        {(props.arguments || []).map((argument, index) => (
          <Fragment key={index}>
            <p>{argument.name}</p>
            <p>{argument.description}</p>
          </Fragment>
        ))}
      </section>
    </>
  );
}

export default ArgumentsForm;
