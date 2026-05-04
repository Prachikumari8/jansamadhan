
import React, { useState, useMemo, useCallback, useRef, Suspense, lazy, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore.ts';
import { 
  Check, 
  Loader2, 
  LocateFixed, 
  Navigation2, 
  MousePointer2,
  AlertCircle,
  Map as MapIcon,
  ChevronLeft,
  ShieldAlert,
  MapPin,
  Satellite,
  Lock,
  RefreshCw,
  Info,
  Zap,
  Layers,
  Crosshair,
  Search,
  X,
  MapPinned
} from 'lucide-react';
import { IssueCategory, AddressDetails, Issue } from '../types.ts';
import { CustomPin } from '../components/CustomPin.tsx';

const IssueMap = lazy(() => import('../components/IssueMap.tsx').then(module => ({ default: module.IssueMap })));

const DEFAULT_COORDS: {lat: number, lng: number} = { lat: 28.6315, lng: 77.2167 }; // Connaught Place, Delhi

interface MapExplorerProps {
  isForcedOpen?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
  isSplitView?: boolean;
  markerPosition?: {lat: number, lng: number};
  setMarkerPosition?: (pos: {lat: number, lng: number}) => void;
  setDetectedAddress?: (addr: AddressDetails | null) => void;
  setIsGeocoding?: (loading: boolean) => void;
  initialUserLocation?: {lat: number, lng: number};
  initialUserAccuracy?: number;
}

export const MapExplorer: React.FC<MapExplorerProps> = ({ 
  isForcedOpen, onActivate, onDeactivate, 
  isSplitView = false, markerPosition: externalPos, setMarkerPosition: setExternalPos,
  setDetectedAddress, setIsGeocoding, initialUserLocation, initialUserAccuracy
}) => {
  const { issues } = useStore();
  const hasAttemptedInitialLocate = useRef(false);

  const [internalMarkerPos, setInternalMarkerPos] = useState<{lat: number, lng: number} | undefined>(undefined);
  const activeMarkerPos = externalPos || internalMarkerPos;

  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | undefined>(initialUserLocation);
  const [userAccuracy, setUserAccuracy] = useState<number | undefined>(initialUserAccuracy);
  
  const [mapCenter, setMapCenter] = useState<[number, number]>([DEFAULT_COORDS.lat, DEFAULT_COORDS.lng]);
  const [mapZoom, setMapZoom] = useState(13);
  
  const [locationStatus, setLocationStatus] = useState<'IDLE' | 'DETECTING' | 'SUCCESS' | 'ERROR' | 'DENIED'>('IDLE');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Zoom management
  useEffect(() => {
    if (isSplitView) {
      setMapZoom(14.5); 
    }
  }, [isSplitView]);

  useEffect(() => {
    if (initialUserLocation) {
      setUserCoords(initialUserLocation);
      if (typeof initialUserAccuracy === 'number') {
        setUserAccuracy(initialUserAccuracy);
      }
      setMapCenter([initialUserLocation.lat, initialUserLocation.lng]);
      setMapZoom(16);
    }
  }, [initialUserLocation, initialUserAccuracy]);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const geocodeTimeoutRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (geocodeTimeoutRef.current) window.clearTimeout(geocodeTimeoutRef.current);
    geocodeTimeoutRef.current = window.setTimeout(async () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      setIsGeocoding?.(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          { signal: abortControllerRef.current.signal, headers: { 'Accept-Language': 'en-US,en;q=0.5' } }
        );
        const data = await response.json();
        if (data && data.address) {
          const addr = data.address;
          setDetectedAddress?.({
            area: addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.quarter || 'Local Area',
            city: addr.city || addr.town || addr.village || 'Local City',
            district: addr.city_district || addr.district || addr.county || 'Local District',
            state: addr.state || 'Local State',
            pincode: addr.postcode || 'Local Pincode',
            fullAddress: data.display_name
          });
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          setDetectedAddress?.(null);
        }
      } finally {
        setIsGeocoding?.(false);
      }
    }, 300);
  }, [setDetectedAddress, setIsGeocoding]);

  const handleLocationUpdate = useCallback((loc: { lat: number, lng: number, accuracy?: number }) => {
    const { lat, lng, accuracy } = loc;
    
    setMapCenter([lat, lng]);
    setMapZoom(16);
    setUserCoords({ lat, lng });
    setUserAccuracy(accuracy);
    
    if (setExternalPos) setExternalPos({ lat, lng });
    else setInternalMarkerPos({ lat, lng });

    reverseGeocode(lat, lng);
    setLocationStatus('SUCCESS');
    setTimeout(() => setLocationStatus('IDLE'), 3000);
  }, [reverseGeocode, setExternalPos]);

  useEffect(() => {
    if (!hasAttemptedInitialLocate.current) {
      setLocationStatus('DETECTING');
      navigator.geolocation.getCurrentPosition(
        (pos) => handleLocationUpdate({ 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude, 
          accuracy: pos.coords.accuracy 
        }),
        (err) => {
          console.debug("High-accuracy location failed, falling back to network.", err);
          navigator.geolocation.getCurrentPosition(
            (pos) => handleLocationUpdate({ 
              lat: pos.coords.latitude, 
              lng: pos.coords.longitude, 
              accuracy: pos.coords.accuracy 
            }),
            () => setLocationStatus('ERROR'),
            { enableHighAccuracy: false, timeout: 10000 }
          );
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
      hasAttemptedInitialLocate.current = true;
    }
  }, [handleLocationUpdate]);

  const handleMarkerDrag = useCallback((latlng: { lat: number, lng: number }) => {
    if (setExternalPos) setExternalPos(latlng);
    else setInternalMarkerPos(latlng);
    reverseGeocode(latlng.lat, latlng.lng);
  }, [setExternalPos, reverseGeocode]);

  const handleMapClick = useCallback((latlng: { lat: number, lng: number }) => {
    if (setExternalPos) setExternalPos(latlng);
    else setInternalMarkerPos(latlng);
    reverseGeocode(latlng.lat, latlng.lng);
  }, [setExternalPos, reverseGeocode]);

  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`,
        { headers: { 'Accept-Language': 'en-US,en;q=0.5' } }
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSelect = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setMapCenter([lat, lng]);
    setMapZoom(16);
    
    if (setExternalPos) setExternalPos({ lat, lng });
    else setInternalMarkerPos({ lat, lng });
    
    reverseGeocode(lat, lng);
    setShowResults(false);
    setSearchQuery(result.display_name);
  };

  return (
    <div className="h-full w-full relative flex flex-col overflow-hidden animate-in fade-in duration-500">
      {/* Location Search Bar */}
      {!isSplitView && (
        <div ref={searchRef} className="absolute top-4 left-4 right-16 sm:left-6 sm:right-auto sm:w-[320px] lg:w-[400px] z-[1001] pointer-events-auto">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              )}
            </div>
            <input 
              type="text"
              placeholder="Search area, landmark or street..."
              className="w-full h-12 pl-11 pr-10 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (geocodeTimeoutRef.current) window.clearTimeout(geocodeTimeoutRef.current);
                geocodeTimeoutRef.current = window.setTimeout(() => searchAddress(e.target.value), 400);
              }}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
            />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Suggestions Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-60 overflow-y-auto scrollbar-hide">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearchSelect(result)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-start space-x-3 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <MapPinned className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-slate-900 truncate leading-tight">
                          {result.display_name.split(',')[0]}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 truncate mt-0.5">
                          {result.display_name.split(',').slice(1).join(',').trim()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1">
        <Suspense fallback={
          <div className="h-full w-full bg-slate-50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        }>
          <IssueMap 
            issues={issues} 
            onMarkerDrag={handleMarkerDrag}
            onMapClick={handleMapClick}
            onUserLocationFound={handleLocationUpdate}
            center={mapCenter}
            zoom={mapZoom}
            reportingMode={true}
            markerPosition={activeMarkerPos}
            userLocation={userCoords}
            userAccuracy={userAccuracy}
            isLocating={locationStatus === 'DETECTING'}
            autoLocateOnMount={true}
          />
        </Suspense>
      </div>
      
      {locationStatus === 'DETECTING' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[2000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-xl flex items-center space-x-2 animate-bounce">
          <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Pinpointing your location...</span>
        </div>
      )}
    </div>
  );
};
