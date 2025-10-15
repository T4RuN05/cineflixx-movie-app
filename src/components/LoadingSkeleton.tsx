import React from 'react';

const SkeletonBlock = ({ width = 'w-full', height = 'h-4' }: { width?: string, height?: string }) => (
  <div className={`${height} ${width} bg-secondary/30 rounded-md`}></div>
);

const CardSkeleton = () => (
  <div className="w-full rounded-xl overflow-hidden shadow-lg bg-card animate-pulse border border-secondary/10">
    <div className="aspect-[2/3] relative bg-secondary/20 rounded-t-xl"></div>
    <div className="p-3 space-y-2">
      <SkeletonBlock width="w-11/12" height="h-5" /> 
      <div className="flex justify-between items-center pt-1">
        <SkeletonBlock width="w-1/4" height="h-3" /> 
        <SkeletonBlock width="w-8" height="h-3" /> 
      </div>
    </div>
  </div>
);

export const MovieGridSkeleton = ({ count = 12 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
};

export const DetailPageSkeleton = () => (
  <div className="container py-8 animate-pulse">
    <div className="flex flex-col md:flex-row gap-8 bg-card p-6 rounded-xl shadow-2xl border border-secondary/10">
      <div className="md:w-1/3 w-full aspect-[2/3] rounded-lg bg-secondary/20"></div>
      <div className="md:w-2/3 space-y-6">
        <SkeletonBlock width="w-3/4" height="h-10" /> 
        <div className="flex space-x-4">
            <SkeletonBlock width="w-1/6" height="h-5" /> 
            <SkeletonBlock width="w-1/6" height="h-5" /> 
        </div>
        <SkeletonBlock width="w-1/4" height="h-6" /> 
        <div className="space-y-3">
          <SkeletonBlock width="w-full" height="h-4" />
          <SkeletonBlock width="w-full" height="h-4" />
          <SkeletonBlock width="w-11/12" height="h-4" />
          <SkeletonBlock width="w-3/4" height="h-4" />
        </div>
        <div className="pt-4">
          <SkeletonBlock width="w-1/3" height="h-12" />
        </div>
      </div>
    </div>
  </div>
);