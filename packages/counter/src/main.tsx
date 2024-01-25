import React from 'react';
import ReactDOM from 'react-dom/client';
import { CounterWidgetProps, Counter } from './counter.js';

const config: CounterWidgetProps = {
  counterType: 'submission',
  label: 'Counter 1',
  url: 'https://www.google.com'
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Counter {...config} />
  </React.StrictMode>
);
