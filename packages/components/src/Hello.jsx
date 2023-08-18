import { useState, useEffect, useCallback } from 'react';
import loadWidget from './lib/load-widget';
import HelloChild from './HelloChild';


const Hello = function(props) {

  let [xxx, setxxx] = useState([1]);

  setTimeout(function() {
    if (xxx.length < 3) {
      xxx.push(xxx.length+1);
      setxxx([...xxx]);
    }
  }, 2000)
  
  return (
    <>
      <h1>Hello</h1>
      {xxx.map( nr => <HelloChild {...props} nr={nr} key={nr}/> )}
    </>
  );
}

Hello.loadWidget = loadWidget;

export {
  Hello as default,
  Hello,
};
