import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse" />
      </div>
      <p className="text-slate-400 text-sm font-black uppercase tracking-widest animate-pulse">
        Processing Data...
      </p>
    </div>
  );
};

export default Loader;
