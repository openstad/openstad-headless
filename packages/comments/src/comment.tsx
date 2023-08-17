import React from "react";

import { cva, type VariantProps } from "class-variance-authority";

const commentVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
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

export interface CommentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof commentVariants> {}

export default function Comment({
  className,
  variant,
  size,
  ...props
}: CommentProps) {
  return (
    <div className={commentVariants({ variant, size, className })} {...props}>
      Hello from comment
    </div>
  );
}
