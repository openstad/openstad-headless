import merge from 'merge';
import { useState, useEffect, useCallback } from 'react';
import DataStore from '../data-store';
import hasRole from '../lib/user-has-role';

// TODO: op verzoek van Daan; gaan we dat gebruiken?
// TODO: dit moet, sort of, passen op NLDS
import { cva } from "class-variance-authority";
const commentVariants = cva(
  "osc-ideasFilter-component osc-ideasFilter inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
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

const IdeasFilter = function(props) {

  props = merge.recursive({}, {
    title: 'Ideas filter',
    search: true,
    tagTypes: [ 'theme', 'area' ],
    onUpdateFilter: filter => console.log(filter),
  }, props.config,  props);

  const datastore = new DataStore(props);

  let defaultFilter = { tags: {}, search: { text: '' } };
  props.tagTypes.forEach(tagType => {
    defaultFilter.tags[tagType] = null;
  });

  const [filter, setFilter] = useState(defaultFilter);
  function updateFilter(newFilter) {
    setFilter(newFilter);
    props.onUpdateFilter(newFilter);
  }

  function setTag(type, value) {
    let newFilter = {
      ...filter,
      tags: {
        ...filter.tags,
        [type]: filter.tags[type] == value ? null : value,
      }
    };
    updateFilter(newFilter);
  }

  function setSearch(value) {
    let newFilter = {
      ...filter,
      search: {
        text: value,
      }
    };
    updateFilter(newFilter);
  }

  let tagsByType = [];
  for (let tagType of props.tagTypes) {
    const [ tags, tagsError, tagsIsLoading ] = datastore.useTags({ ...props, type: tagType });
    tagsByType[tagType] = { tags, tagsError, tagsIsLoading };
  }

  let errorHTML = null;
  let error = null; // todo: samenvoegen uit lijst
  if (error) {
    console.log(error);
    errorHTML = <div className="osc-error-block">{error.message}</div>
  }

  let tagsHTML = [];
  for (let tagType of props.tagTypes) {
    let tagHTML = null;
    if (tagsByType[tagType].tags.length) {
      tagHTML = (
        <div key={`osc-tag-${ tagType }`}>
          <h4>{tagType.charAt(0).toUpperCase() + tagType.slice(1)}</h4>
          { tagsByType[tagType].tags.map( ( tag, index ) => {
            return (
              <div onClick={ (e) => setTag(tagType, tag.id) } key={`osc-tag-${ tagType }-${ index }`}>
                <input type="radio" checked={ filter.tags[tagType] == tag.id } readOnly/>
                {tag.name}
              </div>
            );
          })
          }
        </div>
      );
    } else{
      if (tagsByType[tagType].tagsIsLoading) { // TODO: i18n
        tagHTML = <div className="osc-empty-list-text" key={`osc-tag-${ tagType }-loading`}>Loading...</div>
      }
    }
    if (tagHTML) {
      tagsHTML.push(tagHTML);
    }
  }

  let searchHTML = [];
  if (props.search) {
    searchHTML =
      <div>
        <input type="text" onChange={ e => setSearch(e.target.value) } value={filter.search.text}/>
      </div>
  }
  
  return (
    <div id={props.config.divId} className={commentVariants({ variant: props.variant, size: props.size, className: props.className })}>
      {errorHTML}
      {searchHTML}
      {tagsHTML}
    </div>
  );

}

export default IdeasFilter;
