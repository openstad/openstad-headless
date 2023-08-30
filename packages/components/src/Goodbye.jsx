import { useState, useEffect, useCallback } from 'react';
import loadWidget from './lib/load-widget';
import DataStore from './data-store';

const Goodbye = function(props) {

  const datastore = new DataStore(props);

  const [ idea ] = datastore.useIdea({ ...props, ideaId: 3 });

  function handleClick(e) {
	  let event = new window.CustomEvent('klik', { detail: { inhoud: 'van het event' } });
	  window.dispatchEvent(event);
  }

	useEffect(() => {
		setTimeout(function() {
			// console.log('GOODBYE TIMER');
			idea.update({ title: 'Vivamus convallis ultricies ipsum ' + parseInt(10 + 90 * Math.random() ) });
		}, 1500)
	}, []);

  return (
    <>
      <h1>Goodbye component!</h1>
      Goodbye<br/>
      {JSON.stringify(props.config, null, 2)}<br/>
      <button onClick={e => handleClick(e)}>Klik hier</button>
      {idea && idea.title}
    </>
  );
}

Goodbye.loadWidget = loadWidget;

export {
  Goodbye as default,
  Goodbye,
};
