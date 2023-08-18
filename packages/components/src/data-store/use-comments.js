import { useState } from 'react';

export default function useIdea(props) {

  let self = this;

  const projectId = props.projectId || props.config.projectId;
  const ideaId = props.ideaId || props.config.ideaId;
  const sentiment = props.sentiment || props.config.sentiment || null;
  const { data, error, isLoading } = self.useSWR({ projectId, ideaId, sentiment }, 'comments.fetch'); // todo: je kunt swr hier dus verbergen; wil je dat?
  
  async function setComments(newData) {

    console.log('UPDATE COMMENTS', newData);

    if (Array.isArray(newData)) {

      let newElements = []
      let removedElements = []
      data.map( elem => {
        console.log(elem);
        if ( ! newData.find( nd => nd.id == elem.id ) ) {
          removedElements.push( elem );
          console.log('++ DELETE ELEM', elem);
          self.mutate({ projectId, ideaId, sentiment }, 'comments.delete', { id: elem.id });
        }
      })

      newData.map( elem => {
        if ( ! data.find( od => od.id == elem.id ) ) {
          newElements.push( elem );
          console.log('++ NEW ELEM', elem);
        }
      })

    } else {

      console.log(newData);
      newData = Object.fromEntries(newData.entries());
      if (newData.id) {
        console.log('++ UPDATE');
        self.mutate({ projectId, ideaId, sentiment }, 'comments.update', newData);
      } else {
        console.log('++ CREATE');
        // todo: maak een api.create
        self.mutate({ projectId, ideaId, sentiment }, 'comments.update', newData);
      }
      
    }
    

    
  }
  
  return [ data || [], setComments, error, isLoading ];

}

