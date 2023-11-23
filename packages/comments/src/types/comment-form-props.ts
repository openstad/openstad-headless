import CommentType from '../../types/comment.ts';

type Props = {
  comment: CommentType;
  descriptionMinLength: number;
  descriptionMaxLength: number;
  placeholder: string;
  formIntro: string;
  requiredUserRole: string;
};

export {
  Props as default,
}
