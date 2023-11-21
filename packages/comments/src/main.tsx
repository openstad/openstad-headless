import React from 'react';
import ReactDOM from 'react-dom/client';
import { Comments } from './comments.js';

const config = {
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  projectId: import.meta.env.VITE_PROJECT_ID,
  ideaId: import.meta.env.VITE_IDEA_ID,
  login: {
    label: import.meta.env.VITE_LOGIN_LABEL,
    url: `${import.meta.env.VITE_API_URL}/auth/project/${import.meta.env.VITE_PROJECT_ID}/login?forceNewLogin=1&useAuth=default&redirectUri=${document.location}`
  },
  sentiment: import.meta.env.VITE_SENTIMENT,
  emptyListText: import.meta.env.VITE_EMPTY_LIST_TEXT,
  title: import.meta.env.VITE_TITLE,
  descriptionMinLength: import.meta.env.VITE_DESCRIPTION_MIN_LENGTH,
  descriptionMaxLength: import.meta.env.VITE_DESCRIPTION_MAX_LENGTH,
  placeholder: import.meta.env.VITE_PLACEHOLDER,
  formIntro: import.meta.env.VITE_FORM_INTRO,
  commentsIsOpen: import.meta.env.VITE_COMMENTS_IS_OPEN != 'false',
  commentsIsClosedText: import.meta.env.VITE_COMMENTS_IS_CLOSED_TEXT,
  isVotingEnabled: import.meta.env.VITE_IS_VOTING_ENABLED != 'false',
  isReplyingEnabled: import.meta.env.VITE_IS_REPLYING_ENABLED != 'false',
  requiredUserRole: import.meta.env.VITE_REQUIRED_USER_ROLE,
  userNameFields: eval(import.meta.env.VITE_USER_NAME_FIELDS),
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Comments
      {...config}
      config={config}
    />
  </React.StrictMode>
);

