import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  PlusCircle,
  Loader2,
  Search
} from 'lucide-react';
import { useStore } from '../store/useStore.ts';
import { languages, translations } from '../services/i18n.ts';

const IssueMap = lazy(() => import('../components/IssueMap.tsx').then(module => ({ default: module.IssueMap })));

export const Home: React.FC = () => {
  const { issues, currentLanguage, setLanguage, currentUser } = useStore();
  const copy = translations[currentLanguage];
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [filteredIssues, setFilteredIssues] = useState(issues);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredIssues(issues);
      setMapCenter([20.5937, 78.9629]);
      setMapZoom(5);
    }
  }, [issues, searchQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const query = searchQuery.toLowerCase();

    const localMatch = issues.filter(issue => {
      if (!issue) return false;
      const catMatch = issue.category?.toLowerCase().includes(query);
      const addrMatch = issue.location?.address?.toLowerCase().includes(query);
      const areaMatch = issue.location?.details?.area?.toLowerCase().includes(query);
      const cityMatch = issue.location?.details?.city?.toLowerCase().includes(query);
      const stateMatch = issue.location?.details?.state?.toLowerCase().includes(query);
      return catMatch || addrMatch || areaMatch || cityMatch || stateMatch;
    });

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=1`);
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat) + (Math.random() - 0.5) * 0.0003;
        const lon = parseFloat(data[0].lon) + (Math.random() - 0.5) * 0.0003;
        setMapCenter([lat, lon]);

        const type = data[0].type;
        if (type === 'state') setMapZoom(6);
        else if (type === 'city') setMapZoom(11);
        else setMapZoom(13);

        setFilteredIssues(issues);
      } else if (localMatch.length > 0) {
        let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
        localMatch.forEach(issue => {
          if (issue.location.lat < minLat) minLat = issue.location.lat;
          if (issue.location.lat > maxLat) maxLat = issue.location.lat;
          if (issue.location.lng < minLng) minLng = issue.location.lng;
          if (issue.location.lng > maxLng) maxLng = issue.location.lng;
        });
        const centerLat = (minLat + maxLat) / 2 + (Math.random() - 0.5) * 0.0003;
        const centerLng = (minLng + maxLng) / 2 + (Math.random() - 0.5) * 0.0003;
        const maxDiff = Math.max(maxLat - minLat, maxLng - minLng);

        let zoom = 14;
        if (maxDiff > 10) zoom = 5;
        else if (maxDiff > 5) zoom = 6;
        else if (maxDiff > 2) zoom = 7;
        else if (maxDiff > 1) zoom = 8;
        else if (maxDiff > 0.5) zoom = 9;
        else if (maxDiff > 0.1) zoom = 11;
        else if (maxDiff > 0.05) zoom = 12;

        setMapCenter([centerLat, centerLng]);
        setMapZoom(zoom);
        setFilteredIssues(localMatch);
      } else {
        setFilteredIssues([]);
      }
    } catch (error) {
      setFilteredIssues(localMatch);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col bg-slate-50 overflow-hidden no-scrollbar">
      <section className="relative pt-8 pb-8 sm:pt-10 sm:pb-10 lg:pt-16 lg:pb-16 bg-white border-b border-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">

          <div className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-[0.15em] border border-blue-100 mb-4 sm:mb-6">
            <Zap className="w-3 h-3 mr-2 text-blue-600 animate-pulse" />
            JanSamadhan 2025
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-4 sm:mb-6">
            {copy.welcome}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto font-medium mb-6 sm:mb-8">
            {copy.hero_sub}
          </p>

          <div className="max-w-2xl mx-auto relative">
            <form
              onSubmit={handleSearch}
              className="relative flex items-center w-full h-11 sm:h-12 rounded-xl focus-within:shadow-lg focus-within:border-blue-300 bg-white overflow-hidden border border-slate-200 transition-all"
            >
              <div className="grid place-items-center h-full w-11 sm:w-12 text-slate-400">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <input
                className="peer h-full w-full outline-none text-sm text-slate-700 pr-4 bg-transparent placeholder-slate-400 font-medium"
                type="text"
                placeholder={copy.search_placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                disabled={isSearching}
                className="h-8 sm:h-9 px-4 sm:px-5 mr-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-semibold rounded-lg transition-colors text-xs shadow-md active:scale-95 flex items-center justify-center min-w-[70px] sm:min-w-[80px]"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : (copy.search_button || 'Search')}
              </button>
            </form>
          </div>

          {currentUser?.role !== 'STAFF' && (
            <Link
              to="/report"
              className="inline-flex items-center h-10 sm:h-11 bg-slate-950 text-white font-bold rounded-lg hover:bg-blue-600 transition-all shadow-lg px-6 sm:px-8 group uppercase tracking-[0.15em] text-[10px] mt-8 sm:mt-10"
            >
              <PlusCircle className="w-4 h-4 mr-2 sm:mr-3" />
              <span className="mt-0.5">{copy.report_issue}</span>
              <ArrowRight className="w-4 h-4 ml-3 sm:ml-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </section>

      <section className="py-6 sm:py-8 lg:py-10 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative h-[350px] sm:h-[420px] lg:h-[500px] w-full bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200 shadow-xl">
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div>}>
              <IssueMap issues={filteredIssues} zoom={mapZoom} center={mapCenter} />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
};