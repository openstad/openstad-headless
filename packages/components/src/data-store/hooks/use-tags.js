import { useState } from 'react';

export default function useTags(props) {

  let self = this;

  const projectId = props.projectId || props.config.projectId;
  const type = props.type || props.config.type;

  const { data, error, isLoading } = self.useSWR({ projectId, type }, 'tags.fetch');

  // add functionality
  let tags = data || [];
  tags.create = function(newData) {
    return self.mutate({ projectId, type }, 'tags.create', newData, { action: 'create' });
  }
  tags.map( async tag => {
    tag.update = function(newData) {
      return self.mutate({ projectId, type }, 'tags.update', newData, { action: 'update' });
    }
    tag.delete = function(newData) {
      return self.mutate({ projectId, type }, 'tags.delete', tag, { action: 'delete' });
    }
    tag.submitLike = function() {
      return self.mutate({ projectId, type }, 'tags.submitLike', tag, { action: 'update' });
    }
  })

  return [ tags, error, isLoading ];

}

