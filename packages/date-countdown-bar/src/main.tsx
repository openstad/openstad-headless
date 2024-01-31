import React from 'react';
import ReactDOM from 'react-dom/client';
import { DateCountdownBarWidgetProps, DateCountdownBar } from './date-countdown-bar.js';

const config: DateCountdownBarWidgetProps = {
  date: '27-05-2024',
  beforeText: 'Het is nog niet geweest',
  afterText:"Het is al geweest"
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DateCountdownBar {...config} />
  </React.StrictMode>
);
