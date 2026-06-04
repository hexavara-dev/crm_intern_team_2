import * as React from "react";

import { cn } from "@/lib/utils";

export type TypographyVariant =
  | "v96"
  | "v60"
  | "v48"
  | "v42"
  | "v36"
  | "v32"
  | "v28"
  | "v24"
  | "v20"
  | "v18"
  | "v16"
  | "v14"
  | "v12";

type FontVariant = "inter";

type FontColor = "white" | "black" | "green" | "gray";

type FontWeight = "regular" | "medium" | "bold" | "heavy";

type TypographyProps<T extends React.ElementType> = {
  as?: T;
  color?: FontColor;
  className?: string;
  weight?: FontWeight;
  font?: FontVariant;
  variant?: TypographyVariant;
  children: React.ReactNode;
} & React.ComponentProps<T>;

export default function Typography<T extends React.ElementType>({
  as,
  children,
  weight = "regular",
  className,
  color = "black",
  font = "inter",
  variant = "v16",
  ...props
}: TypographyProps<T> &
  Omit<React.ComponentProps<T>, keyof TypographyProps<T>>) {
  const Component = as || "p";
  return (
    <Component
      className={cn(
        [
          color === "white" && "text-white",
          color === "black" && "text-black",
          color === "green" && "text-main-green",
          color === "gray" && "text-main-gray",
        ],
        [
          font === "inter" && [
            "font-family-inter",
            [
              weight === "regular" && "font-normal",
              weight === "medium" && "font-medium",
              weight === "bold" && "font-bold",
              weight === "heavy" && "font-heavy",
            ],
          ],
        ],
        // *=============== Font Variants ==================
        [
          variant === "v96" && [
            "text-[64px] leading-18 md:text-[96px] md:leading-26",
          ],
          variant === "v60" && [
            "text-[40px] leading-12 md:text-[60px] md:leading-17",
          ],
          variant === "v48" && [
            "text-[32px] leading-10 md:text-[48px] md:leading-14",
          ],
          variant === "v42" && [
            "text-[28px] leading-9 md:text-[42px] md:leading-12.5",
          ],
          variant === "v36" && [
            "text-[24px] leading-8 md:text-[36px] md:leading-11",
          ],
          variant === "v32" && [
            "text-[22px] leading-7.5 md:text-[32px] md:leading-10",
          ],
          variant === "v28" && [
            "text-[20px] leading-7 md:text-[28px] md:leading-9",
          ],
          variant === "v24" && [
            "text-[18px] leading-6.5 md:text-[24px] md:leading-8",
          ],
          variant === "v20" && [
            "text-[16px] leading-6 md:text-[20px] md:leading-7",
          ],
          variant === "v18" && [
            "text-[15px] leading-5.5 md:text-[18px] md:leading-6.5",
          ],
          variant === "v16" && [
            "text-[14px] leading-5 md:text-[16px] md:leading-6",
          ],
          variant === "v14" && [
            "text-[13px] leading-4.5 md:text-[14px] md:leading-5.5",
          ],
          variant === "v12" && [
            "text-[11px] leading-4 md:text-[12px] md:leading-5",
          ],
        ],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
