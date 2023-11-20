import React from "react";

import About from './about/index.jsx';
import Button from './button/index.jsx';
import Comments from './comments/index.jsx';
import IdeaDetails from './idea-details/index.jsx';
import IdeasOverview from './ideas-overview/index.jsx';
import ParticipativeBudgeting from './participative-budgeting/index.jsx';
import User from './user/index.jsx';

// Lazy zou misschien mooier zijn, maar dan heb je de loadWidget functie niet beschikbaar
// 
// import { lazy } from 'react';
// 
// let Button = lazy(() => import('./button/index.jsx'));
// let User = lazy(() => import('./user/index.jsx'));

export {
  About,
  Button,
  Comments,
  IdeasOverview,
  IdeaDetails,
  ParticipativeBudgeting,
  User,
}

