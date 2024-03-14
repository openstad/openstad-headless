import React from 'react'
import ReactDOM from 'react-dom/client'
import {Footer} from './footer.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Footer 
      content='[
        {
          "title": "Over deze site",
          "items": [
            {
              "url": "https://www.utrecht.nl/privacy-statement/",
              "label": "Privacy"
            },
            {
              "url": "https://www.utrecht.nl/toegankelijkheid/",
              "label": "Toegankelijkheid"
            },
            {
              "url": "https://www.utrecht.nl/cookies/",
              "label": "Cookies"
            }
          ]
        },
        {
          "title": "Taal",
          "items": [
            {
              "url": "#",
              "label": "NL Nederlands"
            },
            {
              "url": "#",
              "label": "EN English"
            }
          ]
        },
        {
          "title": "Contact",
          "items": [
            {
              "url": "#",
              "label": "Veelgestelde vragen"
            },
            {
              "url": "#",
              "label": "Hou mij op de hoogte"
            },
            {
              "url": "#",
              "label": "Neem contact op"
            }
          ]
        }
      ]'
    />
  </React.StrictMode>,
)
