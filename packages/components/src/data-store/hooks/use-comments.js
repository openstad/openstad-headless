import { useState } from 'react';

export default function useComments(props) {

  let self = this;

  const projectId = props.projectId || props.config.projectId;
  const ideaId = props.ideaId || props.config.ideaId;
  const sentiment = props.sentiment || props.config.sentiment || null;

  const { data, error, isLoading } = self.useSWR({ projectId, ideaId, sentiment }, 'comments.fetch');

  // add functionality
  let comments = data || [];
  comments.create = function(newData) {
    self.mutate({ projectId, ideaId, sentiment }, 'comments.create', newData, { action: 'create' });
  }
  comments.map( async comment => {
    comment.update = function(newData) {
      self.mutate({ projectId, ideaId, sentiment }, 'comments.update', newData, { action: 'update' });
    }
    comment.delete = function(newData) {
      self.mutate({ projectId, ideaId, sentiment }, 'comments.delete', comment, { action: 'delete' });
    }
    comment.submitLike = function() {
      self.mutate({ projectId, ideaId, sentiment }, 'comments.submitLike', comment, { action: 'update' });
    }
  })

  return [ comments, error, isLoading ];

}

