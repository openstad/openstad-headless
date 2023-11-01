import 'remixicon/fonts/remixicon.css';
import Likes from './widgets/like';

function App() {
  return (
    <>
      <Likes
        projectId="2"
        ideaId="1"
        apiUrl="http://localhost:31410"
        config={{}}
      />
    </>
  );
}

export default App;
