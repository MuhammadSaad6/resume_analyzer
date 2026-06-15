'use client';

type ResumePreviewProps = {
  file: File | null;
};

export function ResumePreview({ file }: ResumePreviewProps) {
  return (
    <div className="glass-card flex h-full min-h-[260px] flex-col rounded-[2rem] border border-slate-400/10 p-6 shadow-glass">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Resume preview</p>
      <div className="mt-6 flex flex-1 flex-col justify-center rounded-3xl bg-[linear-gradient(180deg,rgba(2,6,23,0.92),rgba(15,23,42,0.88))] p-6 text-sm text-slate-300">
        {file ? (
          <>
            <p className="font-semibold text-slate-100">Selected file</p>
            <p className="mt-2">{file.name}</p>
            <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </>
        ) : (
          <p>No file selected yet. Upload a PDF resume to begin analysis.</p>
        )}
      </div>
    </div>
  );
}
