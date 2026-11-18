import * as TabsPrimitive from '@radix-ui/react-tabs';
import React from 'react';

// Thin, unstyled wrappers around Radix's tabs primitives: consumers (e.g.
// resource-overview.css) style these via the role/data-state attributes
// Radix sets on the rendered elements, so no default classes are applied here.

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>((props, ref) => <TabsPrimitive.List ref={ref} {...props} />);
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>((props, ref) => <TabsPrimitive.Trigger ref={ref} {...props} />);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>((props, ref) => <TabsPrimitive.Content ref={ref} {...props} />);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
