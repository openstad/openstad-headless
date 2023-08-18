import { useState } from 'react';

export default function useIdea(props) {

  let self = this;

  const projectId = props.projectId || props.config.projectId;
  const ideaId = props.ideaId || props.config.ideaId;
  const { data, error, isLoading } = self.useSWR({ projectId, ideaId }, 'idea.fetch');
  
  async function setIdea(newData) {
    self.mutate({ projectId, ideaId }, 'idea.update', newData);
  }

  return [ data || {}, setIdea, error, isLoading ];

}

