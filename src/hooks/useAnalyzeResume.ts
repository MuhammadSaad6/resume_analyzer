'use client';

import { AnalyzeResponse, ResumeAnalysisResult } from '@/types/analysis';

export async function analyzeResume(file: File): Promise<ResumeAnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: formData,
  });

  const responseText = await response.text();
  let parsedResponse: AnalyzeResponse | null = null;
  try {
    parsedResponse = JSON.parse(responseText) as AnalyzeResponse;
  } catch {
    // If the response is not JSON, use the raw text as error information.
  }

  if (!response.ok) {
    const errorMessage = (parsedResponse?.error ?? responseText) || 'Unable to analyze resume.';
    throw new Error(errorMessage);
  }

  if (!parsedResponse || !parsedResponse.success || !parsedResponse.data) {
    throw new Error(parsedResponse?.error ?? `Server returned invalid JSON: ${responseText}`);
  }

  return parsedResponse.data;
}
