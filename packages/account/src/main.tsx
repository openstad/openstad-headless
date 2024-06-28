import React from 'react';
import ReactDOM from 'react-dom/client';
import { AccountWidgetProps, Account } from './account.js';

const config: AccountWidgetProps = {
  allowNickname: true,
  allowUserEdit: true,
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Account {...config} />
  </React.StrictMode>
);
