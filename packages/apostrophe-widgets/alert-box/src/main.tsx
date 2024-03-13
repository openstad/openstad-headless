import React from 'react'
import ReactDOM from 'react-dom/client'
import {AlertBox} from './alert-box.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AlertBox content="Stuur je plan in tot en met 27 maart. Like je favoriete plan(nen) tot en met 3 april!"></AlertBox>
  </React.StrictMode>,
)
