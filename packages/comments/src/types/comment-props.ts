import { Comment } from '@openstad-headless/types';
import React, { Dispatch, SetStateAction } from 'react';

export type CommentProps = {
  comment: Comment;
  selected?: boolean;
  disableReplyFeatures?: boolean;
  disableLocationLink?: boolean;
  keepMenuIconStatic?: boolean;
  type?: string;
  index?: number;
  showDateSeperately?: boolean;
  submitComment?: (e: any) => void;
  setRefreshComments: () => void;
  staffLabel?: string;
  disableSubmit?: boolean;
  extraReplyButton?: boolean;
  variant?: 'micro-score' | 'medium';
};
