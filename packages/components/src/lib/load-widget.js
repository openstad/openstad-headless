import { createRoot } from "react-dom/client";

export default function loadWidget(elementId, config) {

  const Component = this;
  
  const container = document.getElementById(elementId);
  const root = createRoot(container);
  root.render(<Component config={config}/>);

  // console.log(1, componentName, elementId, config);

}
