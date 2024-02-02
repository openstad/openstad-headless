import React from 'react';
import ReactDOM from 'react-dom/client';
import { CounterWidgetProps, Counter } from './counter.js';

const config: CounterWidgetProps = {
  counterType: 'resource',
  label: 'Hoeveelheid',
  url: 'https://www.google.com',
  opinion: '',
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Counter {...config} />
  </React.StrictMode>
);
