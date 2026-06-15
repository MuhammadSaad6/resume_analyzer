'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';

type UploadZoneProps = {
  onFileAccepted: (file: File) => void;
  isAnalyzing?: boolean;
};

type FormValues = {
  resumeFile: FileList;
};

export function UploadZone({ onFileAccepted, isAnalyzing = false }: UploadZoneProps) {
  const [highlighted, setHighlighted] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormValues>();

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file.');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast.error('PDF file must be under 8MB.');
        return;
      }
      onFileAccepted(file);
    },
    [onFileAccepted]
  );

  const onDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setHighlighted(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
      reset();
    }
  };

  const onSubmit = handleSubmit((values) => {
    const file = values.resumeFile?.[0];
    if (file) {
      handleFile(file);
      reset();
    }
  });

  return (
    <div className="relative flex h-full">
      <Toaster position="top-right" />
      <form onSubmit={onSubmit} className="flex h-full w-full">
        <label
          htmlFor="resumeFile"
          onDragOver={(event) => {
            event.preventDefault();
            setHighlighted(true);
          }}
          onDragLeave={() => setHighlighted(false)}
          onDrop={onDrop}
          className={`glass-card flex min-h-[260px] w-full flex-1 flex-col items-center justify-center gap-6 rounded-3xl border border-slate-400/10 px-6 py-10 text-center transition ${
            highlighted ? 'border-cyan-400/60 bg-cyan-500/10 shadow-glow' : 'bg-slate-950/60'
          }`}
        >
          <div className="max-w-xl">
            <p className="mb-2 text-lg font-semibold text-slate-100">Upload your resume</p>
            <p className="text-sm leading-6 text-slate-400">
              Drag and drop or browse a PDF file to analyze resume strength, ATS compatibility, missing skills, and role fit.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[auto_auto]">
            <span className="rounded-full bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2 text-sm text-slate-100 ring-1 ring-slate-500/10">
              Drag & Drop
            </span>
            <label
              htmlFor="resumeFile"
              className={`cursor-pointer rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_12px_24px_rgba(56,189,248,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:from-cyan-400 hover:via-sky-400 hover:to-blue-400 ${
                isAnalyzing ? 'pointer-events-none opacity-60 blur-[1px]' : ''
              }`}
            >
              Browse PDF
            </label>
          </div>
          <input
            id="resumeFile"
            type="file"
            accept="application/pdf"
            className="hidden"
            {...register('resumeFile')}
            disabled={isAnalyzing}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                handleFile(file);
                reset();
              }
            }}
          />
        </label>
      </form>
    </div>
  );
}
