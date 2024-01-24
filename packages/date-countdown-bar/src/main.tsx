import React from 'react';
import ReactDOM from 'react-dom/client';
import { DateDropdownBarWidgetProps, DateDropdownBar } from './date-countdown-bar.js';

const config: DateDropdownBarWidgetProps = {
  date: '27-01-2024',
  beforeText: 'Het is nog niet geweest',
  afterText:"Het is al geweest"
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DateDropdownBar {...config} />
  </React.StrictMode>
);
