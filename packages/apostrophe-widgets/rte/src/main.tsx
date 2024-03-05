import React from 'react'
import ReactDOM from 'react-dom/client'
import {RTE} from './rte.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RTE 
      content='
      <h3>Utrecht heading 3</h3>
      <h4>Utrecht heading 4</h4>
      <p>
        <strong>Lorem ipsum dolor sit amet, consectetur adipiscing elit. </strong>
        Aliquam fermentum aliquam nulla, vitae convallis eros rutrum sed. 
        Nullam semper quis arcu vitae venenatis. 
        Suspendisse nec tristique ante. 
        Donec tempor vestibulum pellentesque. 
        Morbi consequat feugiat lacus sit amet viverra. 
        Nulla facilisi. Vestibulum porta, quam vel sollicitudin rutrum, ante erat euismod lorem, in congue massa nisl iaculis sapien. Praesent ac sapien justo. 
        <a href="#" target="_blank">
          Phasellus sit amet congue neque. 
          Nam feugiat neque sed bibendum tristique.
        </a>
      </p>
      <p>
        Praesent vestibulum tincidunt nibh non imperdiet. 
        Donec convallis augue varius nulla pellentesque, vel iaculis sapien dapibus. Nam luctus, justo vel vehicula lacinia, justo purus consequat quam, vitae posuere enim elit non odio. 
        Pellentesque auctor vitae nibh quis pharetra. Fusce gravida accumsan purus, sed molestie augue imperdiet sit amet. Aenean et libero non purus rhoncus viverra in ac erat. 
        Integer eget fringilla purus. Donec aliquam tempus volutpat. 
        Curabitur ultrices orci in enim efficitur, non gravida justo fermentum. 
        Duis iaculis metus sed consectetur vestibulum.
        <a href="#">
        Phasellus sit amet congue neque. 
        Nam feugiat neque sed bibendum tristique.
      </a>
      </p>

      <ol>
        <li>Utrecht ordered list item 1</li>
        <li>Utrecht ordered list item 2</li>
        <li>Utrecht ordered list item 3</li>
        <li>Utrecht ordered list item 4</li>
      </ol>

      <ul>
        <li>Utrecht unordered list item 1</li>
        <li>Utrecht unordered list item 2</li>
        <li>Utrecht unordered list item 3</li>
        <li>Utrecht unordered list item 4</li>
      </ul>
      ' 
    />
  </React.StrictMode>,
)
