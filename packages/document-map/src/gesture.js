/**
 * This code is based on the Leaflet Gesture Handling plugin.
 * Source: https://github.com/zacwang89/Leaflet.GestureHandling
 */

L.LRMapInteraction = L.Class.extend({
  options: {
    isTouch: false,
    messageString: '', // Message displayed in overlay messages
    blockInteractiveElementsClass: 'lr-map-disable-elements', // CSS class for blocking interactive elements
    overlayMessageClass: 'lr-map-interaction-overlay lr-map-visually-hidden', // CSS class for overlay message
  },

  /**
   * Initializes the plugin.
   * @param {L.Map} map - The Leaflet map instance.
   * @param {Object} options - Options for customization.
   */
  initialize: function (map, options) {
    L.setOptions(this, options);
    this._map = map;
    this._mapContainerEl = this._map.getContainer();
    this._overlayMessage = this._createOverlayMessage();
    this._hideOverlayMessageTimeout = null;
    this._listenersAdded = false;
    this._interactiveElementsBlocked = false;
    this._isTouch = this.options.isTouch;

    this.options.messageString =
      this.options.messageString || 'Use two fingers to move and zoom the map.';

    if (this._isTouch) {
      this._map.dragging.disable();
      this._handleTouchEvents();
    }
  },

  /**
   * Creates an overlay message element and appends it to the map container.
   * @returns {HTMLElement} The created overlay message element.
   */
  _createOverlayMessage: function () {
    const messageElement = document.createElement('div');
    messageElement.className = this.options.overlayMessageClass;
    this._mapContainerEl.appendChild(messageElement);
    return messageElement;
  },

  showOverlayMessage: function () {
    this._clearOverlayMessageTimeout();

    // Prevent flickering: Only update and show if the message is not already visible.
    if (!this._isMessageVisible) {
      this._overlayMessage.innerHTML = this.options.messageString;
      this._overlayMessage.classList.remove('lr-map-visually-hidden');
      this._isMessageVisible = true;
    }

    this.hideOverlayMessage();
  },

  /**
   * Hides the overlay message with an optional delay.
   * @param {boolean} fast - If true, hides the message immediately.
   */
  hideOverlayMessage: function (fast) {
    this._clearOverlayMessageTimeout();

    if (fast) {
      this._hideOverlayMessage();
    } else {
      this._hideOverlayMessageTimeout = setTimeout(
        this._hideOverlayMessage.bind(this),
        1000
      );
    }
  },

  /**
   * Handles the fade-out effect and hides the overlay message.
   */
  _hideOverlayMessage: function (fast) {
    if (this._isMessageVisible) {
      if (fast) {
        // Fast case: Immediately hide the message without delay.
        this._clearOverlayMessageTimeout();
        this._overlayMessage.classList.add('lr-map-visually-hidden');
        this._isMessageVisible = false; // Reset visibility flag.
      } else {
        // Normal case: Use timeout for fade-out effect.
        this._hideOverlayMessageTimeout = setTimeout(() => {
          this._clearOverlayMessageTimeout();
          this._overlayMessage.classList.add('lr-map-visually-hidden');
          this._isMessageVisible = false; // Reset visibility flag.
        }, 500);
      }
    }
  },

  /**
   * Clears the timeout for hiding the overlay message.
   */
  _clearOverlayMessageTimeout: function () {
    if (this._hideOverlayMessageTimeout) {
      clearTimeout(this._hideOverlayMessageTimeout);
      this._hideOverlayMessageTimeout = null;
    }
  },

  /**
   * Blocks or unblocks pointer events on the map container.
   * @param {boolean} block - If true, blocks pointer events; otherwise, unblocks them.
   */
  _blockInteractiveElements: function (block) {
    this._mapContainerEl.classList.toggle(
      this.options.blockInteractiveElementsClass,
      block
    );
    this._interactiveElementsBlocked = block;
  },

  /**
   * Handles touch events for zooming, dragging, and interaction.
   */
  _handleTouchEvents: function () {
    if (this._listenersAdded) return;
    this._listenersAdded = true;

    let activeTouchType = null;
    let startX = 0,
      startY = 0;
    const touchThreshold = 10;

    // Define handlers as properties for removal in destroy
    this._handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        activeTouchType = 'single';
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        this._map.dragging.disable();
      } else if (e.touches.length === 2) {
        activeTouchType = 'multi';
        e.preventDefault();
        this._map.dragging.enable();
        this.hideOverlayMessage(true);
      }
    };

    this._handleTouchMove = (e) => {
      if (e.touches.length === 1 && activeTouchType === 'single') {
        const deltaX = Math.abs(e.touches[0].clientX - startX);
        const deltaY = Math.abs(e.touches[0].clientY - startY);
        if (deltaX > touchThreshold || deltaY > touchThreshold) {
          this.showOverlayMessage();
          this._map.dragging.disable();
        }
      } else if (e.touches.length === 2) {
        e.preventDefault();
        this._map.dragging.enable();
        this.hideOverlayMessage(true);
      }
    };

    this._handleTouchEnd = (e) => {
      const currentPopup = this._map._popup;
      let isTouchInsidePopup = false;

      if (currentPopup) {
        const popupElement = currentPopup.getElement();
        if (popupElement) {
          const popupRect = popupElement.getBoundingClientRect();
          const touchX = e.changedTouches[0].clientX;
          const touchY = e.changedTouches[0].clientY;

          isTouchInsidePopup =
            touchX >= popupRect.left &&
            touchX <= popupRect.right &&
            touchY >= popupRect.top &&
            touchY <= popupRect.bottom;
        }
      }

      if (
        !isTouchInsidePopup &&
        activeTouchType === 'single' &&
        e.target === this._mapContainerEl
      ) {
        const deltaX = Math.abs(e.changedTouches[0].clientX - startX);
        const deltaY = Math.abs(e.changedTouches[0].clientY - startY);

        if (deltaX <= touchThreshold && deltaY <= touchThreshold) {
          this._map.eachLayer((layer) => {
            if (
              layer instanceof L.Marker &&
              layer.getPopup &&
              layer.getPopup().isOpen()
            ) {
              layer.closePopup();
            }
          });
        }
      }

      this._map.dragging.disable();
      activeTouchType = null;
      this.hideOverlayMessage();
    };

    // Attach event listeners
    this._mapContainerEl.addEventListener('touchstart', this._handleTouchStart);
    this._mapContainerEl.addEventListener('touchmove', this._handleTouchMove, {
      passive: false,
    });
    this._mapContainerEl.addEventListener('touchend', this._handleTouchEnd);
  },

  destroy: function () {
    // Remove touch event listeners
    if (this._isTouch) {
      if (this._mapContainerEl) {
        this._mapContainerEl.removeEventListener(
          'touchstart',
          this._handleTouchStart
        );
        this._mapContainerEl.removeEventListener(
          'touchmove',
          this._handleTouchMove
        );
        this._mapContainerEl.removeEventListener(
          'touchend',
          this._handleTouchEnd
        );
      }
    }

    // Remove overlay message
    if (this._overlayMessage) {
      this._mapContainerEl.removeChild(this._overlayMessage);
    }

    // Clear timeouts
    this._clearOverlayMessageTimeout();
  },
});

L.mapInteraction = function (map, options) {
  return new L.LRMapInteraction(map, options);
};
