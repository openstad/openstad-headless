import { createRoot } from "react-dom/client";

export default function loadWidget(elementId, props) {

  const Component = this;
  
  const container = document.getElementById(elementId);
  const root = createRoot(container);
  root.render(<Component {...props}/>);

}
