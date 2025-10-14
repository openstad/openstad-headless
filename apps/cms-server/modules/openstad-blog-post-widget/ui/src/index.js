// Import the widget CSS
import '../../views/widget.scss';

export default () => {
  apos.util.widgetPlayers['openstad-blog-post'] = {
    selector: '.related-posts.carousel-enabled',
    player: function (el) {
      initCarousel(el);
    }
  };
};

function initCarousel(container) {
  const track = container.querySelector('[data-carousel-track]');
  const prevBtn = container.querySelector('[data-carousel-prev]');
  const nextBtn = container.querySelector('[data-carousel-next]');
  
  if (!track || !prevBtn || !nextBtn) return;
  
  const items = Array.from(track.children);
  let currentIndex = 0;
  let itemsPerView = getItemsPerView();
  let maxIndex = Math.max(0, items.length - itemsPerView);

  
  // Event listeners
  prevBtn.addEventListener('click', () => navigate(-1));
  nextBtn.addEventListener('click', () => navigate(1));
  
  // Touch/swipe support
  let startX = 0;
  let isDragging = false;
  
  track.addEventListener('touchstart', handleTouchStart, { passive: true });
  track.addEventListener('touchmove', handleTouchMove, { passive: false });
  track.addEventListener('touchend', handleTouchEnd);
  
  function navigate(direction) {
    // Update current itemsPerView and maxIndex
    itemsPerView = getItemsPerView();
    maxIndex = Math.max(0, items.length - itemsPerView);
    
    currentIndex = Math.max(0, Math.min(maxIndex, currentIndex + direction));
    updateCarousel();
  }
  
  function updateCarousel() {
    itemsPerView = getItemsPerView();
    maxIndex = Math.max(0, items.length - itemsPerView);
    
    if (itemsPerView === 1) {
      // For single item view, move by full width (100%) per slide
      const translateX = -(currentIndex * 100);
      track.style.transform = `translateX(${translateX}%)`;
    } else {
      // For multiple items: move by the width of one item per slide
      const itemWidthPercent = 100 / itemsPerView;
      const translateX = -(currentIndex * itemWidthPercent);
      track.style.transform = `translateX(${translateX}%)`;
    }
    
    // Update buttons
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === maxIndex;
    
  }
  
  
  function getItemsPerView() {
    // Get configured items visible from data attribute
    const configuredItems = parseInt(track.getAttribute('data-items-visible') || '3', 10);
    
    // On mobile, always show 1 item regardless of configuration
    const containerWidth = container.offsetWidth;
    if (containerWidth < 768) return 1;
    
    // On tablet, respect config but max 2 items
    if (containerWidth < 1024) return Math.min(configuredItems, 2);
    
    // On desktop, use the configured value (max 10 for safety)
    return Math.min(configuredItems, 10);
  }

  function updateItemWidths() {
    const itemsPerView = getItemsPerView();
    // Calculate the gap: (n-1) gaps distributed across n items
    const gapPerItem = itemsPerView > 1 ? ((itemsPerView - 1) * 0) / itemsPerView : 0;
    const itemWidth = `calc(${100 / itemsPerView}% - ${gapPerItem}px)`;
    
    // Apply the calculated width to all carousel items
    items.forEach(item => {
      // Skip responsive overrides by checking screen size
      const containerWidth = container.offsetWidth;
      if (containerWidth >= 768) { // Only apply on tablet and up
        item.style.flex = `0 0 ${itemWidth}`;
      }
    });
  }
  
  function handleTouchStart(e) {
    startX = e.touches[0].clientX;
    isDragging = true;
  }
  
  function handleTouchMove(e) {
    if (!isDragging) return;
    e.preventDefault();
  }
  
  function handleTouchEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    
    if (Math.abs(diffX) > 50) {
      navigate(diffX > 0 ? 1 : -1);
    }
  }
  
  // Initialize
  updateItemWidths();
  updateCarousel();
  
  // Handle resize
  window.addEventListener('resize', () => {
    updateItemWidths();
    const newItemsPerView = getItemsPerView();
    const newMaxIndex = Math.max(0, items.length - newItemsPerView);
    
    // Recalculate if needed
    if (currentIndex > newMaxIndex) {
      currentIndex = newMaxIndex;
    }
    
    updateCarousel();
  });
}
