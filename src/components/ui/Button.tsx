import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  children: ReactNode;
}

const VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-blue-600 text-white border-transparent shadow-[0_4px_12px_rgba(37,99,235,0.35)] hover:bg-blue-700",
  secondary: "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
  danger: "bg-red-500 text-white border-transparent hover:bg-red-600",
  ghost:
    "bg-transparent text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700",
};

const SIZES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-lg font-semibold cursor-pointer inline-flex items-center justify-center gap-2 border transition-all duration-150 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {children}
    </button>
  );
}
