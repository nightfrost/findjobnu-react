import React from "react";

interface Props {
  // Optional specific widths to use for each chip skeleton (Tailwind width classes)
  widths?: string[];
  className?: string;
  "aria-label"?: string;
}

// Reusable skeleton row for chip/button-like placeholders
const SkeletonChips: React.FC<Props> = ({
  widths = ["w-28", "w-32", "w-24", "w-28", "w-20", "w-36"],
  className = "",
  "aria-label": ariaLabel = "Indlæser...",
}) => {
  return (
    <div className={`w-full ${className}`} aria-busy="true" aria-live="polite">
      <div className="flex flex-wrap gap-2">
        {widths.map((w, i) => (
          <div key={`${w}-${i}`} className={`skeleton h-8 ${w} rounded`} />
        ))}
      </div>
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
};

export default SkeletonChips;
