'use client';

import { motion } from 'framer-motion';
import { CardTitle, CARD_FRAME_CLASS_NAME } from '@/components/AllCradsStyling';

type ATSCardProps = {
  score: number;
  recommendations: string[];
};

export function ATSCard({ score, recommendations }: ATSCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className={`glass-card rounded-3xl border p-6 shadow-glass ${CARD_FRAME_CLASS_NAME}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <CardTitle className="text-sm uppercase tracking-[0.24em]">ATS Compatibility</CardTitle>
          <p className="mt-3 text-3xl font-semibold text-slate-100">{score}/100</p>
        </div>
        <div className="rounded-3xl bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-100">
          Score
        </div>
      </div>
      <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-800">
        <div className="h-4 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-400" style={{ width: `${score}%` }} />
      </div>
      <div className="mt-5 space-y-3 text-sm text-slate-300">
        {recommendations.slice(0, 3).map((item, index) => (
          <p key={index}>• {item}</p>
        ))}
      </div>
    </motion.div>
  );
}
