import React from 'react';

const ProfileCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs animate-pulse flex flex-col justify-between overflow-hidden">
      <div className="h-1.5 w-full bg-slate-200" />

      <div className="p-4 sm:p-5 flex-grow">
        <div className="flex items-start space-x-3 mb-3">
          <div className="w-12 h-12 bg-slate-200 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 bg-slate-200 rounded-md w-3/4" />
            <div className="h-3 bg-slate-100 rounded-md w-1/2" />
          </div>
        </div>

        <div className="h-5 bg-slate-100 rounded-md w-2/5 mb-3" />

        <div className="space-y-1.5 mb-3">
          <div className="h-2.5 bg-slate-200 rounded w-16" />
          <div className="flex space-x-1.5">
            <div className="h-5 bg-slate-100 rounded-md w-16" />
            <div className="h-5 bg-slate-100 rounded-md w-20" />
            <div className="h-5 bg-slate-100 rounded-md w-14" />
          </div>
        </div>

        <div className="space-y-2 mt-2">
          <div className="h-3 bg-slate-100 rounded-md w-full" />
          <div className="h-3 bg-slate-100 rounded-md w-5/6" />
        </div>
      </div>

      <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-slate-200 rounded w-12" />
          <div className="h-4 bg-slate-200 rounded w-20" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 bg-slate-200 rounded-lg flex-1" />
          <div className="h-7 bg-slate-200 rounded-lg flex-1" />
        </div>
      </div>
    </div>
  );
};

export default ProfileCardSkeleton;
