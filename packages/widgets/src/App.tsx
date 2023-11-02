import 'remixicon/fonts/remixicon.css';
import Likes from './widgets/like';
import Arguments from './widgets/arguments';
import './index.css';

function App() {
  return (
    <>
      <Likes
        projectId="2"
        ideaId="1"
        apiUrl="http://localhost:31410"
        config={{}}
      />

      <br />
      <Arguments />
    </>
  );
}

export default App;
