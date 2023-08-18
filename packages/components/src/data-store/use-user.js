import { useState } from 'react';

export default function useUser(props) {

  let self = this;

  const projectId = props.projectId || props.config.projectId;
  const userId = props.userId || props.config.userId;
  const { data, error, isLoading } = self.useSWR({ projectId }, 'user.fetch'); // todo: je kunt swr hier dus verbergen; wil je dat?
  
  async function setUser(newdata) {
    // api.user.update({ projectId, userId, data: newdata });
  }


  return [ data || {}, setUser, error, isLoading ];

}

