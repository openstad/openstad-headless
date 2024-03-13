import React from 'react'
import ReactDOM from 'react-dom/client'
import { ShareLinks } from './share-links.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ShareLinks
      title="Deel dit plan"
    ></ShareLinks>
  </React.StrictMode>,
)
