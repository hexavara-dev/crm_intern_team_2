import { cn } from "@/lib/utils";
import * as React from "react";

export interface LabelTextProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const LabelText = React.forwardRef<HTMLLabelElement, LabelTextProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className,
        )}
        {...props}
      />
    );
  },
);
LabelText.displayName = "LabelText";
