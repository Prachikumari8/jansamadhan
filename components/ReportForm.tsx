import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Loader2, 
  Send, 
  RefreshCcw, 
  User, 
  MapPin, 
  X,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ImageIcon,
  LayoutGrid,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { IssueCategory, AddressDetails } from '../types';
import { CATEGORY_CONFIG } from '../constants';
import { verifyCivicIssue } from '../services/geminiService';
import { useStore } from '../store/useStore';
import { getTranslation } from '../services/i18n';

interface ReportFormProps {
  onSubmit: (data: any) => void;
  onAddressManualSync: (lat: number, lng: number, newAddress: AddressDetails) => void;
  onCancel: () => void;
  initialCoords: { lat: number, lng: number };
  address: AddressDetails | null;
  isGeocoding: boolean;
}

export const ReportForm: React.FC<ReportFormProps> = ({ 
  onSubmit, 
  onCancel, 
  address, 
  isGeocoding,
  onAddressManualSync,
  initialCoords
}) => {

  const { currentUser, currentLanguage } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localAddress, setLocalAddress] = useState<AddressDetails>(address || {});
  
  const [formData, setFormData] = useState({
    category: '' as IssueCategory | '',
    otherCategory: '',
    description: '',
    reporterName: currentUser?.name || '',
    photo: null as string | null,
    priority: 'Medium',
    aiAnalysis: null as any
  });

  const [isVerifyingImage, setIsVerifyingImage] = useState(false);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
    if (address) setLocalAddress(address); 
  }, [address]);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const initCamera = async () => {
      if (isCameraActive) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
          });
          activeStream = mediaStream;
          if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch (err) {
          setError("Camera access denied.");
          setIsCameraActive(false);
        }
      }
    };
    initCamera();
    return () => activeStream?.getTracks().forEach(track => track.stop());
  }, [isCameraActive]);

  const processImage = async (imageBase64: string) => {
    if (!formData.category) {
      setError("Please select a category first.");
      setCurrentStep(1);
      return;
    }

    setIsVerifyingImage(true);
    setError(null);

    try {
      const finalCategory = formData.category === IssueCategory.OTHER ? (formData.otherCategory || 'Other') : formData.category;
      const analysis = await verifyCivicIssue(imageBase64, finalCategory as string);
      
      if (analysis.isCategoryMatch) {
        setFormData(p => ({ 
          ...p, 
          photo: imageBase64, 
          aiAnalysis: analysis 
        }));
        setError(null);
        setCurrentStep(3); // Auto-advance to next step
      } else {
        setFormData(p => ({ ...p, photo: null, aiAnalysis: null }));
        const errorMsg = analysis.confidence === 0 
          ? "AI analysis failed. Please check your connection or try a different image."
          : `AI rejected this image. It doesn't seem to match the "${finalCategory}" category.`;
        setError(errorMsg);
      }
    } catch (err) {
      console.error("AI Verification failed", err);
      // Fallback: allow the photo but mark as manual review
      setFormData(p => ({ ...p, photo: imageBase64, aiAnalysis: null }));
    } finally {
      setIsVerifyingImage(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.85);
        setIsCameraActive(false);
        processImage(photoData);
      }
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Please upload a JPG, JPEG, or PNG image.");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size too large. Max limit is 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        processImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.category) return setError("Please select a category.");
    if (currentStep === 2 && !formData.photo) return setError("Evidence photo is required.");
    setError(null);
    setCurrentStep(p => Math.min(p + 1, 3));
  };

  const handleBack = () => { setError(null); setCurrentStep(p => Math.max(p - 1, 1)); };

  const handleFinalSubmit = async () => {
    if (!formData.category) return setError("Select a category.");
    if (!formData.photo) return setError("A photo is required.");
    
    setSubmitting(true);
    setError(null);
    const finalCategory = formData.category === IssueCategory.OTHER ? (formData.otherCategory || 'Other') : formData.category;

    try {
      // Use cached analysis if available, otherwise verify now
      const analysis = formData.aiAnalysis || await verifyCivicIssue(formData.photo, finalCategory as string);
      
      onSubmit({ 
        ...formData,
        aiDescription: analysis?.aiDescription || "AI verification was inconclusive. The report has been queued for manual review.",
        suggestedPriority: analysis?.suggestedPriority || 'Medium',
        category: finalCategory,
        addressDetails: localAddress,
        manualAddress: localAddress.fullAddress || `${localAddress.area || ''}, ${localAddress.city || ''}`.trim(),
        aiVerificationStatus: analysis?.isValid ? 'verified' : 'manual_review',
        aiConfidence: analysis?.confidence ?? null
      });
    } catch (err) {
      onSubmit({ 
        ...formData, 
        category: finalCategory, 
        addressDetails: localAddress,
        suggestedPriority: 'Medium',
        aiVerificationStatus: 'manual_review'
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans relative overflow-hidden text-slate-900 border-l border-slate-100 shadow-2xl">
      {/* Sleek Header - Updated Background Color */}
      <div className="px-5 py-4 bg-slate-50/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors text-slate-400 hover:text-slate-900"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-black text-slate-900 leading-none">Complete Report</h2>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Step {currentStep} of 3</span>
            </div>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Modern Progress Line */}
      <div className="flex h-1 bg-slate-50">
        {[1, 2, 3].map(s => (
          <div 
            key={s} 
            className={`flex-1 transition-all duration-700 ease-out ${s <= currentStep ? 'bg-blue-600' : 'bg-transparent'}`} 
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-8">
        {currentStep === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {getTranslation(currentLanguage, 'classification_title')}
              </h3>
              <p className="text-[12px] font-medium text-slate-500">
                {getTranslation(currentLanguage, 'classification_subtitle')}
              </p>
            </div>
            
            {/* Grid size restored to the larger version */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-2xl mx-auto">
              {Object.entries(CATEGORY_CONFIG).map(([cat, config]) => (
                <button
                  key={cat}
                  onClick={() => {
                    setFormData(p => ({ ...p, category: cat as IssueCategory }));
                    setError(null);
                  }}
                  className={`aspect-square flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl border-2 transition-all group active:scale-95 ${
                    formData.category === cat 
                      ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-100' 
                      : 'border-slate-50 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full mb-2 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110 ${config.bgIcon}`}>
                    <div className="scale-100 sm:scale-110">{config.symbol}</div>
                  </div>
                  <h4 className="text-[10px] sm:text-[11px] font-black text-slate-900 text-center leading-tight line-clamp-1 px-0.5">
                    {getTranslation(currentLanguage, `category_${cat.toLowerCase().replace(' ', '_')}`)}
                  </h4>
                </button>
              ))}
            </div>

            {formData.category === IssueCategory.OTHER && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  {getTranslation(currentLanguage, 'other_category_label')}
                </label>
                <input 
                  type="text"
                  placeholder={getTranslation(currentLanguage, 'other_category_placeholder')}
                  className="w-full h-10 px-4 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:border-blue-600 transition-all text-sm font-bold shadow-sm"
                  value={formData.otherCategory}
                  onChange={(e) => setFormData(p => ({ ...p, otherCategory: e.target.value }))}
                />
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Evidence Documentation</h3>
              <p className="text-[12px] font-medium text-slate-500">Provide visual proof for faster resolution.</p>
            </div>

            {isVerifyingImage ? (
              <div className="aspect-square w-full rounded-xl bg-slate-900 flex flex-col items-center justify-center space-y-4 shadow-xl">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                  <ShieldCheck className="absolute inset-0 m-auto w-6 h-6 text-blue-600 animate-pulse" />
                </div>
                <div className="text-center px-8">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">AI Verification</p>
                  <p className="text-sm font-bold text-white tracking-tight">Analyzing photo relevance...</p>
                </div>
              </div>
            ) : isCameraActive ? (
              <div className="space-y-4">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 border-2 border-blue-600 shadow-xl">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-6 flex justify-center">
                    <button 
                      onClick={capturePhoto}
                      className="w-16 h-16 bg-white rounded-full border-4 border-blue-600 flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
                    >
                      <div className="w-10 h-10 bg-blue-600 rounded-full"></div>
                    </button>
                  </div>
                </div>
                <button onClick={() => setIsCameraActive(false)} className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Cancel Session</button>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : formData.photo ? (
              <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-200 shadow-lg group">
                <img src={formData.photo} className="w-full h-full object-cover" alt="Captured Evidence" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button 
                    onClick={() => { setIsCameraActive(true); setFormData(p => ({ ...p, photo: null, aiAnalysis: null })); }}
                    className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-lg text-slate-600 hover:text-blue-600 transition-all active:scale-95"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Compact Upload Grid - Reduced height and padding */
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsCameraActive(true)}
                  className="flex flex-col items-center justify-center p-6 bg-slate-950 text-white rounded-2xl border border-white/10 shadow-2xl transition-all group active:scale-95 hover:bg-blue-600"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:bg-white group-hover:text-blue-600 transition-colors">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 group-hover:text-white transition-colors">Source</span>
                  <span className="text-xs font-bold uppercase tracking-tight">Camera</span>
                </button>
                
                <button 
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 bg-slate-950 text-white rounded-2xl border border-white/10 shadow-2xl transition-all group active:scale-95 hover:bg-blue-600"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:bg-white group-hover:text-blue-600 transition-colors">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 group-hover:text-white transition-colors">Select</span>
                  <span className="text-xs font-bold uppercase tracking-tight">Gallery</span>
                </button>
              </div>
            )}
            <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />

            {error && (
              <div className="mt-4 p-4 bg-rose-50 rounded-xl border border-rose-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button 
                    onClick={() => { setError(null); setIsCameraActive(true); }}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-rose-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-rose-700 hover:bg-rose-100 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Try Camera Again</span>
                  </button>
                  <button 
                    onClick={() => { setError(null); galleryInputRef.current?.click(); }}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-rose-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-rose-700 hover:bg-rose-100 transition-all"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Open Gallery</span>
                  </button>
                  <button 
                    onClick={() => { setError(null); setCurrentStep(1); }}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Change Category</span>
                  </button>
                  <button 
                    onClick={() => {
                      setFormData(p => ({ ...p, category: IssueCategory.OTHER, otherCategory: 'Unclassified Issue' }));
                      setError(null);
                    }}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Mark as Other</span>
                  </button>
                  <button 
                    onClick={() => {
                      setError("Manual review requested. Moving to next step...");
                      setTimeout(() => { setError(null); setCurrentStep(3); }, 1500);
                    }}
                    className="sm:col-span-2 flex items-center justify-center space-x-2 px-4 py-3 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Request Manual Review</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-24">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Final Summary</h3>
              <p className="text-[12px] font-medium text-slate-500">Review and finalize your report details.</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 shadow-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirmed Location</span>
              </div>
              <p className="text-xs font-bold text-slate-800 leading-relaxed line-clamp-2">
                {isGeocoding ? (
                  <span className="flex items-center space-x-2">
                    <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                    <span>Locating...</span>
                  </span>
                ) : localAddress.fullAddress || "Manual pin placed."}
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Describe Issue</label>
                <textarea 
                  placeholder="Brief context to help our team..."
                  className="w-full h-24 p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-600 focus:bg-white transition-all text-sm font-medium resize-none shadow-sm"
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Your Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="text"
                    placeholder="Anonymous"
                    className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:border-blue-600 transition-all text-sm font-bold"
                    value={formData.reporterName}
                    onChange={(e) => setFormData(p => ({ ...p, reporterName: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-white/5 flex items-start space-x-3 shadow-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-[11px] font-medium text-slate-300 leading-relaxed">
                <span className="text-white font-bold">AI Active.</span> Your report is being processed through automated verification systems.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modern Error Toast */}
      {error && (
        <div className="absolute bottom-24 left-4 right-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-3 text-rose-600 animate-in slide-in-from-bottom-2 z-[100] shadow-lg">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p className="text-[11px] font-black uppercase tracking-wider">{error}</p>
        </div>
      )}

      {/* Fixed Action Footer */}
      <div className="p-4 border-t border-slate-100 bg-white z-[110] backdrop-blur-md">
        <div className="flex space-x-2 max-w-2xl mx-auto">
          {currentStep > 1 && (
            <button 
              onClick={handleBack}
              disabled={submitting}
              className="w-14 h-14 flex items-center justify-center rounded-xl bg-slate-950 text-white border border-white/10 hover:bg-slate-800 transition-all shadow-xl active:scale-95 group shrink-0"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </div>
            </button>
          )}
          
          <button 
            onClick={currentStep === 3 ? handleFinalSubmit : handleNext}
            disabled={submitting || isVerifyingImage || (currentStep === 3 && isGeocoding)}
            className={`group flex-1 flex items-center space-x-3 px-6 h-14 bg-slate-950 text-white rounded-xl shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 border border-white/10 hover:bg-blue-600`}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:bg-white group-hover:text-blue-600 transition-colors shrink-0">
              {currentStep === 3 ? <Send className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </div>
            <div className="text-left flex-1 overflow-hidden">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Step {currentStep}: {currentStep === 3 ? 'Finalize' : 'Next'}</p>
              <p className="text-[11px] font-bold uppercase tracking-tight truncate">
                {submitting ? 'Syncing Data...' : currentStep === 3 ? 'Submit Report' : getTranslation(currentLanguage, 'continue_button')}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all ml-1 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};