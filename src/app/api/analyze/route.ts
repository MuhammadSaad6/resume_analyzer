import { NextResponse } from 'next/server';
import { extractTextFromPdf } from '@/lib/pdf-parser';
import { analyzeResumeText } from '@/lib/gemini';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let formData: FormData | null = null;

  try {
    formData = await request.formData();
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Request body must be form data.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ success: false, error: 'Please upload a PDF file.' }, { status: 400 });
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ success: false, error: 'Only PDF resumes are supported.' }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const text = await extractTextFromPdf(Buffer.from(arrayBuffer));

    if (!text.trim()) {
      return NextResponse.json({ success: false, error: 'The uploaded resume appears to be empty.' }, { status: 400 });
    }

    const analysis = await analyzeResumeText(text);
    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
