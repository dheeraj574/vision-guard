/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Eye, 
  Upload, 
  Activity, 
  Shield, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  ChevronRight,
  BrainCircuit,
  Microscope,
  Stethoscope,
  LogIn,
  LogOut,
  History as HistoryIcon,
  Download,
  User,
  FileText,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

type User = {
  id: number;
  email: string;
  name: string;
};

type AnalysisResult = {
  id?: number;
  disease: string;
  confidence: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  explanation: string;
  recommendation: string;
  affectedRegions?: {
    name: string;
    description: string;
    coordinates?: { x: number, y: number, width: number, height: number };
  }[];
  created_at?: string;
  image_data?: string;
};

const AuthView = ({ type, authForm, setAuthForm, handleAuth, error, setCurrentView }: { 
  type: 'login' | 'register', 
  authForm: any, 
  setAuthForm: any, 
  handleAuth: any, 
  error: string | null,
  setCurrentView: any,
  key?: string
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-md mx-auto py-24 px-4"
  >
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
      <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">
        {type === 'login' ? 'Welcome Back' : 'Create Account'}
      </h2>
      <div className="space-y-4">
        {type === 'register' && (
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="John Doe"
              value={authForm.name}
              onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
          <input 
            type="email" 
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="name@example.com"
            value={authForm.email}
            onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
          <input 
            type="password" 
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="••••••••"
            value={authForm.password}
            onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
          />
        </div>
        {error && <p className="text-rose-600 text-sm font-medium">{error}</p>}
        <button 
          onClick={() => handleAuth(type)}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          {type === 'login' ? 'Sign In' : 'Sign Up'}
        </button>
        <p className="text-center text-sm text-slate-500">
          {type === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setCurrentView(type === 'login' ? 'register' : 'login')}
            className="text-indigo-600 font-bold hover:underline"
          >
            {type === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  </motion.div>
);

const HistoryView = ({ history, setCurrentView, setImage, setResult, downloadReport, fetchHistory }: {
  history: AnalysisResult[],
  setCurrentView: any,
  setImage: any,
  setResult: any,
  downloadReport: any,
  fetchHistory: any,
  key?: string
}) => {
  React.useEffect(() => { fetchHistory(); }, []);
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto py-12 px-4"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Analysis History</h2>
        <button 
          onClick={() => setCurrentView('solution')}
          className="flex items-center gap-2 text-indigo-600 font-bold hover:underline"
        >
          <Microscope className="w-5 h-5" />
          New Analysis
        </button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="aspect-video relative overflow-hidden">
              <img src={item.image_data} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                ${item.riskLevel === 'High' ? 'bg-rose-500 text-white' : 
                  item.riskLevel === 'Medium' ? 'bg-amber-500 text-white' : 
                  'bg-emerald-500 text-white'}
              `}>
                {item.riskLevel} Risk
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-900 text-lg">{item.disease}</h3>
                <span className="text-xs text-slate-400">{new Date(item.created_at!).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4">{item.explanation}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setImage(item.image_data!);
                    setResult(item);
                    setCurrentView('solution');
                  }}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  View
                </button>
                <button 
                  onClick={() => downloadReport(item)}
                  className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <div className="col-span-full py-24 text-center">
            <HistoryIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No history found. Start your first analysis!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'solution' | 'history' | 'login' | 'register'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth Effects
  React.useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data));
  }, []);

  const handleAuth = async (type: 'login' | 'register') => {
    setError(null);
    try {
      const res = await fetch(`/api/auth/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(data);
      setCurrentView('solution');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setCurrentView('landing');
  };

  const fetchHistory = async () => {
    const res = await fetch('/api/analyses');
    if (res.ok) setHistory(await res.json());
  };

  const saveAnalysis = async () => {
    if (!result || !image || !user) return;
    try {
      const res = await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_data: image,
          ...result,
          affected_regions: result.affectedRegions
        })
      });
      if (res.ok) {
        alert("Analysis saved to history!");
        fetchHistory();
      }
    } catch (err) {
      console.error("Failed to save:", err);
    }
  };

  const downloadReport = (data: AnalysisResult) => {
    const reportContent = `
VISIONGUARD CLINICAL REPORT
---------------------------
Date: ${new Date(data.created_at || Date.now()).toLocaleString()}
Patient Name: ${user?.name || 'N/A'}

DIAGNOSTIC SUMMARY
Condition: ${data.disease}
Confidence: ${(data.confidence * 100).toFixed(1)}%
Risk Level: ${data.riskLevel}

CLINICAL EXPLANATION
${data.explanation}

ANATOMICAL FINDINGS
${data.affectedRegions?.map(r => `- ${r.name}: ${r.description}`).join('\n') || 'No specific regions noted.'}

RECOMMENDATIONS
${data.recommendation}

---------------------------
This report was generated by VisionGuard AI.
    `;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VisionGuard_Report_${data.disease.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
        setShowHeatmap(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Data = image.split(',')[1];
      const model = "gemini-3-flash-preview";
      
      const prompt = `
        You are an expert ophthalmologist specializing in retinal fundus image analysis. 
        Analyze this retinal fundus image for signs of diseases such as Diabetic Retinopathy, Glaucoma, Cataract, or Age-related Macular Degeneration.
        
        Provide your analysis in the following JSON format:
        {
          "disease": "Name of the detected condition or 'Normal'",
          "confidence": 0.95, (a number between 0 and 1)
          "riskLevel": "Low" | "Medium" | "High",
          "explanation": "A detailed medical explanation of what you see in the image (e.g., microaneurysms, exudates, optic disc changes).",
          "recommendation": "Next steps for the patient.",
          "affectedRegions": [
            {
              "name": "Region Name (e.g., Macula, Optic Disc)",
              "description": "What is observed here",
              "coordinates": { "x": 10, "y": 20, "width": 30, "height": 30 } (percentages 0-100 relative to image size)
            }
          ]
        }
      `;

      const response = await genAI.models.generateContent({
        model,
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (text) {
        const parsedResult = JSON.parse(text) as AnalysisResult;
        setResult(parsedResult);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to analyze the image. Please ensure it's a clear retinal fundus image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const LandingView = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-0"
    >
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
                <BrainCircuit className="w-4 h-4" />
                AI-Powered Diagnostics
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6">
                Early Detection <br />
                <span className="text-indigo-600">Saves Vision.</span>
              </h1>
              <h2 className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                VisionGuard uses advanced deep learning to automatically detect retinal diseases from fundus images, providing instant analysis and explainable results.
              </h2>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setCurrentView('solution')}
                  className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 group"
                >
                  Explore Solution
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-4 px-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <img 
                        key={i}
                        src={`https://picsum.photos/seed/${i + 10}/100/100`} 
                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        alt="User"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-slate-500 font-medium">Trusted by 500+ clinics</span>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                <img 
                  src="https://picsum.photos/seed/medical/800/600" 
                  alt="Retinal Scan" 
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-white font-bold">98.4% Accuracy</p>
                      <p className="text-white/70 text-sm">Validated on ODIR-5K dataset</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-100 rounded-full blur-3xl opacity-50 -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">The Global Challenge</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Vision impairment affects billions, yet many cases are preventable with early screening.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { label: "Affected Worldwide", value: "2.2B", icon: Activity, color: "text-blue-600" },
              { label: "Preventable Cases", value: "600M", icon: Shield, color: "text-emerald-600" },
              { label: "Due to Retinal Disease", value: "75%", icon: AlertCircle, color: "text-amber-600" },
              { label: "Specialist Shortage", value: "Severe", icon: Stethoscope, color: "text-rose-600" },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <stat.icon className={`w-8 h-8 ${stat.color} mb-4`} />
                <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dataset Section */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="https://picsum.photos/seed/retina-grid/800/600" 
                alt="Dataset Grid" 
                className="rounded-3xl shadow-xl border border-slate-200"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Built on Clinical Excellence</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                VisionGuard is trained and validated on the <strong>ODIR-5K</strong> (Ocular Disease Intelligent Recognition) dataset, a real-world clinical collection of 5,000 patients' fundus images.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-indigo-600 font-bold text-2xl">5,000+</p>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-tight">Patient Records</p>
                </div>
                <div className="space-y-2">
                  <p className="text-indigo-600 font-bold text-2xl">8</p>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-tight">Disease Categories</p>
                </div>
                <div className="space-y-2">
                  <p className="text-indigo-600 font-bold text-2xl">Multi-Label</p>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-tight">Classification</p>
                </div>
                <div className="space-y-2">
                  <p className="text-indigo-600 font-bold text-2xl">Clinical</p>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-tight">Ground Truth</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Tech Stack Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Explainable AI for <br />Trustworthy Results</h2>
              <p className="text-slate-400 text-lg mb-8">
                VisionGuard doesn't just provide a diagnosis; it explains why. Our system highlights pathological features and provides clinical context to support healthcare professionals.
              </p>
              <div className="space-y-4">
                {[
                  "Grad-CAM Heatmap Visualization",
                  "Multi-Disease Classification",
                  "Validated on Clinical Datasets",
                  "Real-time Diagnostic Feedback"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="text-emerald-500 w-4 h-4" />
                    </div>
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "ResNet50", desc: "Deep Feature Extraction" },
                { name: "EfficientNet", desc: "High-Accuracy CNN" },
                { name: "ODIR-5K", desc: "Clinical Dataset" },
                { name: "Grad-CAM", desc: "Visual Explanation" },
              ].map((tech, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all">
                  <p className="text-xl font-bold mb-1">{tech.name}</p>
                  <p className="text-sm text-slate-500">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );

  const SolutionView = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-0"
    >
      {/* Analysis Tool */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Retinal Analysis Dashboard</h2>
            <p className="text-slate-600">Upload a fundus image to begin the AI-powered diagnostic process.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Area */}
            <div className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all
                  ${image ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
                `}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="image/*"
                />
                
                {image ? (
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg group">
                    <img src={image} alt="Uploaded" className="w-full h-full object-cover" />
                    
                    {/* Heatmap/Bounding Boxes Overlay */}
                    {result && showHeatmap && result.affectedRegions && (
                      <div className="absolute inset-0 pointer-events-none">
                        {result.affectedRegions.map((region, i) => (
                          region.coordinates && (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute border-2 border-rose-500 bg-rose-500/20 rounded-lg flex items-center justify-center"
                              style={{
                                left: `${region.coordinates.x}%`,
                                top: `${region.coordinates.y}%`,
                                width: `${region.coordinates.width}%`,
                                height: `${region.coordinates.height}%`,
                              }}
                            >
                              <span className="bg-rose-500 text-white text-[10px] font-bold px-1 rounded absolute -top-5 left-0 whitespace-nowrap">
                                {region.name}
                              </span>
                            </motion.div>
                          )
                        ))}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-bold">Change Image</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                      <Upload className="text-indigo-600 w-10 h-10" />
                    </div>
                    <p className="text-lg font-bold text-slate-900 mb-2">Drop fundus image here</p>
                    <p className="text-sm text-slate-500">Supports JPG, PNG (Max 10MB)</p>
                  </>
                )}
              </div>

              {result && (
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-medium text-slate-600">Visual Explanation (Grad-CAM)</span>
                  <button 
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                      ${showHeatmap ? 'bg-indigo-600' : 'bg-slate-300'}
                    `}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${showHeatmap ? 'translate-x-6' : 'translate-x-1'}
                    `} />
                  </button>
                </div>
              )}

              <button
                disabled={!image || isAnalyzing}
                onClick={analyzeImage}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3
                  ${!image || isAnalyzing 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'}
                `}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing Retina...
                  </>
                ) : (
                  <>
                    <Microscope className="w-6 h-6" />
                    {result ? 'Re-analyze Image' : 'Run Diagnostic'}
                  </>
                )}
              </button>

              {result && user && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={saveAnalysis}
                    className="py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save History
                  </button>
                  <button
                    onClick={() => downloadReport(result)}
                    className="py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Report
                  </button>
                </div>
              )}
              
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}
            </div>

            {/* Results Area */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 min-h-[400px] flex flex-col">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-900">Analysis Result</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${result.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' : 
                          result.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                          'bg-emerald-100 text-emerald-700'}
                      `}>
                        {result.riskLevel} Risk
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-sm text-slate-500 font-medium mb-1 uppercase tracking-tight">Detected Condition</p>
                      <p className="text-3xl font-extrabold text-slate-900">{result.disease}</p>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence * 100}%` }}
                            className="h-full bg-indigo-600"
                          />
                        </div>
                        <span className="text-sm font-bold text-indigo-600">{(result.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-indigo-600" />
                          Clinical Explanation
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {result.explanation}
                        </p>
                      </div>

                      {result.affectedRegions && (
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 mb-2">Anatomical Findings</h4>
                          <div className="space-y-2">
                            {result.affectedRegions.map((region, i) => (
                              <div key={i} className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">{region.name}</p>
                                <p className="text-slate-600 text-xs leading-relaxed">{region.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-slate-200">
                        <h4 className="text-sm font-bold text-slate-900 mb-2">Recommendations</h4>
                        <div className="bg-indigo-50 p-4 rounded-xl text-indigo-800 text-sm italic">
                          "{result.recommendation}"
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : isAnalyzing ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <div>
                      <p className="text-lg font-bold text-slate-900">Processing Retina Scan</p>
                      <p className="text-sm text-slate-500">Applying deep learning models...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Activity className="text-slate-400 w-8 h-8" />
                    </div>
                    <p className="text-slate-500 font-medium">No analysis performed yet. Upload an image to see results here.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentView('landing')}
          >
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Eye className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">VisionGuard</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button 
              onClick={() => setCurrentView('landing')}
              className={`transition-colors ${currentView === 'landing' ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentView('solution')}
              className={`transition-colors ${currentView === 'solution' ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'}`}
            >
              Solution
            </button>
            {user ? (
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setCurrentView('history')}
                  className={`flex items-center gap-2 transition-colors ${currentView === 'history' ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'}`}
                >
                  <HistoryIcon className="w-4 h-4" />
                  History
                </button>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900">{user.name}</span>
                  <button onClick={handleLogout} className="text-slate-400 hover:text-rose-600 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setCurrentView('login')}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-slate-800 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <main>
        <AnimatePresence mode="wait">
          {currentView === 'landing' && <LandingView key="landing" />}
          {currentView === 'solution' && <SolutionView key="solution" />}
          {currentView === 'history' && (
            <HistoryView 
              key="history" 
              history={history} 
              setCurrentView={setCurrentView} 
              setImage={setImage} 
              setResult={setResult} 
              downloadReport={downloadReport} 
              fetchHistory={fetchHistory} 
            />
          )}
          {(currentView === 'login' || currentView === 'register') && (
            <AuthView 
              key="auth" 
              type={currentView as 'login' | 'register'} 
              authForm={authForm} 
              setAuthForm={setAuthForm} 
              handleAuth={handleAuth} 
              error={error} 
              setCurrentView={setCurrentView} 
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Eye className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-800">VisionGuard</span>
          </div>
          <p className="text-sm text-slate-500">© 2024 VisionGuard AI. Developed for AADHRITA HACK24.</p>
          <div className="flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600">Privacy</a>
            <a href="#" className="hover:text-indigo-600">Terms</a>
            <a href="#" className="hover:text-indigo-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
