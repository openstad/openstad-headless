import { useState } from 'react';

export default function useIdea(props) {

  let self = this;

  const projectId = props.projectId || props.config.projectId;
  const ideaId = props.ideaId || props.config.ideaId;
  // todo: dit moet door allees heen filteren: je hebt dit in deze instantie al eens opgegeven en dus zou het altijd goed moeten staan
  const sentiment = props.sentiment || props.config.sentiment || null;
  const { data, error, isLoading } = self.useSWR({ projectId, ideaId, sentiment }, 'comments.fetch');
  
  async function setComments(newData) {

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

      if (newData.id) {
        console.log('++ UPDATE');
        self.mutate({ projectId, ideaId, sentiment }, 'comments.update', newData);
      } else {
        console.log('++ CREATE');
        self.mutate({ projectId, ideaId, sentiment }, 'comments.create', newData);
      }
      
    }
    
  }

  // add functionality
  let comments = data || [];
  comments.map( async comment => comment.submitLike = function() {
    // self.api.comments.submitLike({ projectId, ideaId }, comment)
    self.mutate({ projectId, ideaId, sentiment }, 'comments.submitLike', comment);

  })
  
  return [ comments, setComments, error, isLoading ];

}

