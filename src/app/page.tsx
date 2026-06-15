'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UploadZone } from '@/components/UploadZone';
import { DownloadReportButton } from '@/components/DownloadReportButton';
import { ResumePreview } from '@/components/ResumePreview';
import { CardTitle } from '@/components/AllCradsStyling';
import { analyzeResume } from '@/hooks/useAnalyzeResume';
import type { ResumeAnalysisResult } from '@/types/analysis';
import toast, { Toaster } from 'react-hot-toast';

function SparklesIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 text-cyan-300">
      <path
        fill="currentColor"
        d="M12 2.75 13.9 8.1 19.25 10 13.9 11.9 12 17.25 10.1 11.9 4.75 10l5.35-1.9L12 2.75Zm7.75 10.5 1.15 3.25 3.25 1.15-3.25 1.15-1.15 3.25-1.15-3.25-3.25-1.15 3.25-1.15 1.15-3.25ZM4.5 14.5l.85 2.4 2.4.85-2.4.85-.85 2.4-.85-2.4-2.4-.85 2.4-.85.85-2.4Z"
      />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 animate-spin text-slate-950">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M20 12a8 8 0 0 0-8-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

function CheckBadgeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-emerald-300">
      <path fill="currentColor" d="M9.2 16.3 4.9 12l1.7-1.7 2.6 2.6 8.2-8.2L19 6.4l-9.8 9.9Z" />
    </svg>
  );
}

function ProfileValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-slate-950/80 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 break-words text-sm text-slate-100">{value || 'Not found'}</p>
    </div>
  );
}

function SectionList({ title, items, emptyMessage }: { title: string; items: string[]; emptyMessage: string }) {
  return (
    <div className="glass-card rounded-3xl border p-6 shadow-glass">
      <CardTitle className="text-sm uppercase tracking-[0.24em]">{title}</CardTitle>
      <div className="mt-5 space-y-3 text-sm text-slate-300">
        {items.length > 0 ? items.map((item, index) => <p key={index}>- {item}</p>) : <p>{emptyMessage}</p>}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const profileSectionRef = useRef<HTMLElement | null>(null);

  const handleFileAccepted = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setAnalysis(null);
  }, []);

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload a PDF first.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await analyzeResume(file);
      setAnalysis(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Analysis failed.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!analysis) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      profileSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [analysis]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Toaster position="top-right" />

      <div className="mb-10 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_28%),radial-gradient(circle_at_10%_10%,rgba(168,85,247,0.18),transparent_24%),linear-gradient(180deg,#021021,_#0f172a)] px-5 py-10 text-center shadow-glass sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3 rounded-full border border-cyan-400/25 bg-slate-950/55 px-4 py-2 backdrop-blur-md">
              <SparklesIcon />
              <span className="text-sm font-medium uppercase tracking-[0.26em] text-cyan-200/90">Smart Resume Analyzer</span>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex flex-col items-center gap-5">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl lg:text-6xl">
              <span className="block bg-gradient-to-r from-cyan-300 via-sky-200 to-emerald-200 bg-clip-text text-transparent">
                AI-powered CV extraction
              </span>
              <span className="block text-slate-100">with OpenAI for profile, score, and job matching.</span>
            </h1>
          </div>
        </div>
      </div>

      <section className="grid items-stretch gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="h-full space-y-8">
          <UploadZone onFileAccepted={handleFileAccepted} isAnalyzing={isLoading} />
          <div className="mt-4 grid gap-4 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-6">
            <button
              type="button"
              disabled={!file || isLoading}
              onClick={handleAnalyze}
              className="inline-flex w-fit items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 px-8 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_30px_rgba(56,189,248,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:from-cyan-400 hover:via-sky-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <span className="inline-flex items-center gap-2">
                {isLoading && <LoadingSpinner />}
                {isLoading ? 'Analyzing resume...' : 'Analyze Resume'}
              </span>
            </button>
            <p className="min-w-0 max-w-2xl self-center text-sm leading-6 text-slate-400">
              Upload a PDF to extract the full CV profile and review the role match.
            </p>
          </div>
        </div>

        <div className="h-full">
          <ResumePreview file={file} />
        </div>
      </section>

      {analysis && (
        <section ref={profileSectionRef} className="mt-24 space-y-8 md:mt-28">
          <div className="flex flex-col gap-4 rounded-[2rem] bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(15,23,42,0.72))] p-6 shadow-glass lg:flex-row lg:items-center lg:justify-between">
            <h2 className="bg-gradient-to-r from-slate-100 via-cyan-100 to-slate-200 bg-clip-text text-2xl font-semibold text-transparent">
              Extracted CV data and AI insights
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-gradient-to-r from-emerald-500/15 to-cyan-500/10 px-5 py-3 text-sm font-semibold text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.08),0_10px_24px_rgba(16,185,129,0.18)]"
              >
                <CheckBadgeIcon />
                Analysis complete
              </button>
              <DownloadReportButton analysis={analysis} fileName="resume-analysis-report" />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="glass-card rounded-3xl border p-6 shadow-glass">
              <CardTitle className="text-sm uppercase tracking-[0.24em]">Profile Extraction</CardTitle>
              <div className="mt-5 grid gap-4">
                <ProfileValue label="Name" value={analysis.profile.name} />
                <ProfileValue label="Email" value={analysis.profile.email} />
                <ProfileValue label="Phone" value={analysis.profile.phone} />
              </div>
              <div className="mt-6 grid gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {analysis.profile.skills.length > 0 ? (
                      analysis.profile.skills.map((skill, index) => (
                        <span key={index} className="rounded-full bg-slate-900/80 px-3 py-2 text-sm text-slate-100">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">Not found</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Experience</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-300">
                    {analysis.profile.experience.length > 0 ? analysis.profile.experience.map((item, index) => <p key={index}>- {item}</p>) : <p>Not found</p>}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Education</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-300">
                    {analysis.profile.education.length > 0 ? analysis.profile.education.map((item, index) => <p key={index}>- {item}</p>) : <p>Not found</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="glass-card rounded-3xl border p-6 shadow-glass">
                <CardTitle className="text-sm uppercase tracking-[0.24em]">Resume Score</CardTitle>
                <p className="mt-4 text-3xl font-semibold text-slate-100">{analysis.resumeScore}/100</p>
                <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-4 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500" style={{ width: `${analysis.resumeScore}%` }} />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  This score reflects resume clarity, achievements, format quality, and relevance to modern job applications.
                </p>
              </div>

              <div className="glass-card rounded-3xl border p-6 shadow-glass">
                <CardTitle className="text-sm uppercase tracking-[0.24em]">ATS Compatibility</CardTitle>
                <p className="mt-4 text-3xl font-semibold text-slate-100">{analysis.atsScore}/100</p>
                <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-4 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-400" style={{ width: `${analysis.atsScore}%` }} />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  An ATS score measures how well the resume can be parsed and matched by automated recruiting systems.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <SectionList
              title="Strengths"
              items={analysis.strengths}
              emptyMessage="No strengths identified yet. Add clearer achievements and impact statements."
            />
            <SectionList
              title="Weaknesses"
              items={analysis.weaknesses}
              emptyMessage="Resume appears strong. Keep refining achievement-driven content and certifications."
            />
            <SectionList
              title="Missing Skills"
              items={analysis.missingSkills}
              emptyMessage="No missing skills found. Resume is well-equipped for the evaluated roles."
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card rounded-3xl border p-6 shadow-glass">
              <CardTitle className="text-sm uppercase tracking-[0.24em]">Job Match</CardTitle>
              <div className="mt-6 grid gap-4">
                {Object.entries(analysis.jobMatch).map(([role, score]) => (
                  <div key={role} className="rounded-3xl bg-slate-950/80 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-100">{role.charAt(0).toUpperCase() + role.slice(1)}</p>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">{score}%</span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-3 rounded-full bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SectionList
              title="Improvement Suggestions"
              items={analysis.suggestions}
              emptyMessage="Resume is highly polished. Continue refining with measurable achievements and targeted keywords."
            />
          </div>
        </section>
      )}
    </main>
  );
}
