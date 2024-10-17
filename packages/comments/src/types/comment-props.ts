import {Comment} from '@openstad-headless/types';
import React, { Dispatch, SetStateAction } from "react";

export type CommentProps = {
  comment: Comment;
  selected?: boolean;
  type?: string;
  index?: number;
  showDateSeperately?: boolean;
  submitComment?: (e: any) => void;
  setRefreshComments: () => void;
  adminLabel?: string;
  disableSubmit?: boolean;
};
