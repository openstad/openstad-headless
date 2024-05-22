export default function useResource(props) {

  let self = this;

  const projectId = props.projectId;
  const resourceId = props.imageResourceId;
  const { data, error, isLoading } = self.useSWR({ projectId, resourceId }, 'imageResource.fetch');

  // add functionality
  let imageResource = data || {};
  imageResource.update = function(newData) {
    self.mutate({ projectId, resourceId }, 'imageResource.update', newData, { action: 'update' });
  }
  imageResource.delete = function() {
    self.mutate({ projectId, resourceId }, 'imageResource.delete', imageResource, { action: 'delete' });
  }
  imageResource.submitLike = function(vote) {
    self.mutate({ projectId, resourceId }, 'imageResource.submitLike', vote, { action: 'submitLike', revalidate: true, populateCache: false });
  }

  return { data:imageResource, error, isLoading };

}

