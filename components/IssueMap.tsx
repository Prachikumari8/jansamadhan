
import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import Supercluster from 'supercluster';
import { Plus, Minus, Maximize, Minimize, LocateFixed, Loader2, ImageIcon } from 'lucide-react';
import { Issue, IssueCategory, IssueStatus } from '../types.ts';
import { getPinSvgString } from './CustomPin.tsx';
import { useStore } from '../store/useStore';
import { getTranslation } from '../services/i18n';

interface IssueMapProps {
  issues: Issue[];
  onSelectIssue?: (issue: Issue) => void;
  onMapClick?: (latlng: { lat: number, lng: number }) => void;
  onMarkerDrag?: (latlng: { lat: number, lng: number }) => void;
  onUserInteraction?: () => void;
  onUserLocationFound?: (location: { lat: number, lng: number, accuracy?: number }) => void;
  center?: [number, number];
  zoom?: number;
  showHeatmap?: boolean;
  reportingMode?: boolean;
  markerPosition?: { lat: number, lng: number };
  userLocation?: { lat: number, lng: number };
  userAccuracy?: number;
  isLocating?: boolean;
  autoLocateOnMount?: boolean;
}

const INDIA_BOUNDS: L.LatLngBoundsExpression = [[6.0, 68.0], [36.0, 98.0]];

const MemoizedMarker = memo(({ 
  issue, 
  onSelect, 
  icon,
  showPopup = true
}: { 
  issue: Issue, 
  onSelect?: (i: Issue) => void, 
  icon: L.DivIcon,
  showPopup?: boolean
}) => {
  const { currentLanguage } = useStore();
  return (
    <Marker 
      position={[issue.location.lat, issue.location.lng]} 
      icon={icon}
      eventHandlers={{ 
        click: () => onSelect?.(issue)
      }}
    >
      {showPopup && issue.photoUrl && (
        <Popup className="mini-circular-popup" offset={[0, -10]} keepInView={false}>
          <img 
            src={issue.photoUrl} 
            alt={issue.category} 
            loading="lazy"
            decoding="async"
          />
        </Popup>
      )}
      <Tooltip direction="top" offset={[0, -15]} opacity={1} permanent={false}>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-900">
            {getTranslation(currentLanguage, `category_${issue.category.toLowerCase().replace(' ', '_')}`)}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full ${issue.priority === 'High' ? 'bg-rose-500' : issue.priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
        </div>
      </Tooltip>
    </Marker>
  );
});

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const AutoLocateOnMount = ({ enabled }: { enabled: boolean }) => {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const handleError = () => {
      if (cancelled) return;
      map.locate({ setView: true, maxZoom: 17 });
    };

    map.locate({ setView: true, maxZoom: 17, enableHighAccuracy: true });
    map.on('locationerror', handleError);

    return () => {
      cancelled = true;
      map.off('locationerror', handleError);
    };
  }, [enabled, map]);

  return null;
};

const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  const prevCenterRef = useRef<[number, number]>(center);
  const prevZoomRef = useRef<number>(zoom);

  useEffect(() => {
    const latDiff = Math.abs(center[0] - prevCenterRef.current[0]);
    const lngDiff = Math.abs(center[1] - prevCenterRef.current[1]);
    const centerChanged = latDiff > 0.0001 || lngDiff > 0.0001;
    const zoomChanged = zoom !== prevZoomRef.current;

    if (centerChanged || zoomChanged) {
      const currentMapCenter = map.getCenter();
      const distFromCurrent = Math.abs(currentMapCenter.lat - center[0]) + Math.abs(currentMapCenter.lng - center[1]);
      
      if (distFromCurrent > 0.0001 || zoomChanged) {
        map.flyTo(center, zoom, { 
          duration: 1.2,
          easeLinearity: 0.25,
          noMoveStart: true 
        });
      }
      
      prevCenterRef.current = center;
      prevZoomRef.current = zoom;
    }
  }, [center, zoom, map]);

  return null;
};

const MapControls = ({ 
  isFullscreen, 
  onToggleFullscreen, 
  onLocationFound 
}: { 
  isFullscreen: boolean, 
  onToggleFullscreen: () => void,
  onLocationFound?: (loc: { lat: number, lng: number, accuracy: number }) => void
}) => {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = () => {
    if (isLocating) return;
    setIsLocating(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng, accuracy } = pos.coords;
          map.flyTo([lat, lng], 17, { duration: 1.5 });
          onLocationFound?.({ lat, lng, accuracy });
          setIsLocating(false);
        },
        (err) => {
          map.locate({ setView: true, maxZoom: 17, enableHighAccuracy: true });
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      map.locate({ setView: true, maxZoom: 17 });
      setIsLocating(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[1000] flex flex-col space-y-3 pointer-events-auto">
      <div className="flex flex-col bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <button 
          onClick={() => map.zoomIn()}
          className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-slate-600 hover:text-violet-600 hover:bg-slate-50 transition-all active:scale-95 border-b border-slate-100"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button 
          onClick={() => map.zoomOut()}
          className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-slate-600 hover:text-violet-600 hover:bg-slate-50 transition-all active:scale-95"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>

      <button 
        onClick={handleLocate}
        disabled={isLocating}
        title="Relocate to current position"
        className="w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-slate-700 hover:text-violet-600 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
      >
        {isLocating ? (
          <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
        ) : (
          <LocateFixed className="w-5 h-5" />
        )}
      </button>

      <button 
        onClick={onToggleFullscreen}
        className="w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-slate-600 hover:text-violet-600 hover:bg-slate-50 transition-all active:scale-95"
      >
        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
      </button>
    </div>
  );
};

const getUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div class="w-10 h-10 relative flex items-center justify-center">
        <div class="absolute inset-0 bg-violet-500/20 rounded-full animate-sonar"></div>
        <div class="absolute inset-0 bg-violet-400/10 rounded-full animate-sonar-delay"></div>
        <div class="w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-md relative z-10 border-2 border-violet-500">
          <div class="w-1.5 h-1.5 bg-violet-600 rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

const getPointerIcon = (isLocating: boolean) => {
  const color = isLocating ? '#94a3b8' : '#7c3aed';
  const pinSvg = getPinSvgString(color);
  return L.divIcon({
    className: 'reporting-pointer',
    html: `
      <div class="w-10 h-12 relative flex flex-col items-center animate-in zoom-in duration-500 overflow-visible">
        ${!isLocating ? `<div class="absolute -top-1 w-6 h-6 bg-violet-600/10 rounded-full animate-ping"></div>` : ''}
        <div class="filter drop-shadow-lg scale-110">
          ${pinSvg}
        </div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48]
  });
};

const MapEvents = ({ onMapClick, onUserInteraction, onBoundsChange, onLocationFound }: any) => {
  useMapEvents({
    click: (e) => {
      onMapClick?.(e.latlng);
    },
    movestart: (e) => {
      if ((e as any).originalEvent) onUserInteraction?.();
    },
    moveend: () => onBoundsChange?.(),
    zoomend: () => onBoundsChange?.(),
    locationfound: (e) => {
      onLocationFound?.({ lat: e.latlng.lat, lng: e.latlng.lng, accuracy: e.accuracy });
    }
  });
  return null;
};

const getClusterIcon = (count: number, hasOpenIssues: boolean, isMobile: boolean) => {
  const baseSize = isMobile ? 44 : 40;
  const size = count < 10 ? baseSize : count < 50 ? baseSize + 8 : baseSize + 16;
  const bgColor = hasOpenIssues ? 'bg-violet-600' : 'bg-emerald-600';

  return L.divIcon({
    className: 'custom-cluster-icon',
    html: `
      <div class="relative flex items-center justify-center w-full h-full group">
        <div class="absolute inset-0 ${bgColor} opacity-20 rounded-full animate-pulse"></div>
        <div class="absolute inset-0 ${bgColor} opacity-10 rounded-full scale-125"></div>
        <div class="${bgColor} text-white rounded-full flex items-center justify-center font-black text-[14px] shadow-2xl border-4 border-white transition-transform active:scale-90" style="width: ${size}px; height: ${size}px;">
          ${count}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const getIndividualMarkerIcon = (issue: Issue, currentZoom: number) => {
  const isResolved = issue.status === IssueStatus.RESOLVED;
  const hasPhoto = !!issue.photoUrl;
  
  const categoryColors: Record<string, string> = {
    [IssueCategory.POTHOLE]: 'bg-violet-600',
    [IssueCategory.STREETLIGHT]: 'bg-amber-500',
    [IssueCategory.DRAINAGE]: 'bg-sky-500',
    [IssueCategory.GARBAGE]: 'bg-emerald-600',
    [IssueCategory.WATER_SUPPLY]: 'bg-violet-400',
    [IssueCategory.ELECTRICITY]: 'bg-yellow-400',
    [IssueCategory.ROAD_DAMAGE]: 'bg-rose-600',
    [IssueCategory.OTHER]: 'bg-slate-600',
  };

  const statusColor = isResolved ? 'bg-slate-400' : (categoryColors[issue.category] || 'bg-violet-600');
  
  // Transition to circular images at high zoom levels
  // Using inline styles instead of Tailwind dynamic classes to ensure they render
  if (currentZoom >= 14 && hasPhoto) {
    const photoSize = currentZoom >= 16 ? 64 : 48;
    return L.divIcon({
      className: 'rich-photo-marker',
      html: `
        <div class="relative flex flex-col items-center group animate-in zoom-in duration-300">
          <div class="rounded-full border-[3px] border-white shadow-2xl overflow-hidden ring-4 ring-violet-500/20 group-hover:scale-110 transition-transform" style="width: ${photoSize}px; height: ${photoSize}px;">
             <img src="${issue.photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div class="w-3 h-3 bg-white rotate-45 -mt-1.5 shadow-lg border-r border-b border-white"></div>
        </div>
      `,
      iconSize: [photoSize, photoSize + 6],
      iconAnchor: [photoSize / 2, photoSize + 6]
    });
  }

  // Scaling dot logic
  const baseZoom = 4;
  const maxZoom = 14;
  const minSize = 8;
  const maxSize = 24;
  
  const progress = Math.min(1, Math.max(0, (currentZoom - baseZoom) / (maxZoom - baseZoom)));
  const calculatedSize = minSize + (maxSize - minSize) * progress;
                        
  const pulseClass = !isResolved ? 'pulse-open' : '';

  return L.divIcon({
    className: 'scaling-dot-marker',
    html: `
      <div class="relative flex flex-col items-center group">
        <div class="${statusColor} rounded-full border-[2px] border-white shadow-xl ${pulseClass} transition-all duration-500" style="width: ${calculatedSize}px; height: ${calculatedSize}px;"></div>
      </div>
    `,
    iconSize: [calculatedSize, calculatedSize],
    iconAnchor: [calculatedSize / 2, calculatedSize / 2]
  });
};

export const IssueMap: React.FC<IssueMapProps> = ({ 
  issues, onSelectIssue, onMapClick, onMarkerDrag, onUserInteraction, onUserLocationFound,
  center = [20.5937, 78.9629] as [number, number], zoom = 5,
  reportingMode = false, markerPosition, userLocation, userAccuracy, isLocating = false,
  autoLocateOnMount = false
}) => {
  const [mapZoom, setMapZoom] = useState(zoom);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker>(null);

  const initialCenter = useRef(center);
  const initialZoom = useRef(zoom);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const validIssues = useMemo(
    () =>
      issues.filter(
        (issue) =>
          Number.isFinite(issue?.location?.lat) &&
          Number.isFinite(issue?.location?.lng)
      ),
    [issues]
  );

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const index = useMemo(() => {
    const sc = new Supercluster({ radius: isMobile ? 80 : 60, maxZoom: 13 });
    const points = validIssues.map(issue => ({
      type: 'Feature' as const,
      properties: { 
        cluster: false, 
        issueId: issue.id, 
        priority: issue.priority,
        status: issue.status,
        category: issue.category,
        issue: issue
      },
      geometry: { type: 'Point' as const, coordinates: [issue.location.lng, issue.location.lat] }
    }));
    sc.load(points);
    return sc;
  }, [validIssues, isMobile]);

  const clusters = useMemo(() => {
    if (!mapBounds) return [];
    const bbox: [number, number, number, number] = [
      mapBounds.getWest(), mapBounds.getSouth(), mapBounds.getEast(), mapBounds.getNorth()
    ];
    return index.getClusters(bbox, mapZoom);
  }, [index, mapBounds, mapZoom]);

  const handleBoundsChange = () => {
    if (mapRef.current) {
      setMapZoom(mapRef.current.getZoom());
      setMapBounds(mapRef.current.getBounds());
    }
  };

  const handleClusterClick = (id: number, lat: number, lng: number) => {
    if (mapRef.current) {
      const expansionZoom = Math.min(index.getClusterExpansionZoom(id), 18);
      mapRef.current.flyTo([lat, lng], expansionZoom, { duration: 0.8 });
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-100">
      <div className={`absolute inset-0 z-[10] pointer-events-none transition-opacity duration-700 ${reportingMode ? 'opacity-100 shadow-[inset_0_0_100px_rgba(124,58,237,0.05)]' : 'opacity-0'}`}></div>
      
      <div className="absolute top-[80px] sm:top-auto sm:bottom-6 left-4 sm:left-6 z-[1000] p-2.5 sm:p-4 bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-200 shadow-xl pointer-events-none flex flex-col space-y-1 sm:space-y-2 max-w-[120px] sm:max-w-none">
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-violet-600 animate-pulse"></div>
          <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Active Reports</span>
        </div>
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-500"></div>
          <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Resolved Cases</span>
        </div>
      </div>

      <MapContainer 
        center={initialCenter.current} 
        zoom={initialZoom.current} 
        minZoom={4} 
        maxBounds={INDIA_BOUNDS} 
        scrollWheelZoom={true} 
        zoomControl={false}
        className="h-full w-full"
        whenReady={handleBoundsChange}
        ref={(map) => { mapRef.current = map; if (map && !mapBounds) handleBoundsChange(); }}
      >
        <AutoLocateOnMount enabled={autoLocateOnMount} />
        <MapController center={center as [number, number]} zoom={zoom} />
        <MapResizer />
        <MapControls 
          isFullscreen={isFullscreen} 
          onToggleFullscreen={toggleFullscreen} 
          onLocationFound={onUserLocationFound} 
        />
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng] as [number, number]} icon={getUserLocationIcon()} zIndexOffset={3000} />
            {userAccuracy && (
              <Circle 
                center={[userLocation.lat, userLocation.lng] as [number, number]} radius={userAccuracy}
                pathOptions={{ fillColor: '#7c3aed', fillOpacity: 0.05, color: '#7c3aed', weight: 1, dashArray: '4, 8' }}
              />
            )}
          </>
        )}

        {(clusters.length > 0 ? clusters : validIssues.map((issue) => ({
          id: issue.id,
          properties: {
            cluster: false,
            issueId: issue.id,
            issue
          },
          geometry: {
            coordinates: [issue.location.lng, issue.location.lat]
          }
        } as any))).map((cluster) => {
          const [lng, lat] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount, issueId, issue } = cluster.properties;
          
          if (isCluster) {
            return (
              <Marker 
                key={`cluster-${cluster.id}`} 
                position={[lat, lng]} 
                icon={getClusterIcon(pointCount, true, isMobile)}
                eventHandlers={{ click: () => handleClusterClick(cluster.id as number, lat, lng) }}
              />
            );
          }
          
          return (
            <MemoizedMarker 
              key={`issue-${issueId}`} 
              issue={issue}
              onSelect={onSelectIssue}
              icon={getIndividualMarkerIcon(issue, mapZoom)}
              showPopup={mapZoom < 14}
            />
          );
        })}

        {reportingMode && markerPosition && (
          <Marker
            draggable={true}
            eventHandlers={{
              dragend: () => { if (markerRef.current) onMarkerDrag?.(markerRef.current.getLatLng()); },
              dragstart: () => onUserInteraction?.()
            }}
            position={[markerPosition.lat, markerPosition.lng] as [number, number]}
            ref={markerRef}
            icon={getPointerIcon(isLocating)}
            zIndexOffset={4000}
          />
        )}

        <MapEvents 
          onMapClick={onMapClick} 
          onUserInteraction={onUserInteraction} 
          onBoundsChange={handleBoundsChange}
          onLocationFound={onUserLocationFound}
        />
      </MapContainer>
    </div>
  );
};
