import React from "react";

interface Props {
  count?: number;
}

const JobListSkeleton: React.FC<Props> = ({ count = 5 }) => {
  const items = Array.from({ length: Math.max(1, count) });
  return (
    <div className="grid gap-3">
      {items.map((_, i) => (
        <div key={`job-skel-${count}-${i}`} className="card bg-base-100 shadow rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="skeleton h-6 w-1/2 max-w-80" />
            <div className="skeleton h-4 w-28 ml-auto" />
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <div className="skeleton h-4 w-32" />
            <span className="opacity-0">·</span>
            <div className="skeleton h-4 w-24" />
          </div>
          <div className="w-full max-w-3xl mx-auto my-3 rounded overflow-hidden">
            <div className="skeleton h-40 w-full" />
          </div>
          <div className="space-y-2">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-11/12" />
            <div className="skeleton h-4 w-10/12" />
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="skeleton h-8 w-24 rounded" />
            <div className="skeleton h-8 w-28 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobListSkeleton;
