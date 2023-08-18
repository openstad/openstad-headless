import React from "react";

import Button from './button/index.jsx';
import Comments from './comments/index.jsx';
import User from './user/index.jsx';

import Hello from './Hello.jsx';
import Goodbye from './Goodbye.jsx';

// Lazy zou misschien mooier zijn, maar dan heb je de laloadWidget functie niet beschikbaar
// 
// import { lazy } from 'react';
// 
// let Button = lazy(() => import('./button/index.jsx'));
// let User = lazy(() => import('./user/index.jsx'));
// let Hello = lazy(() => import('./Hello.jsx'));
// let Goodbye = lazy(() => import('./Goodbye.jsx'));

export {
  Button,
  Comments,
  User,

  Hello,
  Goodbye,
}

