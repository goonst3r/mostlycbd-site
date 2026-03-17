import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadSimple, X } from '@phosphor-icons/react';
import { cn } from '../lib/utils';

interface ImageUploadProps {
  label: string;
  description?: string;
  onUpload?: (files: File[]) => void;
  maxFiles?: number;
}

export function ImageUpload({ label, description, onUpload, maxFiles = 4 }: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (newFiles: File[]) => {
    const remaining = maxFiles - files.length;
    const toAdd = newFiles.slice(0, remaining);
    const newPreviews = toAdd.map(file => URL.createObjectURL(file));

    const updatedFiles = [...files, ...toAdd];
    const updatedPreviews = [...previews, ...newPreviews];

    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onUpload?.(updatedFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onUpload?.(updatedFiles);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-sm font-semibold text-zinc-900 tracking-tight">{label}</h4>
        {description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatePresence>
          {previews.map((img, idx) => (
            <motion.div
              key={img}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
              className="relative aspect-square rounded-2xl overflow-hidden group bg-zinc-100 border border-zinc-200"
            >
              <img src={img} alt="Uploaded" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-md text-white transition-colors"
                >
                  <X weight="bold" size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {previews.length < maxFiles && (
          <motion.button
            layout
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              processFiles(Array.from(e.dataTransfer.files));
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors",
              isDragging
                ? "border-zinc-400 bg-zinc-100 text-zinc-900"
                : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-600"
            )}
          >
            <div className="p-3 bg-zinc-50 rounded-full">
              <UploadSimple weight="duotone" size={24} />
            </div>
            <span className="text-xs font-medium">Add Photo</span>
          </motion.button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );
}
