import merge from 'merge';
import { useState, useEffect, useCallback } from 'react';
import DataStore from '../data-store';
import ResourcesFilter from '../resources-filter';

// TODO: op verzoek van Daan; gaan we dat gebruiken?
// TODO: dit moet, sort of, passen op NLDS
import { cva } from "class-variance-authority";
const commentVariants = cva(
  "osc-resourcesOverview-component osc-resourcesOverview inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        icon: "w-10 hover:bg-foreground/10",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-12 py-4 px-4",
        sm: "h-10 px-2",
        lg: "h-14 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const ResourcesOverview = function(props) {

  props = merge.recursive({}, {
    title: 'Resources overview',
    onResourceClick: onResourceClick,
  }, props.config,  props);

  const datastore = new DataStore(props);

  const [ currentUser, currentUserError, currentUserIsLoading ] = datastore.useCurrentUser({ ...props });
  const [ tags, tagsError, tagsIsLoading ] = datastore.useTags({ ...props });
  const [ resources, resourcesError, resourcesIsLoading ] = datastore.useResources({ ...props });

  function onResourceClick(e, resource) {
    console.log('ONRESOURCECLICK', resource.id);
  }

  let titleHTML = props.title ? <h3>{ props.title }</h3> : null;

  // TODO: errors moeten nog
  let errorHTML = null;
  // let error = submitError || resourcesOverviewError;
  // if (error) {
  //   console.log(error);
  //   errorHTML = <div className="osc-error-block">{error.message}</div>
  // }

  let resourcesHTML = null;
  if (resources.length) {
    resourcesHTML = (
      <>
        { resources.map( ( resource, index ) => {
          return (
            <div onClick={e => props.onResourceClick(e, resource)} key={`osc-resource-${ index }`}>
              {resource.title} ({ resource.tags && resource.tags.map( ( tag, jndex ) => tag.name).join(', ') })
            </div>
          );
        })
        }
      </>
    );
  } else{
    if (resourcesIsLoading) { // TODO: i18n
      resourcesHTML = <div className="osc-empty-list-text">Loading...</div>
    } else {
      resourcesHTML = <div className="osc-empty-list-text">{props.emptyListText}</div>
    }
  }
  
  return (
    <div id={props.config.divId} className={commentVariants({ variant: props.variant, size: props.size, className: props.className })}>
      {titleHTML}
      {errorHTML}
      <ResourcesFilter { ...props } onUpdateFilter={resources.filter}/>
      <h4>Resources</h4>
      {resourcesHTML}
    </div>
  );

}

export default ResourcesOverview;
