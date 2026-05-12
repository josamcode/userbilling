import { forwardRef } from "react";

export const Input = forwardRef(function Input(
  { type = "text", className = "", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={`field-base ${className}`}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea(
  { className = "", rows = 3, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`field-base resize-none ${className}`}
      {...props}
    />
  );
});
