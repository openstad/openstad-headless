import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.scss';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App projectId='2' ideaId='1' apiUrl='http://localhost:31410' config={{}}/>
  </React.StrictMode>,
)
