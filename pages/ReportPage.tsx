
import React, { useState, useEffect, useRef } from 'react';
import { MapExplorer } from './MapExplorer.tsx';
import { ReportForm } from '../components/ReportForm.tsx';
import { useStore } from '../store/useStore.ts';
import { useNavigate } from 'react-router-dom';
import { AddressDetails } from '../types.ts';
import { ChevronRight, MapPin, ShieldCheck, LocateFixed } from 'lucide-react';

const DEFAULT_COORDS = { lat: 28.6315, lng: 77.2167 };

export const ReportPage: React.FC = () => {
  const { addIssue, currentUser } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Mode state: false = Full Map, true = Split View / Mobile Overlay
  const [isConfirmed, setIsConfirmed] = useState(false);
  const hasAttemptedInitialLocate = useRef(false);
  
  // Shared state between map and form
  const [markerPosition, setMarkerPosition] = useState<{lat: number, lng: number} | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | undefined>(undefined);
  const [userAccuracy, setUserAccuracy] = useState<number | undefined>(undefined);
  const [detectedAddress, setDetectedAddress] = useState<AddressDetails | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasAttemptedInitialLocate.current) return;
    hasAttemptedInitialLocate.current = true;

    if (!('geolocation' in navigator)) return;

    let cancelled = false;

    const updateLocation = async (lat: number, lng: number) => {
      setUserLocation({ lat, lng });
      setUserAccuracy(undefined);
      setMarkerPosition({ lat, lng });
      setIsGeocoding(true);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          { headers: { 'Accept-Language': 'en-US,en;q=0.5' } }
        );
        const data = await response.json();

        if (!cancelled && data?.address) {
          const addr = data.address;
          setDetectedAddress({
            area: addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.quarter || 'Local Area',
            city: addr.city || addr.town || addr.village || 'Local City',
            district: addr.city_district || addr.district || addr.county || 'Local District',
            state: addr.state || 'Local State',
            pincode: addr.postcode || 'Local Pincode',
            fullAddress: data.display_name
          });
        }
      } catch (error) {
        if (!cancelled) {
          setDetectedAddress(null);
        }
      } finally {
        if (!cancelled) {
          setIsGeocoding(false);
        }
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!cancelled) {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setUserAccuracy(pos.coords.accuracy);
          updateLocation(pos.coords.latitude, pos.coords.longitude);
        }
      },
      () => {
        if (!cancelled) {
          setMarkerPosition(DEFAULT_COORDS);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFormSubmit = async (data: any) => {
    if (loading) return;
    const finalLocation = markerPosition || userLocation || DEFAULT_COORDS;

    setLoading(true);
    try {
      // 1. Prepare FormData for multipart upload
      const formData = new FormData();
      formData.append('issueType', data.category);
      formData.append('description', data.description || '');
      formData.append('latitude', finalLocation.lat.toString());
      formData.append('longitude', finalLocation.lng.toString());
      formData.append('address', data.manualAddress || detectedAddress?.fullAddress || 'Detected Location');
      
      // 2. Convert base64 photo to Blob
      if (data.photo) {
        const fetchResponse = await fetch(data.photo);
        const blob = await fetchResponse.blob();
        formData.append('image', blob, `report_${Date.now()}.jpg`);
      }

      // 3. Send to Backend
      const token = localStorage.getItem('jansamadhan_token');
      
      if (!token) {
        alert("Your session has expired. Please log out and log in again to submit a report.");
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` 
        },
        body: formData,
      });

      const result = await res.json();
      
      if (result.status === 'success') {
        // 4. Update local store for UI feedback
        addIssue({
          category: data.category,
          description: data.description || 'No description provided.',
          aiAnalysis: data.aiDescription,
          location: {
            lat: finalLocation.lat,
            lng: finalLocation.lng,
            address: data.manualAddress || detectedAddress?.fullAddress || 'Detected Location',
            details: detectedAddress || undefined
          },
          // Fallback to local base64 photo if backend image upload failed/is empty
          photoUrl: result.data.report.imageUrl || data.photo, 
          reportedBy: data.reporterName || currentUser?.name || 'Anonymous Citizen',
          priority: data.suggestedPriority || data.priority || 'Medium'
        });
        navigate('/dashboard');
      } else {
        alert("Failed to submit report. Please try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Error connecting to server. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressManualUpdate = (lat: number, lng: number, newAddress: AddressDetails) => {
    setMarkerPosition({ lat, lng });
    setDetectedAddress(newAddress);
  };

  const handleConfirmLocation = () => {
    if (!currentUser) {
      alert("Please login or sign in first to report an issue.");
      navigate('/login');
      return;
    }
    setIsConfirmed(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-56px)] overflow-hidden bg-white relative">
      {/* MAP SECTION: On mobile, it stays in the background or is covered */}
      <div 
        className={`relative transition-all duration-700 ease-in-out z-10 border-r border-slate-100 overflow-hidden ${
          isConfirmed ? 'w-full md:w-1/2 h-[40vh] md:h-full' : 'w-full h-full'
        }`}
      >
        <MapExplorer 
          isSplitView={isConfirmed}
          markerPosition={markerPosition || undefined}
          setMarkerPosition={setMarkerPosition}
          setDetectedAddress={setDetectedAddress}
          setIsGeocoding={setIsGeocoding}
          initialUserLocation={userLocation}
          initialUserAccuracy={userAccuracy}
        />
        
        {!isConfirmed && (
          <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-[2000] flex items-center space-x-3 animate-in slide-in-from-bottom-8 duration-700 w-full px-4 justify-center pointer-events-none">
            <button 
              onClick={handleConfirmLocation}
              disabled={isGeocoding}
              className="group pointer-events-auto flex items-center space-x-2.5 sm:space-x-3 px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-900 text-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 max-w-[90vw] sm:max-w-none border border-white/10"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg group-hover:bg-white group-hover:text-blue-600 transition-colors shrink-0">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Step: Location</p>
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-tight truncate">Confirm Location</p>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all ml-1 shrink-0" />
            </button>
          </div>
        )}

        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-slate-200 m-4 sm:m-6 pointer-events-none rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-slate-200 m-4 sm:m-6 pointer-events-none rounded-bl-lg"></div>
      </div>

      <div 
        className={`transition-all duration-500 ease-in-out bg-white ${
          isConfirmed 
            ? 'fixed inset-0 z-[150] w-full h-full md:relative md:inset-auto md:z-auto md:w-1/2 md:h-full opacity-100 translate-y-0 md:translate-y-0 md:translate-x-0' 
            : 'fixed inset-0 z-[150] w-full h-full md:relative md:inset-auto md:z-auto md:w-0 md:h-full opacity-0 translate-y-full md:translate-y-0 md:translate-x-full invisible pointer-events-none'
        } overflow-hidden`}
      >
        {isConfirmed && (
          <ReportForm 
            onSubmit={handleFormSubmit}
            onAddressManualSync={handleAddressManualUpdate}
            onCancel={() => setIsConfirmed(false)}
            initialCoords={markerPosition}
            address={detectedAddress}
            isGeocoding={isGeocoding}
          />
        )}
      </div>
    </div>
  );
};
