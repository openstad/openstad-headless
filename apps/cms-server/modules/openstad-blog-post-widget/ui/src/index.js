import '../../views/widget.scss';

export default () => {
  apos.util.widgetPlayers['openstad-blog-post'] = {
    selector: '.related-posts.carousel-enabled',
    player: function (el) {
      initCarousel(el);
    },
  };
};

function initCarousel(container) {
  const track = container.querySelector('[data-carousel-track]');
  const prevBtn = container.querySelector('[data-carousel-prev]');
  const nextBtn = container.querySelector('[data-carousel-next]');
  const dotsContainer = container.querySelector('[data-carousel-dots]');

  if (!track || !prevBtn || !nextBtn) return;

  const items = Array.from(track.children);
  let currentIndex = 0;
  let itemsPerView = getItemsPerView();
  let maxIndex = Math.max(0, items.length - itemsPerView);

  createDots();

  prevBtn.addEventListener('click', () => navigate(-1));
  nextBtn.addEventListener('click', () => navigate(1));

  let startX = 0;
  let isDragging = false;

  track.addEventListener('touchstart', handleTouchStart, { passive: true });
  track.addEventListener('touchmove', handleTouchMove, { passive: false });
  track.addEventListener('touchend', handleTouchEnd);

  function navigate(direction) {
    itemsPerView = getItemsPerView();
    maxIndex = Math.max(0, items.length - itemsPerView);

    currentIndex = Math.max(0, Math.min(maxIndex, currentIndex + direction));
    updateCarousel();
  }

  function updateCarousel() {
    itemsPerView = getItemsPerView();
    maxIndex = Math.max(0, items.length - itemsPerView);

    if (itemsPerView === 1) {
      const translateX = -(currentIndex * 100);
      track.style.transform = `translateX(${translateX}%)`;
    } else {
      const itemWidthPercent = 100 / itemsPerView;
      const translateX = -(currentIndex * itemWidthPercent);
      track.style.transform = `translateX(${translateX}%)`;
    }

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === maxIndex;

    updateDots();
  }

  function getItemsPerView() {
    const configuredItems = parseInt(
      track.getAttribute('data-items-visible') || '3',
      10
    );

    const containerWidth = container.offsetWidth;
    if (containerWidth < 768) return 1;

    if (containerWidth < 1024) return Math.min(configuredItems, 2);

    return Math.min(configuredItems, 10);
  }

  function updateItemWidths() {
    const itemsPerView = getItemsPerView();
    const gapPerItem =
      itemsPerView > 1 ? ((itemsPerView - 1) * 0) / itemsPerView : 0;
    const itemWidth = `calc(${100 / itemsPerView}% - ${gapPerItem}px)`;

    items.forEach((item) => {
      const containerWidth = container.offsetWidth;
      if (containerWidth < 768) {
        item.style.flex = '0 0 100%';
      } else {
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

  function createDots() {
    if (!dotsContainer) return;
    const dotCount = Math.max(1, items.length - getItemsPerView() + 1);
    dotsContainer.innerHTML = '';
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Ga naar slide ${i + 1}`);
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel();
      });
      dotsContainer.appendChild(dot);
    }
    updateDots();
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  updateItemWidths();
  updateCarousel();

  window.addEventListener('resize', () => {
    updateItemWidths();
    const newItemsPerView = getItemsPerView();
    const newMaxIndex = Math.max(0, items.length - newItemsPerView);

    if (currentIndex > newMaxIndex) {
      currentIndex = newMaxIndex;
    }

    createDots();
    updateCarousel();
  });
}
