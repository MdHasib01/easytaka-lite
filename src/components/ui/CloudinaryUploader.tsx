import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { Button } from './Button';

interface CloudinaryUploaderProps {
  onUploadSuccess: (url: string) => void;
  defaultUrl?: string;
  label?: string;
  required?: boolean;
  folder?: string;
}

export const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  onUploadSuccess,
  defaultUrl = '',
  label = 'Upload Screenshot Proof',
  required = false,
  folder = 'esytaka_proofs',
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(defaultUrl);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-sync the preview when the caller's defaultUrl changes after mount —
  // e.g. an edit modal that stays mounted across opens for different records
  // and only updates its own "logoUrl" state via an effect one render later.
  useEffect(() => {
    setPreviewUrl(defaultUrl);
  }, [defaultUrl]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    // Create local object URL for instant preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = response.data.url;
      setPreviewUrl(uploadedUrl);
      onUploadSuccess(uploadedUrl);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to upload image to Cloudinary.';
      setUploadError(msg);
      setPreviewUrl('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl('');
    onUploadSuccess('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        {previewUrl && !isUploading && (
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Uploaded to Cloudinary
          </span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        accept="image/*"
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900/80 p-2">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-44 object-cover rounded-lg"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <span className="text-xs font-medium text-slate-200">Uploading to Cloudinary...</span>
            </div>
          )}
          {!isUploading && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<ImageIcon className="w-3.5 h-3.5" />}
              >
                Change
              </Button>
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-500 transition-colors shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
              : 'border-slate-700 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/80'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 text-indigo-400">
            {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
          </div>
          <p className="text-sm font-medium text-slate-200">
            {isUploading ? 'Uploading to Cloudinary...' : 'Click to upload screenshot or drag & drop'}
          </p>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
        </div>
      )}

      {uploadError && <p className="text-xs text-rose-400 mt-1">{uploadError}</p>}
    </div>
  );
};
