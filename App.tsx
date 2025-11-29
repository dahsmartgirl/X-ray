import React, { useState, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { generateMagicImage } from './utils/imageProcessor';
import { PreviewMode, GenerationMode } from './types';
import { Download, Moon, Sun, Monitor, AlertTriangle, ArrowLeft, MoreHorizontal, Grid, Layers, Command, Github, BadgeCheck, MapPin, Calendar, Link as LinkIcon, ScanLine, Wand2, Ruler, ShieldCheck, Palette } from 'lucide-react';

const TWITTER_WIDTH = 1500;
const TWITTER_HEIGHT = 500;

export default function App() {
  const [lightFile, setLightFile] = useState<File | null>(null);
  const [darkFile, setDarkFile] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>(PreviewMode.DARK);
  const [generationMode, setGenerationMode] = useState<GenerationMode>(GenerationMode.BLENDED);
  const [showSafeZones, setShowSafeZones] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced Generation
  useEffect(() => {
    if (!lightFile || !darkFile) {
        setGeneratedImage(null);
        return;
    }

    const process = async () => {
      setIsProcessing(true);
      setError(null);
      try {
        const lightUrl = URL.createObjectURL(lightFile);
        const darkUrl = URL.createObjectURL(darkFile);

        const result = await generateMagicImage(lightUrl, darkUrl, {
            width: TWITTER_WIDTH,
            height: TWITTER_HEIGHT,
            brightness: 0,
            mode: generationMode,
            normalize: true, // Always force normalization (Fix Ghosting) for better results
            preserveColor: false // Default to false (Grayscale) for Scanlines/Interlaced
        });
        setGeneratedImage(result.dataUrl);

        URL.revokeObjectURL(lightUrl);
        URL.revokeObjectURL(darkUrl);
      } catch (err) {
        console.error(err);
        setError("Failed to process images.");
      } finally {
        setIsProcessing(false);
      }
    };

    const timer = setTimeout(process, 200);
    return () => clearTimeout(timer);
  }, [lightFile, darkFile, generationMode]);

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.download = 'x-ray-header.png';
    link.href = generatedImage;
    link.click();
  };

  const getThemeStyles = () => {
    switch (previewMode) {
      case PreviewMode.LIGHT: 
        return { 
          bg: 'bg-[#FFFFFF]', 
          text: 'text-[#0F1419]', 
          subText: 'text-[#536471]',
          border: 'border-[#EFF3F4]',
          icon: 'text-[#0F1419]',
          avatarBorder: 'border-[#FFFFFF]',
          buttonPrimary: 'bg-[#0F1419] text-white',
          headerBg: 'bg-[#FFFFFF]', // Crucial for transparency preview
        };
      case PreviewMode.DIM: 
        return { 
          bg: 'bg-[#15202B]', 
          text: 'text-[#F7F9F9]', 
          subText: 'text-[#8B98A5]',
          border: 'border-[#38444D]',
          icon: 'text-[#F7F9F9]',
          avatarBorder: 'border-[#15202B]',
          buttonPrimary: 'bg-[#EFF3F4] text-[#0F1419]',
          headerBg: 'bg-[#15202B]',
        };
      case PreviewMode.DARK: 
        return { 
          bg: 'bg-[#000000]', 
          text: 'text-[#E7E9EA]', 
          subText: 'text-[#71767B]',
          border: 'border-[#2F3336]',
          icon: 'text-[#E7E9EA]',
          avatarBorder: 'border-[#000000]',
          buttonPrimary: 'bg-[#EFF3F4] text-[#0F1419]',
          headerBg: 'bg-[#000000]',
        };
      default: return { bg: '', text: '', subText: '', border: '', icon: '', avatarBorder: '', buttonPrimary: '', headerBg: '' };
    }
  };

  const theme = getThemeStyles();

  return (
    <div className="min-h-screen text-gray-200 font-sans selection:bg-white selection:text-black flex flex-col pb-20">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.02] blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-[0_0_15px_-3px_rgba(255,255,255,0.2)]">
                <Command size={16} className="text-black" />
            </div>
            <div className="flex flex-col leading-none gap-0.5">
               <span className="font-semibold text-sm tracking-tight text-white">X-Ray</span>
               <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">Studio v2.2</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <a 
                href="#" 
                className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-2 font-medium"
             >
                <Github size={14} />
                <span className="hidden sm:inline">Source Code</span>
             </a>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        
        {/* Hero Section */}
        <div className="mb-14 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tight mb-4 pb-2">
                Adaptive Social Assets.
            </h1>
            <p className="text-zinc-500 text-lg leading-relaxed">
                Create intelligent headers that shift between light and dark modes.
            </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Configuration */}
          <div className="lg:col-span-5 space-y-10">
            
            {/* Input Group */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500">Source Assets</h2>
                </div>
                
                <div className="space-y-6">
                    <ImageUploader 
                        id="light-upload" label="Light Mode Asset" subLabel="VISIBLE ON WHITE"
                        selectedImage={lightFile} onImageSelect={setLightFile} variant="light"
                    />
                    <ImageUploader 
                        id="dark-upload" label="Dark Mode Asset" subLabel="VISIBLE ON BLACK"
                        selectedImage={darkFile} onImageSelect={setDarkFile} variant="dark"
                    />
                </div>
            </div>

            {/* Settings Group */}
            <div className={`space-y-6 transition-all duration-500 ${lightFile && darkFile ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500">Blending Engine</h2>
                </div>

                <div className="space-y-4">
                    <div className="p-1 bg-zinc-900/50 rounded-lg border border-white/5 grid grid-cols-3 gap-1">
                         <button
                            onClick={() => setGenerationMode(GenerationMode.SCANLINES)}
                            className={`px-2 py-2.5 rounded-md text-[11px] font-medium transition-all flex flex-col items-center justify-center gap-1.5
                              ${generationMode === GenerationMode.SCANLINES 
                                ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' 
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                         >
                            <ScanLine size={16} />
                            Scanlines
                         </button>
                         <button
                            onClick={() => setGenerationMode(GenerationMode.INTERLACED)}
                            className={`px-2 py-2.5 rounded-md text-[11px] font-medium transition-all flex flex-col items-center justify-center gap-1.5
                              ${generationMode === GenerationMode.INTERLACED 
                                ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' 
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                         >
                            <Grid size={16} />
                            Checkerboard
                         </button>
                         <button
                            onClick={() => setGenerationMode(GenerationMode.BLENDED)}
                            className={`px-2 py-2.5 rounded-md text-[11px] font-medium transition-all flex flex-col items-center justify-center gap-1.5
                              ${generationMode === GenerationMode.BLENDED 
                                ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' 
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                         >
                            <Layers size={16} />
                            Color Blend
                         </button>
                    </div>
                    
                    <div className="px-1 min-h-[40px]">
                        {generationMode === GenerationMode.SCANLINES && (
                            <div className="flex items-start gap-2 text-zinc-500">
                                <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                                <p className="text-[12px] leading-relaxed">
                                    <strong className="text-zinc-300">Twitter Optimized.</strong> Uses horizontal lines to survive mobile resizing. Converts to grayscale for perfect hiding.
                                </p>
                            </div>
                        )}
                        {generationMode === GenerationMode.INTERLACED && (
                            <p className="text-[12px] leading-relaxed text-zinc-500">
                                Checkerboard pattern. Sharpest details on desktop. Converts to grayscale for perfect hiding.
                            </p>
                        )}
                        {generationMode === GenerationMode.BLENDED && (
                            <p className="text-[12px] leading-relaxed text-zinc-500">
                                Uses smart alpha blending (RMS). Preserves color saturation better than standard luminance. <span className="text-emerald-500">Auto-Level Active.</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>

             {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                    <AlertTriangle size={16} className="mt-0.5" />
                    <p>{error}</p>
                </div>
            )}
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-7 sticky top-24">
             <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500">Live Simulation</h2>
                
                <div className="flex items-center gap-3">
                   {/* Safe Zone Toggle */}
                   <button
                        onClick={() => setShowSafeZones(!showSafeZones)}
                        title="Toggle Safe Zone Guides"
                        className={`
                            h-7 px-3 rounded-full flex items-center gap-1.5 transition-all text-[11px] font-medium border
                            ${showSafeZones 
                                ? 'bg-amber-900/30 text-amber-400 border-amber-800' 
                                : 'bg-transparent text-zinc-500 border-zinc-800 hover:text-zinc-300'}
                        `}
                    >
                        <Ruler size={12} />
                        <span className="hidden sm:inline">Safe Zones</span>
                    </button>

                    {/* Theme Toggles */}
                    <div className="flex items-center gap-1 bg-zinc-900/80 rounded-full p-1 border border-white/5 backdrop-blur-sm">
                        {[
                            { mode: PreviewMode.LIGHT, icon: Sun },
                            { mode: PreviewMode.DIM, icon: Monitor },
                            { mode: PreviewMode.DARK, icon: Moon }
                        ].map((item) => (
                            <button
                                key={item.mode}
                                onClick={() => setPreviewMode(item.mode)}
                                className={`
                                    w-7 h-7 rounded-full flex items-center justify-center transition-all
                                    ${previewMode === item.mode 
                                        ? 'bg-zinc-700 text-white shadow-sm' 
                                        : 'text-zinc-500 hover:text-zinc-300'}
                                `}
                            >
                                <item.icon size={12} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Preview Card */}
            <div className="border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50 bg-black relative">
                
                {/* Glass Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-20 mix-blend-overlay"></div>

                {/* Simulated Twitter UI */}
                <div className={`w-full transition-colors duration-500 ${theme.bg}`}>
                    
                    {/* Header Image Area - 3:1 Aspect Ratio */}
                    <div className={`w-full aspect-[3/1] relative overflow-hidden group transition-colors duration-300 ${theme.headerBg}`}>
                        
                        {/* Safe Zone Overlay */}
                        {showSafeZones && (
                            <div className="absolute inset-0 z-40 pointer-events-none">
                                {/* Desktop Top Crop Risk (approx 15%) */}
                                <div className="absolute top-0 left-0 right-0 h-[15%] bg-red-500/10 border-b border-red-500/30 flex items-center justify-center">
                                    <span className="text-[9px] font-mono text-red-400 bg-black/50 px-1">DESKTOP CROP RISK</span>
                                </div>
                                
                                {/* Desktop Bottom Crop Risk (approx 15%) */}
                                <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-red-500/10 border-t border-red-500/30 flex items-center justify-center">
                                    <span className="text-[9px] font-mono text-red-400 bg-black/50 px-1">DESKTOP CROP RISK</span>
                                </div>

                                {/* Avatar Obstruction (Bottom Left) */}
                                <div className="absolute bottom-0 left-[2%] w-[24%] h-[60%] bg-red-500/20 border border-red-500/50 flex flex-col items-center justify-center text-center p-1 backdrop-blur-[1px]">
                                    <div className="bg-red-500/20 p-2 rounded-full mb-1"><AlertTriangle size={12} className="text-red-200"/></div>
                                    <span className="text-[10px] font-bold text-red-100 leading-tight shadow-sm">AVATAR<br/>OBSTRUCTION</span>
                                </div>

                                {/* Mobile UI Top Left */}
                                <div className="absolute top-[5%] left-[2%] w-[40px] h-[40px] rounded-full border border-yellow-500/50 flex items-center justify-center bg-yellow-500/10">
                                    <span className="text-[8px] text-yellow-200">BACK</span>
                                </div>
                                
                                {/* Mobile UI Top Right */}
                                <div className="absolute top-[5%] right-[2%] w-[40px] h-[40px] rounded-full border border-yellow-500/50 flex items-center justify-center bg-yellow-500/10">
                                    <span className="text-[8px] text-yellow-200">MENU</span>
                                </div>

                                {/* Safe Center Guide */}
                                <div className="absolute top-[15%] bottom-[15%] left-[26%] right-[5%] border border-dashed border-emerald-500/30 flex items-center justify-center">
                                    <span className="text-[10px] text-emerald-500/70 font-mono tracking-widest bg-black/50 px-2 rounded">SAFE ZONE</span>
                                </div>
                            </div>
                        )}

                        {/* Checkerboard underlay to prove transparency if needed, mainly debug but helpful */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" 
                             style={{backgroundImage: 'radial-gradient(#888 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>

                        {isProcessing ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/20 backdrop-blur-sm">
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            </div>
                        ) : generatedImage ? (
                            <img 
                                src={generatedImage} 
                                alt="Header Preview" 
                                className="w-full h-full object-cover relative z-10" 
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs text-zinc-500 font-mono uppercase tracking-widest opacity-50">Preview Area</span>
                            </div>
                        )}
                        
                        {/* Simulated UI Overlay (Back button) - Visual only, not safe zone */}
                        {!showSafeZones && (
                            <div className="absolute top-3 left-3 p-2 bg-black/60 backdrop-blur-md rounded-full text-white cursor-pointer hover:bg-black/80 transition-colors z-20">
                                <ArrowLeft size={16} />
                            </div>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="px-4 pb-4">
                        <div className="flex justify-between items-end -mt-[12%] sm:-mt-[10%] mb-3 relative z-30">
                             <div className={`w-[23%] aspect-square rounded-full border-[4px] ${theme.avatarBorder} bg-zinc-800 overflow-hidden relative shadow-lg`}>
                                <img src="https://api.dicebear.com/7.x/lorelei/svg?seed=Sarah&backgroundColor=1a1a1a" alt="Avatar" className="w-full h-full object-cover"/>
                             </div>
                             <div className="flex gap-2 mb-2 sm:mb-4">
                                <button className={`w-9 h-9 rounded-full border ${theme.border} flex items-center justify-center ${theme.icon} hover:bg-zinc-500/10 transition-colors`}>
                                    <MoreHorizontal size={18} />
                                </button>
                                <button className={`px-5 py-0 h-9 rounded-full font-bold text-[14px] transition-colors ${theme.buttonPrimary} hover:opacity-90`}>
                                    Follow
                                </button>
                             </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center gap-1">
                                    <h2 className={`text-xl font-extrabold leading-tight ${theme.text}`}>Magic Artist</h2>
                                    <div className="text-[#1D9BF0]"><BadgeCheck size={20} fill="#1D9BF0" className="text-white" /></div>
                                </div>
                                <p className={`text-[15px] ${theme.subText}`}>@XRayApp</p>
                            </div>
                            
                            <div className={`text-[15px] leading-snug ${theme.text}`}>
                                Building the future of digital assets. ✦ <br/>
                                This header adapts to your theme preference automatically.
                            </div>

                            <div className={`flex flex-wrap gap-x-4 gap-y-2 text-[15px] ${theme.subText}`}>
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} />
                                    <span>San Francisco, CA</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <LinkIcon size={16} />
                                    <a href="#" className="text-[#1D9BF0] hover:underline">magicheader.app</a>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    <span>Joined September 2024</span>
                                </div>
                            </div>

                            <div className={`flex gap-5 text-[14px] ${theme.subText}`}>
                                <span className="hover:underline cursor-pointer"><strong className={theme.text}>1,029</strong> Following</span>
                                <span className="hover:underline cursor-pointer"><strong className={theme.text}>8,921</strong> Followers</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="mt-8 flex justify-end">
                 <button
                    onClick={handleDownload}
                    disabled={!generatedImage || isProcessing}
                    className={`
                        group relative overflow-hidden rounded-full px-8 py-3 font-semibold text-sm transition-all duration-300
                        ${!generatedImage || isProcessing 
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50' 
                            : 'bg-white text-black hover:scale-[1.02] shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)]'}
                    `}
                >
                    <div className="relative z-10 flex items-center gap-2">
                        <Download size={16} className={!generatedImage ? '' : 'group-hover:animate-bounce'} />
                        Download Production Asset
                    </div>
                    {generatedImage && !isProcessing && (
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-shimmer" />
                    )}
                </button>
            </div>
            
             <p className="text-center text-[10px] text-zinc-600 mt-4 uppercase tracking-widest font-mono">
                1500 x 500px • PNG • Anti-Compression Enabled
             </p>

          </div>
        </div>
      </main>
    </div>
  );
}