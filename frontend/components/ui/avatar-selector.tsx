import React, { useRef, useState } from "react";
import { Camera, Trash2, UploadCloud } from "lucide-react";

interface AvatarSelectorProps {
  onFileSelect: (file: File | null) => void;
  onError: (message: string | null) => void;
}

export function AvatarSelector({ onFileSelect, onError }: AvatarSelectorProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      onError("Only JPG, JPEG, PNG, and WEBP formats are allowed.");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      onError("File size exceeds 5MB limit.");
      return false;
    }
    onError(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validateFile(file)) {
        onFileSelect(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (validateFile(file)) {
        onFileSelect(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative h-20 w-20 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer select-none transition-all overflow-hidden group ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border/60 hover:border-primary/50 hover:bg-secondary/40"
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Avatar Preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
              <Camera className="h-4 w-4" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground text-center p-2">
            <UploadCloud className="h-4 w-4 mb-0.5 text-muted-foreground/80 group-hover:text-primary transition-colors" />
            <span className="text-[9px] font-medium leading-tight">Optional</span>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
      />

      {preview && (
        <button
          type="button"
          onClick={removeImage}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive hover:underline cursor-pointer select-none"
        >
          <Trash2 className="h-3 w-3" /> Remove image
        </button>
      )}
    </div>
  );
}
