'use client';

import { motion } from 'framer-motion';
import { CardTitle, CARD_FRAME_CLASS_NAME } from '@/components/AllCradsStyling';

type JobMatchCardProps = {
  role: string;
  score: number;
};

export function JobMatchCard({ role, score }: JobMatchCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.25 }}
      className={`glass-card rounded-3xl border p-6 shadow-glass ${CARD_FRAME_CLASS_NAME}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm uppercase tracking-[0.24em]">{role}</CardTitle>
          <p className="mt-3 text-2xl font-semibold text-slate-100">{score}% match</p>
        </div>
        <div className="rounded-3xl bg-slate-950/70 px-4 py-3 font-semibold text-slate-100">Fit</div>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
        <div className="h-3 rounded-full bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400" style={{ width: `${score}%` }} />
      </div>
    </motion.div>
  );
}
