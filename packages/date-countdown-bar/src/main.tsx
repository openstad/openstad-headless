import React from 'react';
import ReactDOM from 'react-dom/client';
import { DateCountdownBarWidgetProps, DateCountdownBar } from './date-countdown-bar.js';

const config: DateCountdownBarWidgetProps = {
  date: '2024-05-08',
  beforeText: 'Zoveel tijd heb je nog om te stemmen',
  afterText:"Zoveel tijd heb je nog om te stemmen",
  direction: 'horizontal',
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DateCountdownBar {...config} />
  </React.StrictMode>
);
