import React from 'react'
import ReactDOM from 'react-dom/client'
import {Button} from './button.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Button 
        direction="row"
        buttons={`[
          {
            "label": "test label 1",
            "href": "#",
            "appearance": "primary-action-button",
            "target": "_blank"
          },
          {
            "label": "test label 2",
            "href": "#",
            "appearance": "secondary-action-button",
            "target": "_self"
          }
        ]`}></Button>
  </React.StrictMode>,
)
