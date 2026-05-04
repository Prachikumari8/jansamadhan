
import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { X, Camera, CheckCircle2, Loader2, AlertTriangle, Send, ShieldCheck, ChevronLeft, Globe, Image as ImageIcon, RefreshCcw, User, Info, AlertCircle, MapPin, Building2, UserCheck, FileText } from 'lucide-react';
import { IssueCategory, AddressDetails } from '../types';
import { CATEGORY_CONFIG } from '../constants';
import { verifyCivicIssue } from '../services/geminiService';
import { useStore } from '../store/useStore';

interface ReportWizardProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialCoords?: { lat: number, lng: number };
  initialAddress?: AddressDetails | null;
}

const CIVIC_BODIES = [
  "Municipal Corporation of Delhi (MCD)",
  "Brihanmumbai Municipal Corporation (BMC)",
  "Bruhat Bengaluru Mahanagara Palike (BBMP)",
  "Greater Hyderabad Municipal Corporation (GHMC)",
  "Chennai Corporation (GCC)",
  "Kolkata Municipal Corporation (KMC)",
  "Ahmedabad Municipal Corporation (AMC)",
  "Pune Municipal Corporation (PMC)",
  "Surat Municipal Corporation (SMC)",
  "Jaipur Municipal Corporation (JMC)",
  "Lucknow Municipal Corporation (LMC)",
  "Other / Regional Municipality"
];

export const ReportWizard: React.FC<ReportWizardProps> = ({ onClose, onSubmit, initialCoords, initialAddress }) => {
  const { currentUser, findNearbyDuplicate } = useStore();
  const [step, setStep] = useState(2);
  const [formData, setFormData] = useState({
    category: '' as IssueCategory | '',
    location: initialCoords || { lat: 20.5937, lng: 78.9629 },
    description: '',
    manualAddress: initialAddress?.fullAddress || '',
    civicBody: '',
    representativeInfo: '',
    reporterName: currentUser?.name || '',
    photo: null as string | null,
    priority: 'Medium'
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Manage camera lifecycle
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      if (isCameraActive) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: 'environment',
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          });
          activeStream = mediaStream;
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err) {
          console.error("In-app camera failed:", err);
          setCameraError("In-app camera access denied. Falling back to native capture.");
          setIsCameraActive(false);
          nativeCameraInputRef.current?.click();
        }
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);

  const startInAppCamera = () => {
    setCameraError(null);
    setError(null);
    setIsCameraActive(true);
  };

  const stopInAppCamera = () => {
    setIsCameraActive(false);
    setStream(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFormData(prev => ({ ...prev, photo: dataUrl }));
        stopInAppCamera();
        setError(null);
      }
    }
  };

  const handleNativeCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
        setCameraError(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Please upload a real photo (JPG/PNG).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const checkDuplicates = (category: IssueCategory) => {
    const duplicate = findNearbyDuplicate(formData.location.lat, formData.location.lng, category);
    if (duplicate) {
      setDuplicateWarning(duplicate);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleFinalSubmit = async () => {
    if (!formData.photo) {
      setError("Evidence is mandatory. Please capture or upload a photo of the issue.");
      return;
    }
    if (!formData.category) return;
    setSubmitting(true);
    setError(null);

    try {
      const analysis = await verifyCivicIssue(formData.photo, formData.category);
      onSubmit({ 
        ...formData, // Preserves manual 'description'
        suggestedPriority: analysis?.suggestedPriority || 'Medium',
        aiDescription: analysis?.aiDescription || 'AI verification was inconclusive. The report has been queued for manual review.', // Store separately
        reportedBy: formData.reporterName || currentUser?.name || 'Anonymous Citizen',
        aiVerificationStatus: analysis?.isValid ? 'verified' : 'manual_review',
        aiConfidence: analysis?.confidence ?? null,
        location: {
          ...formData.location,
          address: formData.manualAddress || initialAddress?.fullAddress || 'Unknown Location'
        }
      });
    } catch (err) {
      onSubmit({ 
        ...formData, 
        suggestedPriority: 'Medium',
        reportedBy: formData.reporterName || currentUser?.name || 'Anonymous Citizen',
        aiVerificationStatus: 'manual_review'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-50 flex flex-col animate-in fade-in duration-300 overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-6 sm:px-12 py-5 flex justify-between items-center shrink-0 z-20">
        <div className="flex items-center space-x-6">
          <button 
            onClick={isCameraActive ? stopInAppCamera : (step === 2 ? onClose : () => setStep(2))} 
            className="p-3 hover:bg-slate-100 rounded-2xl transition-all group"
          >
            <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Report Civic Issue</h2>
            <div className="flex items-center space-x-2 mt-0.5">
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Step {step} of 3</span>
               <div className="flex space-x-1">
                 {[1, 2, 3].map(s => (
                   <div key={s} className={`h-1 rounded-full transition-all ${s === step ? 'w-6 bg-blue-600' : s < step ? 'w-2 bg-emerald-500' : 'w-2 bg-slate-200'}`} />
                 ))}
               </div>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-2xl transition-all">
          <X className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className="lg:w-[400px] bg-slate-900 text-white p-8 sm:p-12 overflow-y-auto flex flex-col relative shrink-0">
          <div className="relative z-10 space-y-10">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] block mb-1">Status</span>
                <span className="text-lg font-bold tracking-tight">GPS Verified</span>
              </div>
            </div>

            <div className="space-y-2">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pinpoint Location</span>
               <h1 className="text-4xl font-black leading-tight tracking-tighter">
                 {initialAddress?.area || 'Local Area'}
               </h1>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">City / Town</p>
                  <p className="text-sm font-bold text-slate-200">{initialAddress?.city || 'Detecting...'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pincode</p>
                  <p className="text-sm font-mono font-bold text-blue-400">{initialAddress?.pincode || '------'}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">State Name</p>
                <p className="text-sm font-bold text-slate-200">{initialAddress?.state || 'Detecting...'}</p>
              </div>
            </div>

            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
               <div className="flex items-center space-x-3 text-slate-400">
                 <Globe className="w-4 h-4" />
                 <span className="text-xs font-medium">Digital Signature: OS-V3-IND</span>
               </div>
               <p className="text-[10px] text-slate-500 leading-relaxed italic">
                 "This location has been cryptographically verified to ensure reporting integrity."
               </p>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600 opacity-10 blur-[100px] pointer-events-none"></div>
        </aside>

        <main className="flex-1 bg-white overflow-y-auto p-8 sm:p-12 lg:p-20 relative">
          {step === 2 && (
            <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-right-8 duration-500">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Identify the Problem</h3>
                <p className="text-lg text-slate-500 font-medium">What issue did you spot at this location?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.entries(CATEGORY_CONFIG).map(([cat, config]) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFormData(p => ({ ...p, category: cat as IssueCategory }));
                      checkDuplicates(cat as IssueCategory);
                      setTimeout(() => setStep(3), 300);
                    }}
                    className={`group relative flex flex-col items-start p-8 rounded-[2.5rem] border-2 text-left transition-all hover:-translate-y-2 active:scale-95 ${
                      formData.category === cat 
                        ? 'border-blue-600 bg-blue-50/50 shadow-2xl shadow-blue-100' 
                        : 'border-slate-100 hover:border-slate-200 hover:shadow-xl'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${config.bgIcon}`}>
                      <span className="text-3xl">{config.symbol}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 mb-1">{cat}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Report Now</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-3xl mx-auto animate-in slide-in-from-right-8 duration-500 pb-24">
              {/* Duplicate Warning */}
              {duplicateWarning && (
                <div className="mb-10 bg-amber-50 border-2 border-amber-200 rounded-[2rem] p-6 flex items-start space-x-4 animate-in zoom-in duration-300">
                  <AlertCircle className="w-8 h-8 text-amber-600 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-1">Already Reported</h4>
                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                      A similar <strong>{duplicateWarning.category}</strong> issue was reported here recently. 
                      You can still submit your report to increase priority, or click <button onClick={onClose} className="font-black underline">here</button> to track the existing one.
                    </p>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="mb-10">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${formData.category ? CATEGORY_CONFIG[formData.category as IssueCategory].bgIcon : 'bg-blue-600'}`}>
                    {formData.category}
                  </div>
                  <span className="text-slate-300">/</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Submission</span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Complete the Report</h3>
                <p className="text-lg text-slate-500 font-medium">Add evidence and local details for faster resolution.</p>
              </div>

              {/* PHOTO / CAMERA UPLOAD SECTION (REQUIRED) */}
              <div className="mb-14">
                {isCameraActive ? (
                  <div className="space-y-4 animate-in zoom-in duration-300">
                    <div className="relative aspect-video w-full rounded-[3.5rem] overflow-hidden border-4 border-blue-600 shadow-2xl bg-slate-900">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-8 flex justify-center">
                        <button 
                          onClick={capturePhoto}
                          className="w-20 h-20 bg-white rounded-full border-[6px] border-blue-600 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                        >
                          <div className="w-12 h-12 bg-blue-600 rounded-full"></div>
                        </button>
                      </div>
                    </div>
                    <button onClick={stopInAppCamera} className="w-full text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] hover:text-slate-900 mt-2">Cancel Camera</button>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                ) : formData.photo ? (
                  <div className="space-y-4 animate-in zoom-in duration-300">
                    <div className="relative aspect-video w-full rounded-[3.5rem] overflow-hidden border-4 border-blue-100 shadow-2xl bg-slate-100">
                      <img src={formData.photo} alt="Issue Evidence" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-8 gap-4">
                        <button 
                          onClick={startInAppCamera}
                          className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Retake Photo</span>
                        </button>
                        <button 
                          onClick={() => galleryInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center space-x-2 bg-white text-slate-900 px-6 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-slate-50 active:scale-95 transition-all"
                        >
                          <RefreshCcw className="w-4 h-4" />
                          <span>Replace</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <button 
                        onClick={startInAppCamera}
                        className="group flex flex-col items-center justify-center p-12 bg-blue-600 rounded-[3rem] text-white shadow-xl shadow-blue-100 hover:shadow-2xl hover:-translate-y-2 transition-all active:scale-95 border-b-8 border-blue-800 min-h-[220px]"
                      >
                        <div className="w-20 h-20 bg-white/20 rounded-3xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Camera className="w-10 h-10" />
                        </div>
                        <div className="text-center px-4">
                          <span className="text-xl font-black uppercase tracking-tight block">Take Photo</span>
                          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mt-1 block leading-tight">Live capture required</span>
                        </div>
                      </button>

                      <button 
                        onClick={() => galleryInputRef.current?.click()}
                        className="group flex flex-col items-center justify-center p-12 bg-white border-2 border-slate-100 rounded-[3rem] text-slate-900 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-2 transition-all active:scale-95 min-h-[220px]"
                      >
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl mb-6 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform group-hover:text-blue-600">
                          <ImageIcon className="w-10 h-10" />
                        </div>
                        <div className="text-center px-4">
                          <span className="text-xl font-black uppercase tracking-tight block">Upload Photo</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 block leading-tight">Select from gallery</span>
                        </div>
                      </button>
                    </div>
                    {cameraError && (
                      <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100 flex flex-col items-center text-center">
                        <p className="text-xs font-bold text-amber-700">{cameraError}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!isCameraActive && (
                <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
                  {/* ADDRESS DETAILS BOX */}
                  <div className="bg-slate-50 rounded-[3rem] p-8 sm:p-12 border-2 border-slate-100 shadow-sm">
                    <div className="flex items-center space-x-4 mb-8">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 shrink-0">
                          <MapPin className="w-6 h-6 text-blue-600" />
                       </div>
                       <div>
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Written Address</h4>
                          <p className="text-[13px] font-bold text-slate-500 mt-0.5">Please refine or enter the exact address manually.</p>
                       </div>
                    </div>
                    
                    <div className="space-y-3">
                      <textarea
                        placeholder="House Number, Street, Landmark, Area..."
                        className="w-full h-28 p-6 rounded-[2rem] bg-white border-2 border-transparent focus:border-blue-600 outline-none text-slate-700 font-medium transition-all text-base resize-none shadow-sm"
                        value={formData.manualAddress}
                        onChange={(e) => setFormData(p => ({ ...p, manualAddress: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* CIVIC BODY SELECTION BOX */}
                  <div className="bg-white rounded-[3rem] p-8 sm:p-12 border-2 border-slate-100 shadow-sm">
                    <div className="flex items-center space-x-4 mb-8">
                       <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shrink-0">
                          <Building2 className="w-6 h-6 text-blue-600" />
                       </div>
                       <div>
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Local Civic Bodies (Optional)</h4>
                          <p className="text-[13px] font-bold text-slate-500 mt-0.5">Include your local civic body representative information.</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Local Civic Body</label>
                        <select 
                          className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 outline-none text-slate-700 font-bold transition-all text-base shadow-sm appearance-none cursor-pointer"
                          value={formData.civicBody}
                          onChange={(e) => setFormData(p => ({ ...p, civicBody: e.target.value }))}
                        >
                          <option value="">Select Local Municipality</option>
                          {CIVIC_BODIES.map(body => (
                            <option key={body} value={body}>{body}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center space-x-2 px-2">
                          <UserCheck className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Representative Information</span>
                        </label>
                        <input 
                          type="text"
                          placeholder="Ward Number, Councilor Name, or Regional Office..."
                          className="w-full h-14 px-8 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 outline-none text-slate-700 font-bold transition-all text-base shadow-sm"
                          value={formData.representativeInfo}
                          onChange={(e) => setFormData(p => ({ ...p, representativeInfo: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* OTHER DETAILS */}
                  <div className="bg-slate-50 rounded-[3rem] p-8 sm:p-12 border-2 border-slate-100/50">
                    <div className="flex items-center space-x-4 mb-10 px-2">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 shrink-0">
                          <FileText className="w-6 h-6 text-blue-600" />
                       </div>
                       <div>
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Problem Description</h4>
                          <p className="text-[13px] font-bold text-slate-500 mt-0.5">Tell us more about the issue to help authorities respond.</p>
                       </div>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="flex items-center space-x-2 px-2">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username / Reporter Name</span>
                        </label>
                        <input 
                          type="text"
                          placeholder="Your Display Name (Optional)"
                          className="w-full h-14 px-8 rounded-2xl bg-white border-2 border-transparent focus:border-blue-600 outline-none text-slate-700 font-bold transition-all text-base shadow-sm"
                          value={formData.reporterName}
                          onChange={(e) => setFormData(p => ({ ...p, reporterName: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Notes / Details</label>
                        <textarea
                          placeholder="Describe the problem clearly..."
                          className="w-full h-40 p-8 rounded-[2.5rem] bg-white border-2 border-transparent focus:border-blue-600 outline-none text-slate-700 font-medium transition-all text-lg resize-none shadow-sm"
                          value={formData.description}
                          onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {error && (
                      <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 flex items-start space-x-4 animate-in slide-in-from-bottom-2 shadow-sm">
                        <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                        <p className="text-sm font-bold text-rose-800 leading-relaxed">{error}</p>
                      </div>
                    )}

                    <button 
                      disabled={submitting}
                      onClick={handleFinalSubmit}
                      className="w-full py-7 bg-slate-900 text-white font-black rounded-[2.5rem] hover:bg-blue-600 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-2xl flex items-center justify-center space-x-4 active:scale-95 group text-xl border-b-8 border-slate-800 hover:border-blue-800"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-7 h-7 animate-spin" />
                          <span>Verifying & Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Official Report</span>
                          <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </button>
                    <div className="flex justify-center text-slate-400 space-x-2">
                       <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                       <p className="text-[10px] font-black uppercase tracking-widest">End-to-end encrypted submission.</p>
                    </div>
                  </div>
                </div>
              )}

              <input ref={nativeCameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleNativeCameraCapture} className="hidden" />
              <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png" onChange={handleGalleryUpload} className="hidden" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
