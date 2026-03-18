import { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: string;
}

export default function Input({
  icon,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="relative w-full">
      {icon && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 flex items-center pointer-events-none z-10">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={`w-full py-2.25 pr-3 rounded-lg text-[13px] text-gray-900 outline-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          error ? "border border-red-500" : "border border-gray-200"
        } ${icon ? "pl-7.5" : "pl-3"} ${className}`}
      />
      {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
    </div>
  );
}
