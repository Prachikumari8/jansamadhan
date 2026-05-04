import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Zap, 
  PlusCircle, 
  Loader2
} from 'lucide-react';
import { useStore } from '../store/useStore.ts';

const IssueMap = lazy(() => import('../components/IssueMap.tsx').then(module => ({ default: module.IssueMap })));

export const Home: React.FC = () => {
  const { issues } = useStore();

  return (
    <div className="flex flex-col bg-slate-50 overflow-hidden no-scrollbar">
      <section className="relative pt-12 pb-12 lg:pt-20 lg:pb-20 bg-white border-b border-slate-50">
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-[0.15em] border border-blue-100 mb-6">
            <Zap className="w-3 h-3 mr-2 text-blue-600 animate-pulse" /> 
            JanSamadhan 2025
          </div>
          
          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
            Empowering Citizens to Build Better Cities.
          </h1>
          
          <p className="text-base lg:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto font-medium mb-10">
            Spot an issue in your neighborhood? Report it in 30 seconds.
          </p>

          <Link 
            to="/report" 
            className="inline-flex items-center h-12 bg-slate-950 text-white font-bold rounded-full hover:bg-blue-600 transition-all shadow-lg px-10 group uppercase tracking-[0.15em] text-[10px]"
          >
            <PlusCircle className="w-4 h-4 mr-3" />
            <span className="mt-0.5">Report Issue</span>
            <ArrowRight className="w-4 h-4 ml-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
      
      <section className="py-12 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative h-[500px] w-full bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-2xl">
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div>}>
              <IssueMap issues={issues} zoom={5} center={[20.5937, 78.9629]} />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
};