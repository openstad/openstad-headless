module.exports = {
  extend: 'base-widget',
  options: {
    label: 'Gerelateerde berichten'
  },
  fields: {
    add: {
      title: {
        type: 'string',
        label: 'Titel',
        def: 'Nieuws'
      },
      selectionType: {
        type: 'select',
        label: 'Selectie methode',
        def: 'automatic',
        choices: [
          {
            label: 'Automatisch - nieuwste berichten',
            value: 'automatic'
          },
          {
            label: 'Handmatig - selecteer specifieke berichten',
            value: 'manual'
          }
        ]
      },
      count: {
        type: 'integer',
        label: 'Aantal berichten om te tonen',
        def: 3,
        min: 1,
      },
      highlightedPost: {
        type: 'relationship',
        label: 'Uitgelicht bericht (optioneel)',
        withType: '@apostrophecms/blog',
        max: 1,
        help: 'Selecteer één bericht dat altijd als eerste wordt getoond.'
      },
      selectedPosts: {
        type: 'relationship',
        label: 'Selecteer specifieke berichten',
        withType: '@apostrophecms/blog',
        help: 'Selecteer berichten uit de lijst. Het aantal getoonde berichten wordt bepaald door het "Aantal berichten" veld hierboven.',
        if: {
          selectionType: 'manual'
        }
      },
      enableCarousel: {
        type: 'boolean',
        label: 'Carrousel modus inschakelen',
        def: false,
        help: 'Schakel dit in om de berichten als een schuifbare carrousel te tonen.'
      },
      carouselItemsVisible: {
        type: 'integer',
        label: 'Aantal zichtbare items in carrousel',
        def: 3,
        min: 1,
        max: 10,
        help: 'Bepaal hoeveel berichten tegelijk zichtbaar zijn in de carrousel (1-10).',
        if: {
          enableCarousel: true
        }
      }
    }
  },
  methods: function (self) {
    return {
      async load(req, widgets) {
        const blogModule = self.apos.modules['@apostrophecms/blog'];
        
        if (!blogModule) {
          return;
        }

        for (const widget of widgets) {
          try {
            const maxItems = widget.count || 3;
            let posts = [];
            
            // Add highlighted post first if it exists
            if (widget.highlightedPost && widget.highlightedPost.length > 0) {
              posts.push(widget.highlightedPost[0]);
            }
            
            // Calculate how many additional posts we need
            const remainingSlots = maxItems - posts.length;
            
            if (remainingSlots > 0) {
              let additionalPosts = [];
              
              if (widget.selectionType === 'manual' && widget.selectedPosts && widget.selectedPosts.length > 0) {
                // Manual selection: use selected posts, but exclude highlighted post if it's already included
                additionalPosts = widget.selectedPosts.filter(post => {
                  const highlightedId = widget.highlightedPost && widget.highlightedPost.length > 0 ? widget.highlightedPost[0]._id : null;
                  return post._id !== highlightedId;
                });
              } else {
                // Automatic selection: get newest posts, but exclude highlighted post if it exists
                const criteria = {};
                if (widget.tag) {
                  criteria.tags = widget.tag;
                }
                
                // Exclude highlighted post from automatic selection
                if (widget.highlightedPost && widget.highlightedPost.length > 0) {
                  criteria._id = { $ne: widget.highlightedPost[0]._id };
                }

                additionalPosts = await blogModule.find(req, criteria)
                  .sort({ createdAt: -1 })
                  .limit(remainingSlots)
                  .toArray();
              }
              
              // Add the additional posts
              posts = posts.concat(additionalPosts.slice(0, remainingSlots));
            }
            
            // Ensure createdAt is a valid ISO string for each post
            widget.relatedPosts = posts.map(post => {
              if (post.createdAt) {
                const dateObj = new Date(post.createdAt);
                post.createdAt = isNaN(dateObj.getTime()) ? null : dateObj.toISOString();
              }
              return post;
            });
          } catch (error) {
            console.error('Error loading related posts:', error);
            widget.relatedPosts = [];
          }
        }
      }
    };
  }
};
