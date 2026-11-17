import React, { useState, useRef } from "react";
import { UploadCloud, File, X, CheckCircle2 } from "lucide-react";
import { Button } from "../common/Button.js";

export interface FileUploadZoneProps {
  onUpload: (file: File) => Promise<unknown>;
  isIngesting: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onUpload,
  isIngesting,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const ext = file.name.toLowerCase();
    if (ext.endsWith(".txt") || ext.endsWith(".md") || ext.endsWith(".markdown")) {
      setSelectedFile(file);
      setIsSuccess(false);
    } else {
      alert("Only .txt and .md files are supported");
    }
  };

  const handleIngest = async () => {
    if (!selectedFile) {
      return;
    }
    const result = await onUpload(selectedFile);
    if (result) {
      setIsSuccess(true);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setIsSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          isDragOver
            ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/20"
            : "border-slate-300 dark:border-slate-700 hover:border-brand-400 bg-slate-50/50 dark:bg-slate-900/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.markdown"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <UploadCloud className="w-8 h-8 mx-auto text-brand-500 mb-2" />
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Click to upload or drag & drop
        </p>
        <p className="text-[11px] text-slate-500 mt-1">Supports .md and .txt (up to 10MB)</p>
      </div>

      {selectedFile && (
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <File className="w-4 h-4 text-brand-500 flex-shrink-0" />
            <div className="truncate">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={handleClear}
            disabled={isIngesting}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isSuccess && (
        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>File successfully chunked and embedded!</span>
        </div>
      )}

      {selectedFile && (
        <Button
          onClick={handleIngest}
          isLoading={isIngesting}
          variant="primary"
          size="sm"
          className="w-full"
        >
          {isIngesting ? "Chunking & Vectorizing..." : "Ingest Selected File"}
        </Button>
      )}
    </div>
  );
};
