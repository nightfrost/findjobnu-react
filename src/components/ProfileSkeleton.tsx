import React from "react";

// Skeleton placeholders for the Profile view while data loads
const ProfileSkeleton: React.FC = () => {
  return (
    <div className="w-full h-fit">
      {/* Card 1: Basisoplysninger */}
      <div className="card bg-base-100 shadow rounded-lg p-6 mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="skeleton h-6 w-40" />
          <div className="skeleton h-6 w-6 rounded" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="skeleton h-4 w-24 mb-2" />
            <div className="skeleton h-10 w-full" />
          </div>
          <div>
            <div className="skeleton h-4 w-24 mb-2" />
            <div className="skeleton h-10 w-full" />
          </div>
          <div>
            <div className="skeleton h-4 w-20 mb-2" />
            <div className="skeleton h-10 w-full" />
          </div>
          <div>
            <div className="skeleton h-4 w-20 mb-2" />
            <div className="skeleton h-10 w-full" />
          </div>
          <div>
            <div className="skeleton h-4 w-28 mb-2" />
            <div className="skeleton h-10 w-full" />
          </div>
          <div>
            <div className="skeleton h-4 w-28 mb-2" />
            <div className="skeleton h-10 w-full" />
          </div>
        </div>
      </div>

      {/* Card 2: Om mig & Nøgleord */}
      <div className="card bg-base-100 shadow rounded-lg p-6 mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="skeleton h-6 w-48" />
          <div className="skeleton h-6 w-6 rounded" />
        </div>
        <div className="grid gap-4">
          <div>
            <div className="skeleton h-4 w-20 mb-2" />
            <div className="skeleton h-24 w-full" />
          </div>
          <div>
            <div className="skeleton h-4 w-24 mb-2" />
            <div className="skeleton h-10 w-full" />
          </div>
        </div>
      </div>

      {/* Card 3a: Erfaringer */}
      <div className="card bg-base-100 shadow rounded-lg p-6 mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="skeleton h-6 w-28" />
          <div className="skeleton h-6 w-6 rounded" />
        </div>
        <div className="flex w-full flex-col gap-3">
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-20 w-full" />
        </div>
      </div>

      {/* Card 3b: Uddannelser */}
      <div className="card bg-base-100 shadow rounded-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="skeleton h-6 w-32" />
          <div className="skeleton h-6 w-6 rounded" />
        </div>
        <div className="flex w-full flex-col gap-3">
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-16 w-full" />
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
