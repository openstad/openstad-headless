import {FormField, FormLabel, Paragraph, Textarea} from "@utrecht/component-library-react";

type Props = {
    title?: string;
};

function TextArea({
                       title = 'Wat wil je zeggen? Je hebt nu genoeg ruimte om je gedachtes uit te leggen.',
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
                <Textarea
                    id={randomID}
                    invalid
                    name="message"
                    required
                    type="text"
                />
            </Paragraph>
        </FormField>
    );
}

export {TextArea as default, TextArea};
