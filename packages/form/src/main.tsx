import React from 'react';
import ReactDOM from 'react-dom/client';
import Form from './form.js';

const fields = [
    {
        type: 'text',
        title: 'Test titel voor tekstveld',
        minCharacters: 5,
        maxCharacters: 20,
        fieldRequired: true,
        requiredWarning: "Dit veld is verplicht",
        fieldKey: "text_1",
    },
    {
        type: 'text',
        title: 'Test titel voor tekstveld',
        minCharacters: 5,
        maxCharacters: 20,
        fieldRequired: true,
        requiredWarning: "Dit veld is verplicht",
        fieldKey: "text_2",
        variant: 'textarea',
    },
    {
        type: 'range',
        question: "Hoe gaat het?",
        labelA: "Slecht",
        labelB: "Goed",
        titleA: "Het kan beter",
        titleB: "Het kan slechter",
        fieldRequired: true,
        requiredWarning: "Dit veld is verplicht",
        fieldKey: "range_1",
    },
    {
        type: 'checkbox',
        question: "Wat geef je?",
        choices: ["Optie 1", "Optie 2", "Optie 3"],
        fieldKey: "checkbox_field_1",
        fieldRequired: true,
        requiredWarning: "Dit veld is verplicht",
    },
    {
        type: 'radiobox',
        question: "Wat geef je?",
        choices: ["Optie A", "Optie B", "Optie C"],
        fieldRequired: true,
        requiredWarning: "Dit veld is verplicht",
        fieldKey: "checkbox_1",
    },
    {
        type: 'select',
        title: "Kies een optie",
        choices: ["Optie X", "Optie Y", "Optie Z"],
        fieldKey: "select_1",
        fieldRequired: true,
        requiredWarning: "Dit veld is verplicht",
    },
    {
        type: 'tickmark-slider',
        question: "Hoe blij ben je?",
        fieldOptions: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' },
        ],
        fieldKey: "tickmark_slider_1",
        fieldRequired: true,
        requiredWarning: "Dit veld is verplicht",
    },
    {
        type: 'upload',
        title: 'Upload je foto',
        fieldRequired: true,
        requiredWarning: "Dit veld is verplicht",
        fieldKey: "image_1",
        variant: 'multiple',
        allowedTypes: 'image/png, image/jpeg',
    },
];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Form
        fields={fields}
        submitHandler={(data) => console.log(data)}
    />
  </React.StrictMode>
);
