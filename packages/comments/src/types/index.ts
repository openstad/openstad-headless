import { BaseProps } from '../types/base-props.ts';
import { CommentsProps } from './comments-props.ts';
import { CommentProps } from './comment-props.ts';
import { CommentFormProps } from './comment-form-props.ts';

type Props = {
} & BaseProps & CommentsProps & CommentProps & CommentFormProps;

export {
  Props as default,
}


