import React from 'react';
import ReactDOM from 'react-dom/client';
import { CounterWidgetProps, Counter } from './counter.js';

const config: CounterWidgetProps = {
  counterType: 'choiceGuideResults',
  widgetToFetchId: '6',
  label: 'Hoeveelheid',
  url: 'https://www.google.com',
  opinion: '',
  api: {
    url: 'http://localhost:31410',
  },
  projectId: '2'
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Counter {...config} />
  </React.StrictMode>
);
