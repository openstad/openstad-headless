import React from 'react';
import ReactDOM from 'react-dom/client';
import { Comments, CommentsWidgetProps } from './comments.js';

const config: CommentsWidgetProps = {
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  projectId: import.meta.env.VITE_PROJECT_ID,
  resourceId: import.meta.env.VITE_RESOURCE_ID,
  login: {
    label: import.meta.env.VITE_LOGIN_LABEL,
    url: `${import.meta.env.VITE_API_URL}/auth/project/${import.meta.env.VITE_PROJECT_ID
      }/login?forceNewLogin=1&useAuth=default&redirectUri=${document.location}`,
  },
  sentiment: import.meta.env.VITE_SENTIMENT || 'for',
  emptyListText: import.meta.env.VITE_EMPTY_LIST_TEXT,
  title: import.meta.env.VITE_TITLE,
  placeholder: import.meta.env.VITE_PLACEHOLDER,
  formIntro: import.meta.env.VITE_FORM_INTRO,
  comments: {
    canComment: (import.meta.env.VITE_COMMENTS_CAN_COMMENT != 'false'),
    canLike: (import.meta.env.VITE_COMMENTS_CAN_LIKE != 'false'),
    canReply: (import.meta.env.VITE_COMMENTS_CAN_REPLY != 'false'),
    closedText: import.meta.env.VITE_COMMENTS_CLOSED_TEXT,
    requiredUserRole: import.meta.env.VITE_COMMENTS_REQUIRED_USER_ROLE || 'member',
    descriptionMinLength: import.meta.env.VITE_COMMENTS_DESCRIPTION_MIN_LENGTH || 30,
    descriptionMaxLength: import.meta.env.VITE_COMMENTS_DESCRIPTION_MAX_LENGTH || 500,
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Comments {...config} />
  </React.StrictMode>
);
