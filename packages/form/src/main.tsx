import React from 'react';
import ReactDOM from 'react-dom/client';
import { Form } from './form.js';
import './form.css';

const config = {
  maxCharacters: 50,
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Form config={config} />
  </React.StrictMode>
);
