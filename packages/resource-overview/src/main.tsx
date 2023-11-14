import React from 'react';
import ReactDOM from 'react-dom/client';
import Widget from './widget.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Widget resources={['dsaf', 's', 's']} />
  </React.StrictMode>
);
