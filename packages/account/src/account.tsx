import { loadWidget } from '@openstad-headless/lib/load-widget';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import { FormFieldTextbox, Heading, Paragraph, Button } from '@utrecht/component-library-react';
import React, { useState } from 'react';
import './account.css';
import DataStore from '@openstad-headless/data-store/src';
import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';

export type AccountWidgetProps = BaseProps &
  AccountProps &
  ProjectSettingProps & {
    resourceId?: string;
  };

export type AccountProps = {
  allowNickname?: boolean;
  minLength?: number;
  maxLength?: number;
  allowUserEdit?: boolean;
};

function Account({
  allowNickname,
  minLength = 2,
  maxLength = 140,
  allowUserEdit = true,
  ...props
}: AccountWidgetProps) {
  const urlParams = new URLSearchParams(window.location.search);
  const resourceId =
    urlParams.get('openstadResourceId') || props.resourceId || '';

  const [canEditNickname, setCanEditNickname] = useState(false);
  const [canEditUser, setCanEditUser] = useState(false);
  const [editButtonText] = useState([['Bewerken'], ['Opslaan']]);

  const [formData] = useState({
    email: {
      value: 'test@draad.nl',
      label: 'E-mailadres',
    },
    firstname: {
      value: 'John',
      label: 'Voornaam',
    },
    lastname: {
      value: 'Doe',
      label: 'Achternaam',
    },
    postalCode: {
      value: '1234AB',
      label: 'Postcode',
    },
    nickname: {
      value: 'johndoe12',
      label: 'Schermnaam',
    }
  });

  return (
    <section className="account">
      <div>
        <FormFieldTextbox
          label={formData.email.label}
          description="Niet aanpasbaar"
          name="mail"
          readOnly
          value={formData.email.value}
          maxLength={maxLength}
          minLength={minLength}
        />
      </div>
      <div>
        {allowUserEdit && (
          <Button className="account-edit-button" appearance={'primary-action-button'} onClick={() => (
            setCanEditUser(!canEditUser)
          )}>{canEditUser ? editButtonText[1] : editButtonText[0]}</Button>
        )}
        <FormFieldTextbox
          label={formData.firstname.label}
          name="firstname"
          maxLength={maxLength}
          minLength={minLength}
          defaultValue={formData.firstname.value}
          readOnly={!canEditUser}
        />
        <FormFieldTextbox
          label={formData.lastname.label}
          name="lastname"
          maxLength={maxLength}
          minLength={minLength}
          defaultValue={formData.lastname.value}
          readOnly={!canEditUser}
        />
        <FormFieldTextbox
          label={formData.postalCode.label}
          name="postalCode"
          maxLength={maxLength}
          minLength={minLength}
          defaultValue={formData.postalCode.value}
          readOnly={!canEditUser}
        />
      </div>
      {allowNickname && (
        <div>
          <Heading level={2}>Mijn gegevens voor deze site</Heading>
          <Paragraph>
            Deze gegevens zijn alleen van toepassing op deze website.
          </Paragraph>

          {allowUserEdit && (
            <Button className="account-edit-button" appearance={'primary-action-button'} onClick={() => (
              setCanEditNickname(!canEditNickname)
            )}>{canEditNickname ? editButtonText[1] : editButtonText[0]}</Button>
          )}
          <FormFieldTextbox
            label={formData.nickname.label}
            name="nickname"
            maxLength={maxLength}
            minLength={minLength}
            defaultValue={formData.nickname.value}
            readOnly={!canEditNickname}
          />
        </div>
      )}
    </section>
  );
}

Account.loadWidget = loadWidget;
export { Account };
