import React from 'react';
import ReactDOM from 'react-dom/client';
import { AccountWidgetProps, Account } from './account.js';

const config: AccountWidgetProps = {
  allowNickname: true,
  allowUserEdit: true,
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  projectId: import.meta.env.VITE_PROJECT_ID || 2,
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Account {...config} />
  </React.StrictMode>
);
