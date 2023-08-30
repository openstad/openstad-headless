import { useState, useEffect, useCallback } from 'react';
import DataStore from './data-store';

const HelloChild = function(props) {

  const datastore = new DataStore(props);

  const [statusText, setStatusText] = useState('-');
  const [statusCount, setStatusCount] = useState(0);

  const [ idea, error, isLoading ] = datastore.useIdea({ ...props, ideaId: 3 });

  const handleKlik = useCallback(async event => {
    let detail = event.detail;
    await setStatusCount(prevValue => prevValue + 1);
    console.log(statusCount);
    setStatusText(prevValue => `Je klikte in een andere component. Event data: ${JSON.stringify(detail, null, 2)}`);
  }, []);

  useEffect(() => {
    
    window.addEventListener("klik", handleKlik);
    return () => {
      window.removeEventListener("klik", handleKlik);
    };
  }, [handleKlik]);

  return (
    <>
      <h1>HelloChild Component</h1>
      {JSON.stringify(props.config, null, 2)}<br/>
      {statusText}{statusCount > 1 ? '. Alweer (' + ( statusCount ) + ') ' : ''}<br/>
      <span style={{ color: idea && idea.can && idea.can.edit ? 'green' : 'black' }}>{idea && idea.title}</span><br/>
      <br/><br/>
      {/*
         1. {isLoading}<br/>
         2. {error}<br/>
         3. {JSON.stringify(data, null, 2)}<br/>
       */}
    </>
  );
}

export default HelloChild;
