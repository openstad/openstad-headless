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
        label: 'Aantal berichten om te tonen (0 = alles)',
        def: 3,
        min: 0,
      },
      highlightedPost: {
        type: 'relationship',
        label: 'Uitgelicht bericht (optioneel)',
        withType: '@apostrophecms/blog',
        max: 1,
        help: 'Selecteer één bericht dat altijd als eerste wordt getoond. Het bericht moet gepubliceerd zijn om zichtbaar te zijn voor niet-ingelogde gebruikers.'
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
            const showAll = widget.count === 0;
            const maxItems = showAll ? null : (widget.count || 3);
            let posts = [];
            
            if (widget.highlightedPost && widget.highlightedPost.length > 0) {
              posts.push(widget.highlightedPost[0]);
            }
            
            let additionalPosts = [];
            if (widget.selectionType === 'manual' && widget.selectedPosts && widget.selectedPosts.length > 0) {
              additionalPosts = widget.selectedPosts.filter(post => {
                const highlightedDoc = widget.highlightedPost && widget.highlightedPost.length > 0 ? widget.highlightedPost[0] : null;
                const hasTag = !widget.tag || (post.tags && post.tags.includes(widget.tag));
                return !highlightedDoc || post.slug !== highlightedDoc.slug && hasTag;
              });
            } else {
              const criteria = {};
              if (widget.tag) {
                criteria.tags = widget.tag;
              }

              let query = blogModule.find(req, criteria).sort({ createdAt: -1 });
              if (!showAll && maxItems !== null) {
                const remainingSlots = maxItems - posts.length;
                query = query.limit(remainingSlots);
              }
              additionalPosts = (await query.toArray()).filter(post => {
                const highlightedDoc = widget.highlightedPost && widget.highlightedPost.length > 0 ? widget.highlightedPost[0] : null;
                return !highlightedDoc || post.slug !== highlightedDoc.slug;
              });
            }
            
            posts = posts.concat(showAll ? additionalPosts : additionalPosts.slice(0, maxItems ? maxItems - posts.length : undefined));
            // Remove duplicates
            posts = posts.filter((post, index, arr) => arr.findIndex(p => p._id === post._id) === index);
            
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
