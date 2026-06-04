import { cn } from "@/lib/utils";

interface HelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function HelperText({ className, children, ...props }: HelperTextProps) {
  if (!children) return null;

  return (
    <p
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}
