import { BaseProps } from '../../../types/base-props';
import { CommentsProps } from './comments-props';
import { CommentProps } from './comment-props';
import { CommentFormProps } from './comment-form-props';

type Props = {} & BaseProps & CommentsProps & CommentProps & CommentFormProps;

export { Props as default };
