'use client';

import { motion } from 'framer-motion';
import { CardTitle, CARD_FRAME_CLASS_NAME } from '@/components/AllCradsStyling';

type ScoreCardProps = {
  title: string;
  score: number;
  description: string;
};

export function ScoreCard({ title, score, description }: ScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`glass-card rounded-3xl border p-6 shadow-glass ${CARD_FRAME_CLASS_NAME}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <CardTitle className="text-sm uppercase tracking-[0.24em]">{title}</CardTitle>
          <p className="mt-3 text-3xl font-semibold text-slate-100">{score}/100</p>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950/70 text-xl font-semibold text-cyan-300">
          {score}
        </div>
      </div>
      <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-800">
        <div className="h-4 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500" style={{ width: `${score}%` }} />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">{description}</p>
    </motion.div>
  );
}
