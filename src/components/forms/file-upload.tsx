"use client";

import { useCallback, useState, type DragEvent } from "react";
import { UploadCloud, FileImage, X } from "lucide-react";
import { cn } from "@/utils/cn";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  label?: string;
  helpText?: string;
}

export function FileUpload({ onFileSelected, accept = "image/*", label = "Sube la imagen del ticket", helpText }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      setPreview(URL.createObjectURL(file));
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setPreview(null);
    setFileName(null);
  };

  return (
    <div>
      {preview ? (
        <div className="relative overflow-hidden rounded-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={`Vista previa de ${fileName}`} className="max-h-96 w-full object-contain bg-muted" />
          <button
            onClick={clear}
            aria-label="Quitar imagen"
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
            isDragging ? "border-primary bg-primary-50 dark:bg-primary-900/20" : "border-border hover:bg-accent/50"
          )}
        >
          <UploadCloud className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-medium">{label}</span>
          {helpText && <span className="text-xs text-muted-foreground">{helpText}</span>}
          <input
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      )}
      {fileName && !preview && (
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <FileImage className="h-4 w-4" aria-hidden="true" /> {fileName}
        </div>
      )}
    </div>
  );
}
