import React, { useCallback, useState } from 'react';
import { Upload, X, MousePointer2, Check } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  subLabel?: string;
  onImageSelect: (file: File | null) => void;
  selectedImage: File | null;
  id: string;
  variant?: 'light' | 'dark';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  label, 
  subLabel,
  onImageSelect, 
  selectedImage,
  id,
  variant = 'dark'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelect(null);
    setPreview(null);
  };

  return (
    <div className="w-full group/uploader">
      <div className="flex justify-between items-center mb-2.5">
        <label className="text-[11px] font-semibold tracking-wide uppercase text-zinc-400 flex items-center gap-2">
          {label}
        </label>
        {selectedImage && (
          <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
            <Check size={10} strokeWidth={3} /> Ready
          </span>
        )}
      </div>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById(id)?.click()}
        className={`
          relative w-full aspect-[3/1] transition-all duration-300 cursor-pointer overflow-hidden group rounded-lg
          ${isDragging 
            ? 'border-white bg-zinc-900 shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)]' 
            : preview 
              ? 'border-zinc-800 bg-black' 
              : 'border border-dashed border-zinc-800 hover:border-zinc-600 bg-black/40 hover:bg-zinc-900/40'}
        `}
      >
        {/* Technical Corner Markers */}
        {!preview && (
          <>
            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-zinc-700 transition-colors group-hover:border-zinc-400" />
            <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-zinc-700 transition-colors group-hover:border-zinc-400" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-zinc-700 transition-colors group-hover:border-zinc-400" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-zinc-700 transition-colors group-hover:border-zinc-400" />
          </>
        )}

        {/* Grid Background Pattern */}
        {!preview && (
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ 
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
              backgroundSize: '20px 20px' 
            }} 
          />
        )}

        <input
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />

        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
               <div className="flex gap-2">
                 <button 
                  onClick={(e) => { e.stopPropagation(); document.getElementById(id)?.click(); }}
                  className="px-3 py-1.5 bg-white text-black text-xs font-medium rounded hover:bg-zinc-200 transition-colors"
                 >
                   Replace
                 </button>
                 <button 
                  onClick={clearImage}
                  className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-700 rounded hover:border-zinc-500 transition-all"
                 >
                   <X size={14} />
                 </button>
               </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className={`
              mb-3 transition-all duration-300 p-3 rounded-full
              ${isDragging ? 'bg-zinc-800 text-white scale-110' : 'bg-zinc-900/50 text-zinc-600 group-hover:text-zinc-400 group-hover:bg-zinc-900'}
            `}>
              {isDragging ? <MousePointer2 size={20} /> : <Upload size={20} />}
            </div>
            <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
              <span className="hidden sm:inline">Drag & drop or</span> click to upload
            </p>
            {subLabel && (
              <p className="text-[10px] text-zinc-600 mt-1 font-mono tracking-wide uppercase">
                {subLabel}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};