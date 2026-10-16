import React from 'react';

const ProfileCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs animate-pulse flex flex-col justify-between overflow-hidden">
      <div className="h-1.5 w-full bg-slate-200" />

      <div className="p-4 sm:p-5 flex-grow space-y-3.5">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between">
          <div className="h-5 bg-slate-200 rounded-full w-28" />
          <div className="h-5 bg-slate-100 rounded-lg w-20" />
        </div>

        {/* Identity Row */}
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-200 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded-md w-3/4" />
            <div className="h-3 bg-slate-100 rounded-md w-1/2" />
          </div>
        </div>

        {/* Highlights Row */}
        <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-slate-100/70 border border-slate-200/60 h-14" />

        {/* Subjects Row */}
        <div className="space-y-1.5">
          <div className="h-2.5 bg-slate-200 rounded w-24" />
          <div className="flex space-x-1.5">
            <div className="h-6 bg-slate-100 rounded-lg w-16" />
            <div className="h-6 bg-slate-100 rounded-lg w-20" />
            <div className="h-6 bg-slate-100 rounded-lg w-16" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-slate-200 rounded w-16" />
          <div className="h-4 bg-slate-200 rounded w-24" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 bg-slate-200 rounded-xl flex-1" />
          <div className="h-9 bg-slate-200 rounded-xl w-16" />
        </div>
      </div>
    </div>
  );
};

export default ProfileCardSkeleton;
