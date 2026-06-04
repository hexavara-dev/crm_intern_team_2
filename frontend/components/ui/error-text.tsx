import { cn } from "@/lib/utils";

interface ErrorTextProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function ErrorText({ className, children, ...props }: ErrorTextProps) {
  if (!children) return null;

  return (
    <p
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  );
}
