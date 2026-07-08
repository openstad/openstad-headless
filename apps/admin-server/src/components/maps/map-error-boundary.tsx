import React from 'react';

export class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    if (error.message?.includes('Map container is already initialized')) {
      return { hasError: false };
    }
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (!error.message?.includes('Map container is already initialized')) {
      console.error(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return <div>Kaart kon niet geladen worden.</div>;
    }
    return this.props.children;
  }
}
