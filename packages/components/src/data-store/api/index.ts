import fetchx from './fetch';
import idea from './idea';
import comments from './comments';
import ideas from './ideas';
import tags from './tags';
import user from './user';
import { WidgetConfig } from '../../types/config';

declare global {
  interface Window {
    OpenStadAPI: ApiInstance | null;
  }
}

window.OpenStadAPI = null;
export default function singelton(props: WidgetConfig = { config: {} }) {
  return (window.OpenStadAPI = window.OpenStadAPI || new ApiInstance(props));
}

export class ApiInstance {
  apiUrl: string;
  projectId: number;

  constructor(props: WidgetConfig = { config: {} }) {
    this.apiUrl = props.apiUrl || props.config?.api?.url || null;
    this.projectId = props.projectId || props.config?.projectId || 0;
  }

  fetch = (url?: string, options?: {}) => fetchx(url, options);
  user: typeof user = user;
  comments: typeof comments = comments;
  idea: typeof idea = idea;
  ideas: typeof ideas = ideas;
  tags: typeof tags = tags;
}
