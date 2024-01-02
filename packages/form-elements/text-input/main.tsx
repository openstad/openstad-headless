import {FormField, FormLabel, Paragraph, Textbox} from "@utrecht/component-library-react";

type Props = {
    title?: string;
    maxCharacters?: number;
};

function TextInput({
                       title = 'Wat wil je zeggen?',
    ...props
                   }: Props) {

    const randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    return (
        <FormField
            invalid
            type="text"
        >
            <Paragraph className="utrecht-form-field__label">
                <FormLabel htmlFor={randomID}>{title}</FormLabel>
            </Paragraph>
            <Paragraph className="utrecht-form-field__input">
                <Textbox
                    id={randomID}
                    invalid
                    name="message"
                    required
                    type="text"
                    maxLength={props.maxCharacters}
                />
            </Paragraph>
        </FormField>
    );
}

export {TextInput as default, TextInput};
