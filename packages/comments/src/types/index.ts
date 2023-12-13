import { BaseProps } from '../../../types/base-props';
import { CommentsProps } from './comments-props';
import { CommentProps } from './comment-props';
import { CommentFormProps } from './comment-form-props';

export type CommentPropsType = CommentsProps & CommentProps & CommentFormProps;
