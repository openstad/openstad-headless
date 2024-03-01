import React from 'react'
import ReactDOM from 'react-dom/client'
import { Accordion } from './accordion.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Accordion 
      label='test label' 
      content='<h1>test-title</h1><p>content <a href="#">test</a></p>' 
    />
  </React.StrictMode>,
)
