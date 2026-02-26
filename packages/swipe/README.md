# Tinder-like Swipe Component

A modern, card-based swipe interface similar to Tinder, built with React and Swiper.js.

## Features

- 🎯 **Card-based Interface**: Beautiful cards with images, titles, and descriptions
- 👆 **Touch Gestures**: Native swipe gestures on mobile and desktop
- ⌨️ **Keyboard Support**: Arrow keys and space/enter for navigation
- 🎨 **Modern Design**: Gradient backgrounds, smooth animations, and hover effects
- 📱 **Responsive**: Optimized for both desktop and mobile devices
- 🔄 **Reset Functionality**: Start over when all cards are viewed
- 🎛️ **Customizable**: Custom cards, callbacks, and styling options

## Usage

### Basic Usage

```tsx
import { Swipe } from '@openstad-headless/swipe';

function App() {
  const handleSwipeLeft = (card) => {
    console.log('Passed on:', card.title);
  };

  const handleSwipeRight = (card) => {
    console.log('Liked:', card.title);
  };

  return (
    <Swipe onSwipeLeft={handleSwipeLeft} onSwipeRight={handleSwipeRight} />
  );
}
```

### Custom Cards

```tsx
import { Swipe, SwipeCard } from '@openstad-headless/swipe';

const cards: SwipeCard[] = [
  {
    id: '1',
    title: 'Emma',
    description: 'Love hiking and photography',
    age: 25,
    location: 'Amsterdam',
    image: 'https://example.com/image1.jpg',
  },
  // ... more cards
];

function App() {
  return (
    <Swipe
      cards={cards}
      onSwipeLeft={(card) => console.log('Pass:', card)}
      onSwipeRight={(card) => console.log('Like:', card)}
      showButtons={true}
      enableKeyboard={true}
    />
  );
}
```

## Props

### SwipeProps

| Prop             | Type                        | Default            | Description                               |
| ---------------- | --------------------------- | ------------------ | ----------------------------------------- |
| `cards`          | `SwipeCard[]`               | Default demo cards | Array of cards to display                 |
| `onSwipeLeft`    | `(card: SwipeCard) => void` | `undefined`        | Callback when card is swiped left (pass)  |
| `onSwipeRight`   | `(card: SwipeCard) => void` | `undefined`        | Callback when card is swiped right (like) |
| `showButtons`    | `boolean`                   | `true`             | Show action buttons below cards           |
| `enableKeyboard` | `boolean`                   | `true`             | Enable keyboard navigation                |

### SwipeCard

| Property      | Type     | Required | Description                    |
| ------------- | -------- | -------- | ------------------------------ |
| `id`          | `string` | ✅       | Unique identifier for the card |
| `title`       | `string` | ✅       | Main title/name                |
| `description` | `string` | ✅       | Description text               |
| `image`       | `string` | ❌       | Image URL                      |
| `age`         | `number` | ❌       | Age (displayed next to title)  |
| `location`    | `string` | ❌       | Location text                  |

## Interactions

### Gestures

- **Swipe Left**: Pass/reject the card
- **Swipe Right**: Like/accept the card
- **Click Red Button**: Pass the current card
- **Click Green Button**: Like the current card

### Keyboard

- **Arrow Left**: Pass the current card
- **Arrow Right**: Like the current card
- **Space/Enter**: Like the current card

## Styling

The component includes comprehensive CSS with:

- Card shadows and hover effects
- Smooth animations and transitions
- Gradient backgrounds
- Responsive design for mobile devices
- Custom button styling with hover states

### CSS Classes

- `.swipe-widget`: Main container
- `.swipe-card`: Individual card styling
- `.swipe-actions`: Action buttons container
- `.swipe-btn-pass`: Pass button (red)
- `.swipe-btn-like`: Like button (green)

## Examples

See `example.tsx` for complete usage examples including:

- Default cards usage
- Custom cards with project data
- Swipe-only mode without buttons

## Dependencies

- React 18+
- Swiper.js 11+
- Modern browser with CSS Grid support

---

## Design tokens (Legacy)

<!-- Widget Container  -->

--nlds-likewidget-container-padding
--nlds-likewidget-container-gap
--nlds-likewidget-container-margin
--nlds-likewidget-container-background-color

<!-- Option counter -->

--nlds-likewidget-counter-color
