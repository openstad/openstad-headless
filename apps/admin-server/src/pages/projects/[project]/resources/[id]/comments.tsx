import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useComments from '@/hooks/use-comments';
import Link from 'next/link';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import toast from 'react-hot-toast';

export default function ProjectResourceArguments() {
  const router = useRouter();
  const { project } = router.query;
  const { id } = router.query;
  const { data, removeComment } = useComments(project as string, `/${id}/comment?includeRepliesOnComments=1`);

  function renderComments(comments: any, pre = '') {
    return (
      <ul>
        {comments?.map((comment: any) => (
          <React.Fragment key={comment.id}>
            <li className={`grid grid-cols-3 lg:grid-cols-9 items-center py-3 px-2`}>
              <div className="col-span-1 truncate">
                <Paragraph>{comment.id}</Paragraph>
              </div>
              <Paragraph className="hidden lg:flex truncate lg:col-span-4" style={{marginRight: '1rem'}}>
                {pre && (<span style={{paddingRight: '15px'}}>{pre}</span>)} {comment.description}
              </Paragraph>
              <Paragraph className="hidden lg:flex truncate lg:col-span-2">
                {comment.createdAt}
              </Paragraph>
              <Paragraph className="hidden lg:flex truncate lg:col-span-1">
                {comment.sentiment}
              </Paragraph>
              <div className="hidden lg:col-span-1 lg:flex ml-auto">
                <RemoveResourceDialog
                  header="Reactie verwijderen"
                  message="Weet je zeker dat je deze reactie wilt verwijderen?"
                  onDeleteAccepted={() =>
                    removeComment(comment.id)
                      .then(() => toast.success('Reactie succesvol verwijderd'))
                      .catch((e) => toast.error('Reactie kon niet worden verwijderd'))
                  }
                />
              </div>
            </li>

            {comment.replies && comment.replies.length > 0 && (
              <span>{renderComments(comment.replies, "└")}</span>
            )}
          </React.Fragment>
        ))}
      </ul>
    );
  }

  return (
    <div>
        <div className="container px-0">
          <div className="p-6 bg-white rounded-md">
            <div
              className="grid lg:grid-cols-5 items-center py-2 px-2 border-b border-border"
              style={{gridTemplateColumns: "1fr 4fr 2fr 1fr 1fr"}}
            >
              <ListHeading className="hidden lg:flex">
                Reactie ID
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                Argument
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                Geplaatst op
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                Sentiment
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1 ml-auto"></ListHeading>
            </div>
            <ul>
              {renderComments(data)}
            </ul>
          </div>
        </div>
    </div>
  );
}
