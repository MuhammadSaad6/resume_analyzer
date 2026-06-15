'use client';

import jsPDF from 'jspdf';
import { ResumeAnalysisResult } from '@/types/analysis';

type DownloadReportButtonProps = {
  analysis: ResumeAnalysisResult;
  fileName: string;
};

export function DownloadReportButton({ analysis, fileName }: DownloadReportButtonProps) {
  const handleDownload = async () => {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const pageHeight = doc.internal.pageSize.getHeight();
    const bottomMargin = 18;
    const left = 18;
    const right = 192;
    const maxWidth = right - left;
    const top = 18;
    const lineHeight = 6;
    let cursorY = top;

    const newPage = () => {
      doc.addPage();
      cursorY = top;
    };

    const ensureSpace = (requiredHeight: number) => {
      if (cursorY + requiredHeight > pageHeight - bottomMargin) {
        newPage();
      }
    };

    const drawTitle = () => {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('Smart Resume Analyzer Report', left, cursorY);
      cursorY += 8;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated for ${analysis.profile.name || 'Unknown Candidate'}`, left, cursorY);
      cursorY += 6;
      doc.setTextColor(0);
      doc.setDrawColor(210);
      doc.line(left, cursorY, right, cursorY);
      cursorY += 8;
    };

    const drawSectionTitle = (title: string) => {
      ensureSpace(14);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(17, 24, 39);
      doc.text(title, left, cursorY);
      cursorY += 4;
      doc.setDrawColor(210);
      doc.line(left, cursorY, right, cursorY);
      cursorY += 6;
      doc.setTextColor(0);
      doc.setFont('Helvetica', 'normal');
    };

    const drawWrappedText = (text: string, indent = 0) => {
      const wrapped = doc.splitTextToSize(text, maxWidth - indent) as string[];
      ensureSpace(wrapped.length * lineHeight + 2);
      doc.text(wrapped, left + indent, cursorY);
      cursorY += wrapped.length * lineHeight;
    };

    const drawBullets = (items: string[]) => {
      if (items.length === 0) {
        drawWrappedText('Not found', 4);
        return;
      }

      items.forEach((item) => {
        const wrapped = doc.splitTextToSize(item, maxWidth - 8) as string[];
        ensureSpace(wrapped.length * lineHeight + 2);
        doc.text('•', left + 2, cursorY);
        doc.text(wrapped, left + 8, cursorY);
        cursorY += wrapped.length * lineHeight;
        cursorY += 1;
      });
    };

    drawTitle();

    drawSectionTitle('Candidate Profile');
    drawWrappedText(`Name: ${analysis.profile.name || 'Not found'}`);
    drawWrappedText(`Email: ${analysis.profile.email || 'Not found'}`);
    drawWrappedText(`Phone: ${analysis.profile.phone || 'Not found'}`);

    drawSectionTitle('Scores');
    drawWrappedText(`Resume Score: ${analysis.resumeScore}/100`);
    drawWrappedText(`ATS Score: ${analysis.atsScore}/100`);

    drawSectionTitle('Skills');
    drawBullets(analysis.profile.skills);

    drawSectionTitle('Experience');
    drawBullets(analysis.profile.experience);

    drawSectionTitle('Education');
    drawBullets(analysis.profile.education);

    drawSectionTitle('Strengths');
    drawBullets(analysis.strengths);

    drawSectionTitle('Weaknesses');
    drawBullets(analysis.weaknesses);

    drawSectionTitle('Missing Skills');
    drawBullets(analysis.missingSkills);

    drawSectionTitle('Job Match');
    drawBullets(
      Object.entries(analysis.jobMatch).map(([role, score]) => `${role.charAt(0).toUpperCase() + role.slice(1)}: ${score}%`)
    );

    drawSectionTitle('Improvement Suggestions');
    drawBullets(analysis.suggestions);

    doc.save(`${fileName}.pdf`);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(244,63,94,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:from-red-400 hover:via-rose-400 hover:to-orange-400"
    >
      Download PDF Report
    </button>
  );
}
