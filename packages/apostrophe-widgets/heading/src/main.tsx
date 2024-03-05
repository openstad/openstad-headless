import React from 'react'
import ReactDOM from 'react-dom/client'
import {Heading} from './heading.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Heading mode="h1" title="Dit is een hele mooie titel."/>
    <Heading mode="h2" title="Dit is een hele mooie titel. met customClass" customClass="--test"/>
    <Heading mode="h3" title="Dit is een hele mooie titel."/>
  </React.StrictMode>,
)
