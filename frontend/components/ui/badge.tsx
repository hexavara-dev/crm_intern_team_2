import { type VariantProps, cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeProps = {
  colorHex?: string;
  textColor?: string;
} & React.ComponentPropsWithoutRef<typeof Slot.Root> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean };

const LIGHT_TEXT = "#F9FAFB";
const DARK_TEXT = "#111827";

function hexToRgb(hex: string) {
  const normalizedHex = hex.replace("#", "").trim();

  if (![3, 6].includes(normalizedHex.length)) {
    return null;
  }

  const fullHex =
    normalizedHex.length === 3
      ? normalizedHex
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalizedHex;

  const int = Number.parseInt(fullHex, 16);
  if (Number.isNaN(int)) {
    return null;
  }

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function getRelativeLuminance(r: number, g: number, b: number) {
  const srgb = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function getContrastRatio(l1: number, l2: number) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getReadableTextColor(backgroundHex: string) {
  const rgb = hexToRgb(backgroundHex);
  if (!rgb) {
    return DARK_TEXT;
  }

  const bgLuminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
  const lightLuminance = getRelativeLuminance(249, 250, 251);
  const darkLuminance = getRelativeLuminance(17, 24, 39);

  const lightContrast = getContrastRatio(bgLuminance, lightLuminance);
  const darkContrast = getContrastRatio(bgLuminance, darkLuminance);

  return lightContrast >= darkContrast ? LIGHT_TEXT : DARK_TEXT;
}

function Badge({
  className,
  variant = "default",
  asChild = false,
  textColor,
  colorHex,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span";
  const resolvedTextColor = colorHex
    ? (textColor ?? getReadableTextColor(colorHex))
    : textColor;

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      style={{ backgroundColor: colorHex, color: resolvedTextColor }}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
