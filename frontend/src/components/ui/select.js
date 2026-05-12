import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export const Select = forwardRef(function Select(
  { children, className = "", ...props },
  ref
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        {...props}
        className={`field-base appearance-none pl-10 pr-3 cursor-pointer ${className}`}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
  );
});
