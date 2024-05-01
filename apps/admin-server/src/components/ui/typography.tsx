import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { VariantProps, cva } from 'class-variance-authority';
import React, {CSSProperties, ReactNode} from 'react';

export function Paragraph({
  children,
  className,
  style
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return <p className={cn('text-sm leading-7', className)} style={style}>{children}</p>;
}

export function ListHeading({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-xs font-medium text-muted-foreground', className)}>
      {children}
    </p>
  );
}

const headingVariants = cva('font-futura font-bold tracking-tight', {
  variants: {
    size: {
      '2xl': 'text-3xl',
      xl: 'text-xl',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    size: '2xl',
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  asChild?: boolean;
  size: "lg" | "2xl" | "xl" | null | undefined;
}

const Heading = React.forwardRef<HTMLButtonElement, HeadingProps>(
  ({ className, size, asChild = false, ...props }, ref) => {
    let heading = 'h1';
    switch (size) {
      case 'xl':
        heading = 'h2';
        break;
      case 'lg':
        heading = 'h3';
        break;
    }
    const Comp = asChild ? Slot : heading;
    return (
      <Comp
        className={cn(headingVariants({ size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Heading.displayName = 'Heading';

export { Heading, headingVariants };
